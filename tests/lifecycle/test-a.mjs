import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_USER_EMAIL;
const password = process.env.SUPABASE_TEST_USER_PASSWORD;
const setupKey = process.env.SUPABASE_TEST_SETUP_KEY;

if (!url || !anonKey || !email || !password || !setupKey) {
  throw new Error('Missing required test environment variables.');
}

const hostname = new URL(url).hostname;
if (hostname === 'ojtmfokjcirvjvhnbnos.supabase.co') {
  throw new Error('Production execution is permanently disabled for Test A.');
}

const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const setupClient = createClient(url, setupKey, { auth: { persistSession: false, autoRefreshToken: false } });
const createdLifeIds = [];

async function must(promise, label) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function cleanup() {
  if (!createdLifeIds.length) return;
  const ids = createdLifeIds.join(',');
  const cleanupQueries = [
    ['user_lives', `life_id.in.(${ids})`],
    ['social_interactions', `source_life_id.in.(${ids})`],
    ['social_interactions', `target_life_id.in.(${ids})`],
    ['relationships', `life_a.in.(${ids})`],
    ['relationships', `life_b.in.(${ids})`],
    ['life_attributes', `life_id.in.(${ids})`],
    ['life_emotions', `life_id.in.(${ids})`],
    ['lives', `id.in.(${ids})`]
  ];
  for (const [table, filter] of cleanupQueries) {
    const { error } = await setupClient.from(table).delete().or(filter);
    if (error) console.warn(`cleanup ${table}: ${error.message}`);
  }
}

try {
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw new Error(`test authentication failed: ${error?.message ?? 'no session'}`);

  const suffix = crypto.randomUUID().slice(0, 8);
  const lives = await must(setupClient.from('lives').insert([
    { name: `TEST_A_${suffix}_A`, status: 'alive' },
    { name: `TEST_A_${suffix}_B`, status: 'alive' }
  ]).select('id,name'), 'create disposable lives');
  createdLifeIds.push(...lives.map(x => x.id));
  const [lifeA, lifeB] = createdLifeIds;

  await must(setupClient.from('user_lives').insert({ user_id: data.user.id, life_id: lifeA }), 'create ownership fixture');

  const rpcResult = await must(authClient.rpc('execute_social_interaction', {
    p_source_life_id: lifeA,
    p_target_life_id: lifeB,
    p_interaction_type: 'socialize',
    p_occurred_at: new Date().toISOString()
  }), 'execute_social_interaction');

  const interactionRows = await must(setupClient.from('social_interactions').select('id,source_life_id,target_life_id,interaction_type,outcome,relationship_delta').eq('source_life_id', lifeA).eq('target_life_id', lifeB), 'read interaction assertion');
  const relationshipRows = await must(setupClient.from('relationships').select('id,life_a,life_b,relationship_type,strength,status').eq('status', 'active').or(`and(life_a.eq.${lifeA},life_b.eq.${lifeB}),and(life_a.eq.${lifeB},life_b.eq.${lifeA})`), 'read relationship assertion');

  const interaction = interactionRows.at(-1);
  const relationship = relationshipRows.at(-1);
  if (interaction?.outcome !== 'neutral') throw new Error(`expected outcome=neutral, got ${interaction?.outcome}`);
  if (Number(interaction?.relationship_delta) !== 2) throw new Error(`expected relationship_delta=2, got ${interaction?.relationship_delta}`);
  if (relationship?.relationship_type !== 'acquaintance') throw new Error(`expected relationship_type=acquaintance, got ${relationship?.relationship_type}`);
  if (Number(relationship?.strength) !== 2) throw new Error(`expected relationship strength=2, got ${relationship?.strength}`);
  if (interactionRows.length !== 1) throw new Error(`expected exactly one interaction, got ${interactionRows.length}`);

  console.log(JSON.stringify({ ok: true, test: 'A-baseline', rpcResult, interaction, relationship }, null, 2));
} finally {
  await cleanup();
  await authClient.auth.signOut();
}
