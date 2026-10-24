-- Return the durable existing intent ID when a proposal is enqueued more than once.
-- This is a forward migration: do not rewrite the already-deployed v1 migration.
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
 on conflict(proposal_id) do update
   set proposal_id = excluded.proposal_id
 returning id into i;
 return jsonb_build_object('ok',true,'intent_id',i,'status','queued');
end $$;
revoke all on function public.enqueue_vendrith_runtime_intent_v1(uuid) from public;
grant execute on function public.enqueue_vendrith_runtime_intent_v1(uuid) to authenticated;
