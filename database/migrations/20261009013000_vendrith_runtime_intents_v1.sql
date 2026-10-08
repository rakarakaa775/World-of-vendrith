create table if not exists public.vendrith_runtime_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid not null references public.vendrith_creator_action_proposals(id) on delete cascade,
  context_type text not null check (context_type in ('world','region','playable')),
  context_id uuid not null,
  action jsonb not null,
  status text not null default 'queued' check (status in ('queued','consumed','rejected','failed')),
  runtime_surface text not null default 'game' check (runtime_surface in ('engine','game')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz null,
  result jsonb null,
  unique(proposal_id)
);
create index if not exists vendrith_runtime_intents_queue_idx
  on public.vendrith_runtime_intents(status, created_at);
alter table public.vendrith_runtime_intents enable row level security;
create policy vendrith_runtime_intents_select_own on public.vendrith_runtime_intents
for select to authenticated using ((select auth.uid())=user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
revoke all on public.vendrith_runtime_intents from anon;
grant select on public.vendrith_runtime_intents to authenticated;

create or replace function public.enqueue_vendrith_runtime_intent_v1(p_proposal_id uuid)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare p public.vendrith_creator_action_proposals%rowtype; i uuid;
begin
 if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then return jsonb_build_object('ok',false,'code','AUTH_REQUIRED'); end if;
 select * into p from public.vendrith_creator_action_proposals where id=p_proposal_id and user_id=auth.uid() for update;
 if not found then return jsonb_build_object('ok',false,'code','PROPOSAL_NOT_FOUND'); end if;
 if p.status <> 'approved' then return jsonb_build_object('ok',false,'code','PROPOSAL_NOT_APPROVED'); end if;
 insert into public.vendrith_runtime_intents(user_id,proposal_id,context_type,context_id,action)
 values(auth.uid(),p.id,p.context_type,p.context_id,p.action)
 on conflict(proposal_id) do nothing
 returning id into i;
 return jsonb_build_object('ok',true,'intent_id',i,'status','queued');
end $$;
revoke all on function public.enqueue_vendrith_runtime_intent_v1(uuid) from public;
grant execute on function public.enqueue_vendrith_runtime_intent_v1(uuid) to authenticated;