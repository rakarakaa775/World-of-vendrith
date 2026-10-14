-- Reconcile an interrupted AI runtime intent only when its durable journal proves execution.
-- This migration is local/review-only until explicitly applied by the project owner.

create table if not exists public.vendrith_runtime_intent_reconciliation_audit (
  id bigint generated always as identity primary key,
  intent_id uuid not null references public.vendrith_runtime_intents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  outcome text not null check (outcome in ('already_consumed','pending_no_journal','reconciled','mutation_conflict','world_unavailable','intent_not_reconcilable')),
  mutation_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists vendrith_runtime_intent_reconciliation_audit_intent_idx
  on public.vendrith_runtime_intent_reconciliation_audit(intent_id, created_at desc);
alter table public.vendrith_runtime_intent_reconciliation_audit enable row level security;
revoke all on public.vendrith_runtime_intent_reconciliation_audit from public, anon, authenticated;
create policy vendrith_runtime_intent_reconciliation_audit_select_own
  on public.vendrith_runtime_intent_reconciliation_audit for select to authenticated
  using (user_id = (select auth.uid()) and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
grant select on public.vendrith_runtime_intent_reconciliation_audit to authenticated;

create or replace function public.reconcile_vendrith_runtime_intent_v1(p_intent_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intent public.vendrith_runtime_intents%rowtype;
  v_world_id uuid;
  v_mutation record;
  v_checkpoint_sequence bigint;
  v_mutation_id text;
  v_expected_action jsonb;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then
    return jsonb_build_object('ok', false, 'code', 'AUTH_REQUIRED');
  end if;
  if p_intent_id is null then
    return jsonb_build_object('ok', false, 'code', 'INTENT_ID_REQUIRED');
  end if;

  select * into v_intent
    from public.vendrith_runtime_intents i
   where i.id = p_intent_id and i.user_id = auth.uid()
   for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'INTENT_NOT_FOUND');
  end if;
  v_mutation_id := 'runtime-intent:' || v_intent.id::text;

  if v_intent.status = 'consumed' then
    insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
    values(v_intent.id,auth.uid(),'already_consumed',v_mutation_id,jsonb_build_object('status',v_intent.status));
    return jsonb_build_object('ok',true,'status','consumed','alreadyConsumed',true,'result',v_intent.result);
  end if;
  if v_intent.status not in ('processing','failed') then
    insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
    values(v_intent.id,auth.uid(),'intent_not_reconcilable',v_mutation_id,jsonb_build_object('status',v_intent.status));
    return jsonb_build_object('ok',false,'code','INTENT_NOT_RECONCILABLE','status',v_intent.status);
  end if;

  -- context_id is the map ID for world/region/playable intents; only the map owner can reconcile.
  select m.world_id into v_world_id from public.maps m
   where m.id = v_intent.context_id and m.created_by = auth.uid();
  if not found or v_world_id is null then
    insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
    values(v_intent.id,auth.uid(),'world_unavailable',v_mutation_id,jsonb_build_object('contextType',v_intent.context_type));
    return jsonb_build_object('ok',false,'code','WORLD_UNAVAILABLE');
  end if;

  select l.sequence,l.mutation_id,l.mutation_type,l.mutation,l.state_version,l.state_hash,l.tick,l.user_id
    into v_mutation
    from public.world_runtime_mutation_log l
   where l.world_id = v_world_id and l.mutation_id = v_mutation_id;
  if not found then
    insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
    values(v_intent.id,auth.uid(),'pending_no_journal',v_mutation_id,jsonb_build_object('status',v_intent.status));
    return jsonb_build_object('ok',false,'code','RUNTIME_RECONCILIATION_PENDING','automaticRetry',false);
  end if;

  v_expected_action := coalesce(v_intent.action->'runtimeAction',v_intent.action);
  if v_mutation.user_id <> auth.uid()
     or v_mutation.mutation_type <> 'ai_runtime_intent'
     or v_mutation.mutation->>'intentId' <> v_intent.id::text
     or v_mutation.mutation->>'proposalId' <> v_intent.proposal_id::text
     or v_mutation.mutation->'action' is distinct from v_expected_action
     or coalesce(v_mutation.mutation->'context'->>'worldId','') <> v_world_id::text
     or coalesce(v_mutation.mutation->>'stateVersion','') <> v_mutation.state_version
     or coalesce(v_mutation.mutation->'state'->'state'->>'stateVersion','') <> v_mutation.state_version
     or coalesce(v_mutation.mutation->'state'->'state'->'clock'->>'tick','') <> v_mutation.tick::text then
    insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
    values(v_intent.id,auth.uid(),'mutation_conflict',v_mutation_id,jsonb_build_object('sequence',v_mutation.sequence,'mutationType',v_mutation.mutation_type));
    return jsonb_build_object('ok',false,'code','RUNTIME_MUTATION_CONFLICT');
  end if;

  select c.sequence into v_checkpoint_sequence from public.world_runtime_checkpoints c
   where c.world_id = v_world_id and c.user_id = auth.uid();
  update public.vendrith_runtime_intents
     set status = 'consumed', consumed_at = coalesce(consumed_at,now()),
         result = coalesce(result,'{}'::jsonb) || jsonb_build_object(
           'reconciled',true,'mutationId',v_mutation.mutation_id,'sequence',v_mutation.sequence,
           'stateVersion',v_mutation.state_version,'stateHash',v_mutation.state_hash,
           'verified',true,'checkpointSaved',coalesce(v_checkpoint_sequence >= v_mutation.sequence,false))
   where id = v_intent.id and user_id = auth.uid();
  insert into public.vendrith_runtime_intent_reconciliation_audit(intent_id,user_id,outcome,mutation_id,details)
  values(v_intent.id,auth.uid(),'reconciled',v_mutation_id,jsonb_build_object(
    'sequence',v_mutation.sequence,'stateVersion',v_mutation.state_version,
    'stateHash',v_mutation.state_hash,'checkpointSequence',v_checkpoint_sequence));
  return jsonb_build_object('ok',true,'status','consumed','reconciled',true,
    'mutationId',v_mutation.mutation_id,'sequence',v_mutation.sequence,
    'stateVersion',v_mutation.state_version,'stateHash',v_mutation.state_hash,
    'verified',true,'checkpointSaved',coalesce(v_checkpoint_sequence >= v_mutation.sequence,false));
end;
$$;
revoke all on function public.reconcile_vendrith_runtime_intent_v1(uuid) from public, anon;
grant execute on function public.reconcile_vendrith_runtime_intent_v1(uuid) to authenticated;
