-- Map Editor: project the authoritative MapDocument ground layer into map_cells.
-- map_versions/runtime_snapshots retain the full-fidelity editor document; map_cells is the relational gameplay projection.
create or replace function public.map_editor_reconcile_after_merge_v1(p_map_id uuid, p_version_id uuid, p_snapshot jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  uid uuid := auth.uid();
  v_object_id uuid;
  nav_result jsonb;
  geometry_count integer;
  stale_geometry_count integer;
  v_width integer;
  v_height integer;
  v_ground_cells jsonb;
  v_projected_cells integer := 0;
  v_tile jsonb;
  v_idx integer;
  v_x integer;
  v_y integer;
  v_tile_id text;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.maps where id=p_map_id and created_by=uid) then raise exception 'map not found or not owned by current user'; end if;
  if p_version_id is null then raise exception 'version_id required'; end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'snapshot must be a JSON object'; end if;
  if not exists (select 1 from public.map_versions where id=p_version_id and map_id=p_map_id) then raise exception 'version not found for map'; end if;
  select width, height into v_width, v_height from public.maps where id=p_map_id;
  select coalesce((select l->'cells' from jsonb_array_elements(coalesce(p_snapshot->'document'->'layers','[]'::jsonb)) l where l->>'kind'='ground' limit 1),'[]'::jsonb) into v_ground_cells;
  delete from public.map_cells where map_id=p_map_id;
  if jsonb_typeof(v_ground_cells)='array' and jsonb_array_length(v_ground_cells)>0 then
    for v_idx in 0 .. jsonb_array_length(v_ground_cells)-1 loop
      v_tile := v_ground_cells->v_idx;
      v_tile_id := nullif(v_tile->>'tileId','');
      if v_tile_id is not null then
        v_x := v_idx % greatest(v_width,1);
        v_y := floor(v_idx::numeric/greatest(v_width,1))::integer;
        if v_x>=0 and v_y>=0 and v_x<v_width and v_y<v_height then
          insert into public.map_cells(map_id,grid_x,grid_y,biome,terrain_variant,collision,walkable,metadata)
          values(p_map_id,v_x,v_y,v_tile_id,v_tile_id,false,true,jsonb_build_object('source','map_editor_snapshot','version_id',p_version_id));
          v_projected_cells := v_projected_cells+1;
        end if;
      end if;
    end loop;
  end if;
  select count(*)::integer into stale_geometry_count from public.map_object_geometry g where not exists(select 1 from public.map_objects o where o.id=g.object_id);
  delete from public.map_object_geometry g where not exists(select 1 from public.map_objects o where o.id=g.object_id);
  for v_object_id in select o.id from public.map_objects o where o.map_id=p_map_id loop perform public.sync_map_object_obb_v1(v_object_id); end loop;
  select count(*)::integer into geometry_count from public.map_object_geometry g join public.map_objects o on o.id=g.object_id where o.map_id=p_map_id;
  nav_result := public.rebuild_map_navigation_projection_v1(p_map_id);
  perform public.map_editor_upsert_runtime_snapshot_v1(p_map_id,p_snapshot,p_version_id);
  return jsonb_build_object('ok',true,'map_id',p_map_id,'version_id',p_version_id,'projected_map_cells',v_projected_cells,'geometry_rows',geometry_count,'orphan_geometry_rows_removed',stale_geometry_count,'navigation',nav_result,'runtime_snapshot_version_id',p_version_id);
end;
$function$;
