create table if not exists public.vendrith_development_action_audit (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.vendrith_development_action_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('repository_write','database_write','deployment')),
  decision text not null check (decision in ('approved','rejected','failed')),
  action jsonb not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.vendrith_development_action_audit enable row level security;

create policy "development action audit own select"
  on public.vendrith_development_action_audit for select
  to authenticated using ((select auth.uid()) = user_id);

revoke all on public.vendrith_development_action_audit from anon;
grant select on public.vendrith_development_action_audit to authenticated;

create or replace function public.approve_vendrith_development_action_v1(p_proposal_id uuid)
returns table(
  proposal_id uuid,
  status text,
  approval_id uuid,
  action_type text,
  action jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_proposal public.vendrith_development_action_proposals%rowtype;
  v_approval_id uuid;
begin
  if v_user_id is null or (auth.jwt()->>'is_anonymous') = 'true' then
    raise exception 'authentication required';
  end if;

  select *
    into v_proposal
    from public.vendrith_development_action_proposals
   where id = p_proposal_id
     and user_id = v_user_id
   for update;

  if not found then
    raise exception 'proposal not found';
  end if;

  if v_proposal.status <> 'pending' then
    raise exception 'proposal is not pending';
  end if;

  if v_proposal.action_type not in ('repository_write','database_write','deployment') then
    raise exception 'unsupported development action type';
  end if;

  if jsonb_typeof(v_proposal.action) <> 'object' then
    raise exception 'action must be an object';
  end if;

  if v_proposal.rationale is null or length(trim(v_proposal.rationale)) = 0 then
    raise exception 'rationale required';
  end if;

  v_approval_id := gen_random_uuid();

  update public.vendrith_development_action_proposals
     set status = 'approved',
         approval_id = v_approval_id,
         result = jsonb_build_object(
           'approvedAt', now(),
           'approvalId', v_approval_id,
           'execution', 'not_connected'
         ),
         updated_at = now()
   where id = v_proposal.id
     and user_id = v_user_id
     and status = 'pending';

  if not found then
    raise exception 'proposal approval race detected';
  end if;

  insert into public.vendrith_development_action_audit(
    proposal_id,user_id,action_type,decision,action,reason
  ) values (
    v_proposal.id,v_user_id,v_proposal.action_type,'approved',
    v_proposal.action,'explicit user approval'
  );

  return query
    select v_proposal.id,
           'approved'::text,
           v_approval_id,
           v_proposal.action_type,
           v_proposal.action;
end;
$$;

revoke all on function public.approve_vendrith_development_action_v1(uuid) from public;
revoke all on function public.approve_vendrith_development_action_v1(uuid) from anon;
grant execute on function public.approve_vendrith_development_action_v1(uuid) to authenticated;
