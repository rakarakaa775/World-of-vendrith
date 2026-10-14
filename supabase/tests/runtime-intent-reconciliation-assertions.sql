\set ON_ERROR_STOP on
\set user 11111111-1111-4111-8111-111111111111
\set world bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
\set map aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
\set token ffffffff-ffff-4fff-8fff-ffffffffffff
\set intent 99999999-9999-4999-8999-999999999991
\set proposal 88888888-8888-4888-8888-888888888881
select set_config('request.jwt.claim.sub', :'user', false);
select set_config('request.jwt.claims', '{"sub":"' || :'user' || '","role":"authenticated","is_anonymous":false}', false);
insert into public.vendrith_creator_action_proposals(id,user_id,context_type,context_id,action,status)
values (:'proposal',:'user','world',:'map','{"runtimeAction":{"id":"action-1","type":"world.schedule_event"}}'::jsonb,'approved');
insert into public.vendrith_runtime_intents(id,user_id,proposal_id,context_type,context_id,action,status)
values (:'intent',:'user',:'proposal','world',:'map','{"runtimeAction":{"id":"action-1","type":"world.schedule_event"}}'::jsonb,'processing');
select acquired from public.acquire_world_runtime_lease_v1(:'world',:'token',60);
select sequence from public.append_world_runtime_mutation_batch_v1(
  :'world',
  jsonb_build_array(jsonb_build_object(
    'mutation_id','runtime-intent:' || :'intent',
    'mutation_type','ai_runtime_intent',
    'mutation',jsonb_build_object('context',jsonb_build_object('worldId',:'world'),'intentId',:'intent','proposalId',:'proposal','action',jsonb_build_object('id','action-1','type','world.schedule_event'),'stateVersion','reconcile:1','state',jsonb_build_object('state',jsonb_build_object('worldId',:'world','clock',jsonb_build_object('tick',1),'stateVersion','reconcile:1'),'entities','[]'::jsonb)),
    'domain_event',jsonb_build_object('type','runtime.intent.executed'),
    'state_version','reconcile:1','state_hash',repeat('a',64),'tick',1
  )), :'token'
);
insert into public.world_runtime_checkpoints(world_id,sequence,tick,state_version,state_hash,state,user_id)
values (:'world',1,1,'reconcile:1',repeat('a',64),'{"state":{"stateVersion":"reconcile:1"}}'::jsonb,:'user')
on conflict (world_id) do update set sequence=excluded.sequence,tick=excluded.tick,state_version=excluded.state_version,state_hash=excluded.state_hash,state=excluded.state,user_id=excluded.user_id;
do $$
declare r jsonb;
begin
  r := public.reconcile_vendrith_runtime_intent_v1('99999999-9999-4999-8999-999999999991');
  if r->>'ok' <> 'true' or r->>'status' <> 'consumed' or r->>'verified' <> 'true' or r->>'checkpointSaved' <> 'true' then
    raise exception 'RECONCILE_SUCCESS_ASSERTION_FAILED: %',r;
  end if;
  if (select status from public.vendrith_runtime_intents where id='99999999-9999-4999-8999-999999999991') <> 'consumed' then
    raise exception 'RECONCILE_STATUS_ASSERTION_FAILED';
  end if;
  r := public.reconcile_vendrith_runtime_intent_v1('99999999-9999-4999-8999-999999999991');
  if r->>'ok' <> 'true' or r->>'alreadyConsumed' <> 'true' then
    raise exception 'RECONCILE_IDEMPOTENCY_ASSERTION_FAILED: %',r;
  end if;
  if (select count(*) from public.vendrith_runtime_intent_reconciliation_audit where intent_id='99999999-9999-4999-8999-999999999991' and outcome in ('reconciled','already_consumed')) <> 2 then
    raise exception 'RECONCILE_AUDIT_ASSERTION_FAILED';
  end if;
end $$;

-- A processing intent without a journal must remain processing and must not be auto-retried.
insert into public.vendrith_creator_action_proposals(id,user_id,context_type,context_id,action,status)
values ('88888888-8888-4888-8888-888888888882',:'user','world',:'map','{"runtimeAction":{"id":"action-pending"}}'::jsonb,'approved');
insert into public.vendrith_runtime_intents(id,user_id,proposal_id,context_type,context_id,action,status)
values ('99999999-9999-4999-8999-999999999992',:'user','88888888-8888-4888-8888-888888888882','world',:'map','{"runtimeAction":{"id":"action-pending"}}'::jsonb,'processing');
do $$
declare r jsonb;
begin
  r := public.reconcile_vendrith_runtime_intent_v1('99999999-9999-4999-8999-999999999992');
  if r->>'code' <> 'RUNTIME_RECONCILIATION_PENDING' or r->>'automaticRetry' <> 'false' then
    raise exception 'RECONCILE_PENDING_ASSERTION_FAILED: %',r;
  end if;
  if (select status from public.vendrith_runtime_intents where id='99999999-9999-4999-8999-999999999992') <> 'processing' then
    raise exception 'RECONCILE_PENDING_CHANGED_STATUS';
  end if;
  if not exists (select 1 from public.vendrith_runtime_intent_reconciliation_audit where intent_id='99999999-9999-4999-8999-999999999992' and outcome='pending_no_journal') then
    raise exception 'RECONCILE_PENDING_AUDIT_MISSING';
  end if;
end $$;
select 'runtime intent reconciliation assertions passed' as result;
