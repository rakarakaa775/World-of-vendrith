create table if not exists public.vendrith_development_action_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('repository_write','database_write','deployment')),
  action jsonb not null,
  rationale text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','failed')),
  approval_id uuid,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendrith_development_action_proposals enable row level security;

create policy "development proposals own select"
  on public.vendrith_development_action_proposals for select
  to authenticated using ((select auth.uid()) = user_id);

create policy "development proposals own insert"
  on public.vendrith_development_action_proposals for insert
  to authenticated with check ((select auth.uid()) = user_id);

revoke all on public.vendrith_development_action_proposals from anon;
grant select, insert on public.vendrith_development_action_proposals to authenticated;
