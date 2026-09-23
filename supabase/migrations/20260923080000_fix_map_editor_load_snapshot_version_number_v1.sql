-- Live Supabase migration: fix_map_editor_load_snapshot_version_number_v1
-- Purpose: return the durable version_number alongside the authoritative
-- snapshot so Map Editor connection state cannot fall back to version 0 and
-- incorrectly attempt a bootstrap against an already-versioned World Map.
--
-- Applied to the live Supabase project before this source file was synchronized.

create or replace function public.map_editor_load_document_snapshot_v1(p_map_id uuid)
returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  uid uuid := auth.uid();
  v_snapshot jsonb;
  v_version_number integer;
begin
  if uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  if not public.map_editor_can_access_v1(p_map_id) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;

  select mv.snapshot, mv.version_number
    into v_snapshot, v_version_number
  from public.map_versions mv
  where mv.map_id = p_map_id
  order by mv.version_number desc
  limit 1;

  if v_snapshot is null then
    return jsonb_build_object('ok',false,'code','SNAPSHOT_NOT_FOUND');
  end if;

  return jsonb_build_object(
    'ok',true,
    'map_id',p_map_id,
    'version_number',v_version_number,
    'snapshot',v_snapshot
  );
end
$function$;
