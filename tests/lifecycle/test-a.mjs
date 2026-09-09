import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_USER_EMAIL;
const password = process.env.SUPABASE_TEST_USER_PASSWORD;
const setupKey = process.env.SUPABASE_TEST_SETUP_KEY;
const allowProduction = process.env.ALLOW_PRODUCTION_TEST === 'true';

if (!url || !anonKey || !email || !password) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_TEST_USER_EMAIL, or SUPABASE_TEST_USER_PASSWORD.');
}

const hostname = new URL(url).hostname;
const knownProductionProject = hostname === 'ojtmfokjcirvjvhnbnos.supabase.co';
if (knownProductionProject && !allowProduction) {
  throw new Error('Refusing to run lifecycle mutation test against the known production Supabase project. Use a disposable non-production target.');
}
if (knownProductionProject) {
  throw new Error('Production execution is permanently disabled for Test A. Provision a non-production target instead.');
}
if (!setupKey) {
  throw new Error('Missing SUPABASE_TEST_SETUP_KEY. Fixture setup requires a separate non-production admin/setup credential; the authenticated test client must still call only the public gateway.');
}

const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const setup = createClient(url, setupKey, { auth: { persistSession: false, autoRefreshToken: false } });

const createdLifeIds = [];
const testUserIds = [];

async function must(promise, label) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function cleanup() {
  if (createdLifeIds.length) {
    await setup.from('user_lives').delete().in('life_id', createdLifeIds);
    await setup.from('social_interactions').delete().or(`source_life_id.in.(${createdLifeIds.join(',')}),target_life_id.in.(${createdLifeIds.join(',')})`);
    await setup.from('relationships').delete().or(`life_a.in.(${createdLifeIds.join(',')}),life_b.in.(${createdLifeIds.join(',')})`);
    await setup.from('life_attributes').delete().in('life_id', createdLifeIds);
    await setup.from('life_emotions').delete().in('life_id', createdLifeIds);
    await setup.from('lives').delete().in('id', createdLifeIds);
  }
}

try {
  const { data: authData, error: authError } = await anon.auth.signInWithPassword({ email, password });
  if (authError || !authData.session || !authData.user) {
    throw new Error(`test authentication failed: ${authError?.message ?? 'no session returned'}`);
  }
  testUserIds.push(authData.user.id);

  const suffix = crypto.randomUUID().slice(0, 8);
  const lives = await must(
    setup.from('lives').insert([
      { name: `TEST_A_${suffix}_A`, status: 'alive' },
      { name: `TEST_A_${suffix}_B`, status: 'alive' }
    ]).select('id,name'),
    'create disposable lives'
  );
  createdLifeIds.push(...lives.map((life) => life.id));
  const [lifeA, lifeB] = createdLifeIds;

  await must(
    setup.from('user_lives').insert({ user_id: authData.user.id, life_id: lifeA }),
    'create ownership fixture'
  );

  const timestamp = new Date().toISOString();
  const rpcResult = await must(
    anon.rpc('execute_social_interaction', {
      p_source_life_id: lifeA,
      p_target_life_id: lifeB,
      p_interaction_type: 'socialize',
      p_occurred_at: timestamp
    }),
    'execute_social_interaction'
  );

  const interactions = await must(
    setup.from('social_interactions').select('id,source_life_id,target_life_id,interaction_type,outcome,relationship_delta').eq('source_life_id', lifeA).eq('target_life_id', lifeB),
    'read interaction assertion'
  );
  const relationships = await must(
    setup.from('relationships').select('id,life_a,life_b,relationship_type,strength,status').eq('status', 'active').or(`and(life_a.eq.${lifeA},life_b.eq.${lifeB}),and(life_a.eq.${lifeB},life_b.eq.${lifeA})`),
    'read relationship assertion'
  );

  const interaction = interactions.at(-1);
  const relationship = relationships.at(-1);

  if (interaction?.outcome !== 'neutral') throw new Error(`expected outcome=neutral, got ${interaction?.outcome}`);
  if (Number(interaction?.relationship_delta) !== 2) throw new Error(`expected relationship_delta=2, got ${interaction?.relationship_delta}`);
  if (relationship?.relationship_type !== 'acquaintance') throw new Error(`expected relationship_type=acquaintance, got ${relationship?.relationship_type}`);
  if (Number(relationship?.strength) !== 2) throw new Error(`expected relationship strength=2, got ${relationship?.strength}`);

  console.log(JSON.stringify({ ok: true, test: 'A-baseline', rpcResult, interaction, relationship }, null, 2));
} finally {
  await cleanup();
  await anon.auth.signOut();
}
