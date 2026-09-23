-- Live Supabase migration: fix map_editor_load_document_snapshot_v1 column ambiguity.
-- The previous function used a PL/pgSQL variable named "snapshot" while also
-- selecting the map_versions.snapshot column, which caused runtime failure.
-- This migration only renames the local variable and qualifies the column.

create or replace function public.map_editor_load_document_snapshot_v1(p_map_id uuid)
returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  uid uuid := auth.uid();
  v_snapshot jsonb;
begin
  if uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  if not public.map_editor_can_access_v1(p_map_id) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;
  select mv.snapshot
    into v_snapshot
  from public.map_versions mv
  where mv.map_id = p_map_id
  order by mv.version_number desc
  limit 1;
  if v_snapshot is null then
    return jsonb_build_object('ok',false,'code','SNAPSHOT_NOT_FOUND');
  end if;
  return jsonb_build_object('ok',true,'map_id',p_map_id,'snapshot',v_snapshot);
end
$function$;
