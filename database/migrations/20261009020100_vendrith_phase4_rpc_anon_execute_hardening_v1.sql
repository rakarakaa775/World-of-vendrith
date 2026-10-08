revoke execute on function public.approve_vendrith_creator_action_v1(uuid) from anon;
revoke execute on function public.enqueue_vendrith_runtime_intent_v1(uuid) from anon;
revoke execute on function public.claim_vendrith_runtime_intent_v1(uuid) from anon;
revoke execute on function public.finish_vendrith_runtime_intent_v1(uuid,text,jsonb) from anon;
revoke execute on function public.retry_vendrith_runtime_intent_v1(uuid) from anon;
revoke execute on function public.read_world_runtime_mutation_by_id_v1(uuid,text) from anon;
revoke execute on function public.approve_vendrith_development_action_v1(uuid) from anon;
revoke execute on function public.finalize_vendrith_development_action_v1(uuid,uuid,text,jsonb) from anon;
