create or replace function public.retry_vendrith_runtime_intent_v1(p_intent_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare r public.vendrith_runtime_intents%rowtype;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  update public.vendrith_runtime_intents
     set status='queued', consumed_at=null
   where id=p_intent_id and user_id=auth.uid() and status='failed'
     and coalesce((result->>'retryable')::boolean,false)=true
   returning * into r;
  if not found then
    return jsonb_build_object('ok',false,'code','INTENT_NOT_RETRYABLE');
  end if;
  return jsonb_build_object('ok',true,'intent_id',r.id,'status',r.status);
end;
$$;

grant execute on function public.retry_vendrith_runtime_intent_v1(uuid) to authenticated;
