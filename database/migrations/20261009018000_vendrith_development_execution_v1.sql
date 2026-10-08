create table if not exists public.vendrith_development_execution_audit (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.vendrith_development_action_proposals(id) on delete cascade,
  approval_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('repository_write','database_write','deployment')),
  status text not null check (status in ('succeeded','failed')),
  result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists vendrith_development_execution_audit_proposal_idx
  on public.vendrith_development_execution_audit(proposal_id, created_at desc);

alter table public.vendrith_development_execution_audit enable row level security;

drop policy if exists "development execution audit own rows" on public.vendrith_development_execution_audit;
create policy "development execution audit own rows"
  on public.vendrith_development_execution_audit
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.vendrith_development_execution_audit from anon;
grant select on public.vendrith_development_execution_audit to authenticated;

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
  if p_status not in ('succeeded','failed') then raise exception 'invalid execution status'; end if;

  select p.user_id, p.action_type, p.status, p.approval_id
    into v_user_id, v_action_type, v_status, v_approval_id
    from public.vendrith_development_action_proposals p
   where p.id = p_proposal_id and p.user_id = auth.uid()
   for update;

  if v_user_id is null then raise exception 'development proposal not found'; end if;
  if v_status <> 'approved' then raise exception 'development proposal is not approved'; end if;
  if v_approval_id is null or v_approval_id <> p_approval_id then raise exception 'approval binding mismatch'; end if;

  update public.vendrith_development_action_proposals
     set status = case when p_status = 'failed' then 'failed' else 'approved' end,
         result = p_result, updated_at = now()
   where id = p_proposal_id and user_id = auth.uid()
     and status = 'approved' and approval_id = p_approval_id;

  if not found then raise exception 'development proposal update race'; end if;

  insert into public.vendrith_development_execution_audit(
    proposal_id, approval_id, user_id, action_type, status, result
  ) values (p_proposal_id, p_approval_id, auth.uid(), v_action_type, p_status, p_result);

  return query
  select p.id, p.status, p.approval_id, p.result
    from public.vendrith_development_action_proposals p
   where p.id = p_proposal_id and p.user_id = auth.uid();
end;
$$;

revoke all on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) from public;
grant execute on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) to authenticated;
