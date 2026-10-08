create table if not exists public.vendrith_creator_action_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  context_type text not null check (context_type in ('world','region','playable')),
  context_id uuid not null,
  map_id uuid not null,
  operation text not null check (operation in ('create','move','rotate','scale','delete')),
  action jsonb not null,
  rationale text not null check (char_length(rationale) between 1 and 4000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','failed')),
  approval_id uuid null,
  result jsonb null,
  created_at timestamptz not null default now(),
  approved_at timestamptz null,
  constraint vendrith_creator_proposals_session_user_fk foreign key (session_id, user_id)
    references public.vendrith_ai_sessions(id, user_id) on delete cascade
);
create index if not exists vendrith_creator_proposals_user_created_idx
  on public.vendrith_creator_action_proposals(user_id, created_at desc);
alter table public.vendrith_creator_action_proposals enable row level security;
drop policy if exists vendrith_creator_proposals_select_own on public.vendrith_creator_action_proposals;
create policy vendrith_creator_proposals_select_own on public.vendrith_creator_action_proposals
for select to authenticated using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
drop policy if exists vendrith_creator_proposals_insert_own on public.vendrith_creator_action_proposals;
create policy vendrith_creator_proposals_insert_own on public.vendrith_creator_action_proposals
for insert to authenticated with check ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
drop policy if exists vendrith_creator_proposals_update_own on public.vendrith_creator_action_proposals;
create policy vendrith_creator_proposals_update_own on public.vendrith_creator_action_proposals
for update to authenticated using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true')
with check ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
revoke all on public.vendrith_creator_action_proposals from anon;
grant select, insert, update on public.vendrith_creator_action_proposals to authenticated;