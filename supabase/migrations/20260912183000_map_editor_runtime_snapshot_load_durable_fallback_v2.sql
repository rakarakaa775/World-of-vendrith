CREATE OR REPLACE FUNCTION public.map_editor_get_runtime_snapshot_v1(p_map_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  r public.map_editor_runtime_snapshots%rowtype;
  v_version_number integer;
  v_latest public.map_versions%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.maps
    where id = p_map_id
      and created_by = auth.uid()
  ) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;

  select * into r
  from public.map_editor_runtime_snapshots
  where map_id = p_map_id;

  if found then
    select mv.version_number into v_version_number
    from public.map_versions mv
    where mv.id = r.version_id;

    return jsonb_build_object(
      'ok',true,
      'found',true,
      'id',r.id,
      'map_id',r.map_id,
      'version_id',r.version_id,
      'version_number',coalesce(v_version_number,0),
      'snapshot',r.snapshot,
      'updated_at',r.updated_at
    );
  end if;

  select * into v_latest
  from public.map_versions mv
  where mv.map_id = p_map_id
  order by mv.version_number desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'ok',true,
      'found',false,
      'map_id',p_map_id,
      'version_number',0,
      'code','NO_SNAPSHOT'
    );
  end if;

  return jsonb_build_object(
    'ok',true,
    'found',true,
    'id',v_latest.id,
    'map_id',v_latest.map_id,
    'version_id',v_latest.id,
    'version_number',v_latest.version_number,
    'snapshot',v_latest.snapshot,
    'updated_at',v_latest.created_at,
    'code','durable-version-fallback'
  );
end;
$function$;
