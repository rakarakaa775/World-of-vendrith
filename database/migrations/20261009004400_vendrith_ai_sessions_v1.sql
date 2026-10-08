create table if not exists public.vendrith_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  audience text not null default 'web-creator' check (audience = 'web-creator'),
  title text null check (title is null or char_length(title) <= 120),
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendrith_ai_sessions_id_user_unique unique (id, user_id)
);
create index if not exists vendrith_ai_sessions_user_updated_idx on public.vendrith_ai_sessions(user_id, updated_at desc);
create table if not exists public.vendrith_ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  constraint vendrith_ai_messages_session_user_fk foreign key (session_id, user_id) references public.vendrith_ai_sessions(id, user_id) on delete cascade
);
create index if not exists vendrith_ai_messages_session_created_idx on public.vendrith_ai_messages(session_id, created_at desc, id desc);
alter table public.vendrith_ai_sessions enable row level security;
alter table public.vendrith_ai_messages enable row level security;
drop policy if exists vendrith_ai_sessions_select_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_select_own on public.vendrith_ai_sessions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists vendrith_ai_sessions_insert_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_insert_own on public.vendrith_ai_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists vendrith_ai_sessions_update_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_update_own on public.vendrith_ai_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists vendrith_ai_sessions_delete_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_delete_own on public.vendrith_ai_sessions for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists vendrith_ai_messages_select_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_select_own on public.vendrith_ai_messages for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists vendrith_ai_messages_insert_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_insert_own on public.vendrith_ai_messages for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.vendrith_ai_sessions s where s.id = session_id and s.user_id = (select auth.uid())));
drop policy if exists vendrith_ai_messages_delete_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_delete_own on public.vendrith_ai_messages for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.touch_vendrith_ai_session() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists vendrith_ai_sessions_touch on public.vendrith_ai_sessions;
create trigger vendrith_ai_sessions_touch before update on public.vendrith_ai_sessions for each row execute function public.touch_vendrith_ai_session();
create or replace function public.prune_vendrith_ai_messages() returns trigger language plpgsql as $$ begin delete from public.vendrith_ai_messages where id in (select id from public.vendrith_ai_messages where session_id = new.session_id order by created_at desc, id desc offset 100); return new; end; $$;
drop trigger if exists vendrith_ai_messages_prune on public.vendrith_ai_messages;
create trigger vendrith_ai_messages_prune after insert on public.vendrith_ai_messages for each row execute function public.prune_vendrith_ai_messages();
revoke all on public.vendrith_ai_sessions from anon;
revoke all on public.vendrith_ai_messages from anon;
grant select, insert, update, delete on public.vendrith_ai_sessions to authenticated;
grant select, insert, delete on public.vendrith_ai_messages to authenticated;