alter table public.vendrith_ai_sessions add column if not exists context_type text null check (context_type is null or context_type in ('world','region','playable'));
alter table public.vendrith_ai_sessions add column if not exists context_id uuid null;
create index if not exists vendrith_ai_sessions_context_idx on public.vendrith_ai_sessions(user_id, context_type, context_id, updated_at desc);