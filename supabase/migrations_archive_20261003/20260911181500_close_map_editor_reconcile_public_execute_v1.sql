-- map_editor_reconcile_after_merge_v1 is an internal primitive invoked by
-- map_editor_commit_merge_v1. Client roles must not be able to invoke it
-- directly through PostgREST.
revoke execute on function public.map_editor_reconcile_after_merge_v1(uuid, uuid, jsonb) from public;
grant execute on function public.map_editor_reconcile_after_merge_v1(uuid, uuid, jsonb) to postgres;

comment on function public.map_editor_reconcile_after_merge_v1(uuid, uuid, jsonb)
is 'Internal reconciliation primitive. Invoked only by map_editor_commit_merge_v1; direct API execution is disabled.';
