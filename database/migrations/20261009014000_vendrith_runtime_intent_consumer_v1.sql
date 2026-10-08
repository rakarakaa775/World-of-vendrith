alter table public.vendrith_runtime_intents
  drop constraint if exists vendrith_runtime_intents_status_check;
alter table public.vendrith_runtime_intents
  add constraint vendrith_runtime_intents_status_check
  check (status in ('queued','processing','consumed','rejected','failed'));

create or replace function public.claim_vendrith_runtime_intent_v1(p_intent_id uuid)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare r public.vendrith_runtime_intents%rowtype;
begin
 if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then return jsonb_build_object('ok',false,'code','AUTH_REQUIRED'); end if;
 update public.vendrith_runtime_intents set status='processing'
 where id=p_intent_id and user_id=auth.uid() and status='queued' returning * into r;
 if not found then return jsonb_build_object('ok',false,'code','INTENT_NOT_CLAIMABLE'); end if;
 return jsonb_build_object('ok',true,'intent_id',r.id,'proposal_id',r.proposal_id,'context_type',r.context_type,'context_id',r.context_id,'runtime_surface',r.runtime_surface,'action',r.action,'status',r.status);
end $$;

create or replace function public.finish_vendrith_runtime_intent_v1(p_intent_id uuid,p_status text,p_result jsonb default null)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare r public.vendrith_runtime_intents%rowtype;
begin
 if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then return jsonb_build_object('ok',false,'code','AUTH_REQUIRED'); end if;
 if p_status not in ('consumed','rejected','failed') then return jsonb_build_object('ok',false,'code','INVALID_FINAL_STATUS'); end if;
 update public.vendrith_runtime_intents set status=p_status,consumed_at=case when p_status='consumed' then now() else null end,result=p_result
 where id=p_intent_id and user_id=auth.uid() and status='processing' returning * into r;
 if not found then return jsonb_build_object('ok',false,'code','INTENT_NOT_PROCESSING'); end if;
 return jsonb_build_object('ok',true,'intent_id',r.id,'status',r.status,'result',r.result);
end $$;

revoke all on function public.claim_vendrith_runtime_intent_v1(uuid) from public;
revoke all on function public.finish_vendrith_runtime_intent_v1(uuid,text,jsonb) from public;
grant execute on function public.claim_vendrith_runtime_intent_v1(uuid) to authenticated;
grant execute on function public.finish_vendrith_runtime_intent_v1(uuid,text,jsonb) to authenticated;