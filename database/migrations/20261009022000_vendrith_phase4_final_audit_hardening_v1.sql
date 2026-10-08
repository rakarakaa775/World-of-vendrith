-- Phase 4.7 final-audit hardening:
-- 1) deny anonymous Supabase Auth users on Development AI persistence tables
-- 2) consume a Development AI approval binding after successful execution

drop policy if exists "development proposals own select" on public.vendrith_development_action_proposals;
create policy "development proposals own select"
  on public.vendrith_development_action_proposals
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  );

drop policy if exists "development proposals own insert" on public.vendrith_development_action_proposals;
create policy "development proposals own insert"
  on public.vendrith_development_action_proposals
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  );

drop policy if exists "development action audit own select" on public.vendrith_development_action_audit;
create policy "development action audit own select"
  on public.vendrith_development_action_audit
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  );

drop policy if exists "development execution audit own rows" on public.vendrith_development_execution_audit;
create policy "development execution audit own rows"
  on public.vendrith_development_execution_audit
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  );

create unique index if not exists vendrith_development_execution_audit_succeeded_once_idx
  on public.vendrith_development_execution_audit(proposal_id)
  where status = 'succeeded';

create or replace function public.finalize_vendrith_development_action_v1(
  p_proposal_id uuid,
  p_approval_id uuid,
  p_status text,
  p_result jsonb default null
)
returns table(proposal_id uuid, status text, approval_id uuid, result jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_action_type text;
  v_status text;
  v_approval_id uuid;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then
    raise exception 'authentication required';
  end if;
  if p_status not in ('succeeded','failed') then
    raise exception 'invalid execution status';
  end if;

  select p.user_id, p.action_type, p.status, p.approval_id
    into v_user_id, v_action_type, v_status, v_approval_id
    from public.vendrith_development_action_proposals p
   where p.id = p_proposal_id
     and p.user_id = auth.uid()
   for update;

  if v_user_id is null then
    raise exception 'development proposal not found';
  end if;
  if v_status <> 'approved' then
    raise exception 'development proposal is not approved';
  end if;
  if v_approval_id is null or v_approval_id <> p_approval_id then
    raise exception 'approval binding mismatch';
  end if;

  update public.vendrith_development_action_proposals
     set status = case when p_status = 'failed' then 'failed' else 'approved' end,
         approval_id = case when p_status = 'succeeded' then null else p_approval_id end,
         result = case
           when p_status = 'succeeded'
             then coalesce(p_result, '{}'::jsonb) || jsonb_build_object('approvalConsumed', true, 'approvalId', p_approval_id)
           else p_result
         end,
         updated_at = now()
   where id = p_proposal_id
     and user_id = auth.uid()
     and status = 'approved'
     and approval_id = p_approval_id;

  if not found then
    raise exception 'development proposal update race';
  end if;

  insert into public.vendrith_development_execution_audit(
    proposal_id, approval_id, user_id, action_type, status, result
  ) values (
    p_proposal_id, p_approval_id, auth.uid(), v_action_type, p_status, p_result
  );

  return query
  select p.id,
         p.status,
         p_approval_id,
         p.result
    from public.vendrith_development_action_proposals p
   where p.id = p_proposal_id
     and p.user_id = auth.uid();
end;
$$;

revoke all on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) from public;
revoke execute on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) from anon;
grant execute on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) to authenticated;
