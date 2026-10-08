revoke all on function public.approve_vendrith_creator_action_v1(uuid) from public;
revoke all on function public.enqueue_vendrith_runtime_intent_v1(uuid) from public;
revoke all on function public.claim_vendrith_runtime_intent_v1(uuid) from public;
revoke all on function public.finish_vendrith_runtime_intent_v1(uuid,text,jsonb) from public;
revoke all on function public.retry_vendrith_runtime_intent_v1(uuid) from public;
revoke all on function public.read_world_runtime_mutation_by_id_v1(uuid,text) from public;
revoke all on function public.approve_vendrith_development_action_v1(uuid) from public;
revoke all on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) from public;

grant execute on function public.approve_vendrith_creator_action_v1(uuid) to authenticated;
grant execute on function public.enqueue_vendrith_runtime_intent_v1(uuid) to authenticated;
grant execute on function public.claim_vendrith_runtime_intent_v1(uuid) to authenticated;
grant execute on function public.finish_vendrith_runtime_intent_v1(uuid,text,jsonb) to authenticated;
grant execute on function public.retry_vendrith_runtime_intent_v1(uuid) to authenticated;
grant execute on function public.read_world_runtime_mutation_by_id_v1(uuid,text) to authenticated;
grant execute on function public.approve_vendrith_development_action_v1(uuid) to authenticated;
grant execute on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) to authenticated;
