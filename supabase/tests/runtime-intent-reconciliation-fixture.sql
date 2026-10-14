\set ON_ERROR_STOP on
\i supabase/tests/runtime-persistence-fixture.sql
create table public.vendrith_creator_action_proposals (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  context_type text not null,
  context_id uuid not null,
  action jsonb not null,
  status text not null
);
