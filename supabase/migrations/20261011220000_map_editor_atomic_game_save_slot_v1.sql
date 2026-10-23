-- Validate Terrain V2 at the database boundary as well as in the client.
-- This helper is not an application RPC; execute is revoked below.
create or replace function public.map_editor_validate_terrain_semantics_v1(
  p_section jsonb, p_document jsonb
) returns boolean
language plpgsql immutable
set search_path = public, pg_temp
as $terrain_validator$
declare
  v_width integer;
  v_height integer;
  v_cell jsonb;
  v_x integer;
  v_y integer;
  v_key text;
  v_seen text[] := array[]::text[];
  v_field text;
  v_allowed text[] := array['x','y','surface','feature','depth','current','shallowWalkable','bridge','crossingPoint'];
begin
  if p_section is null or jsonb_typeof(p_section) is distinct from 'object'
     or p_section->>'schema' is distinct from 'vandrith.terrain-semantics'
     or p_section->>'version' is distinct from '1'
     or jsonb_typeof(p_section->'cells') is distinct from 'array'
     or jsonb_typeof(p_document) is distinct from 'object'
     or jsonb_typeof(p_document->'width') is distinct from 'number'
     or jsonb_typeof(p_document->'height') is distinct from 'number'
     or (p_document->>'width') !~ '^[1-9][0-9]*$'
     or (p_document->>'height') !~ '^[1-9][0-9]*$' then
    return false;
  end if;
  v_width := (p_document->>'width')::integer;
  v_height := (p_document->>'height')::integer;
  for v_cell in select value from jsonb_array_elements(p_section->'cells') loop
    if jsonb_typeof(v_cell) is distinct from 'object'
       or jsonb_typeof(v_cell->'x') is distinct from 'number' or jsonb_typeof(v_cell->'y') is distinct from 'number'
       or (v_cell->>'x') !~ '^(0|[1-9][0-9]*)$' or (v_cell->>'y') !~ '^(0|[1-9][0-9]*)$'
       or jsonb_typeof(v_cell->'surface') is distinct from 'string'
       or v_cell->>'surface' not in ('land','water') then return false; end if;
    v_x := (v_cell->>'x')::integer;
    v_y := (v_cell->>'y')::integer;
    if v_x >= v_width or v_y >= v_height then return false; end if;
    v_key := v_x::text || ',' || v_y::text;
    if v_key = any(v_seen) then return false; end if;
    v_seen := array_append(v_seen, v_key);
    for v_field in select jsonb_object_keys(v_cell) loop
      if not (v_field = any(v_allowed)) then return false; end if;
    end loop;
    if v_cell ? 'feature' and (jsonb_typeof(v_cell->'feature') is distinct from 'string' or v_cell->>'feature' not in ('shoreline','river','lake','waterfall','ocean_sea','none')) then return false; end if;
    if v_cell ? 'depth' and (jsonb_typeof(v_cell->'depth') is distinct from 'string' or v_cell->>'depth' not in ('shallow','medium','deep','unknown')) then return false; end if;
    if v_cell ? 'current' and (jsonb_typeof(v_cell->'current') is distinct from 'string' or v_cell->>'current' not in ('calm','moderate','strong','unknown')) then return false; end if;
    if (v_cell ? 'shallowWalkable' and jsonb_typeof(v_cell->'shallowWalkable') is distinct from 'boolean')
       or (v_cell ? 'bridge' and jsonb_typeof(v_cell->'bridge') is distinct from 'boolean')
       or (v_cell ? 'crossingPoint' and jsonb_typeof(v_cell->'crossingPoint') is distinct from 'boolean') then return false; end if;
  end loop;
  return true;
exception when others then
  return false;
end;
$terrain_validator$;
revoke all on function public.map_editor_validate_terrain_semantics_v1(jsonb, jsonb) from public, anon, authenticated;

-- Atomic Game Save Slot v1.
-- This migration is intentionally not applied to any hosted database by this workflow.
-- All authoritative version writes and the slot upsert run in this function's transaction.
create or replace function public.map_editor_save_game_slot_atomic_v1(
  p_world_map_id uuid,
  p_expected_world_version integer,
  p_world_snapshot jsonb,
  p_exterior_map_id uuid,
  p_expected_exterior_version integer,
  p_exterior_snapshot jsonb,
  p_slot_number smallint,
  p_label text,
  p_slot_snapshot jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_world public.maps%rowtype;
  v_exterior public.editor_map_identity%rowtype;
  v_parent public.editor_map_identity%rowtype;
  v_world_current integer := 0;
  v_exterior_current integer := 0;
  v_world_current_id uuid;
  v_exterior_current_id uuid;
  v_world_current_snapshot jsonb;
  v_exterior_current_snapshot jsonb;
  v_world_version_id uuid;
  v_world_version_number integer;
  v_exterior_version_id uuid;
  v_exterior_version_number integer;
  v_world_result record;
  v_exterior_result record;
  v_projection_status text := 'not_run';
  v_projection_error text;
  v_conflict_world integer := 0;
  v_conflict_exterior integer := 0;
  v_rows integer := 0;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'code', 'AUTH_REQUIRED'); end if;
  if p_world_map_id is null or p_expected_world_version is null or p_expected_world_version < 0 then
    return jsonb_build_object('ok', false, 'code', 'INVALID_WORLD_REQUEST');
  end if;
  if p_slot_number is null or p_slot_number < 1 or p_slot_number > 12 then
    return jsonb_build_object('ok', false, 'code', 'INVALID_SLOT');
  end if;
  if jsonb_typeof(p_world_snapshot) <> 'object'
     or p_world_snapshot->>'schema' is distinct from 'vandrith.map-document'
     or p_world_snapshot->>'version' is distinct from '1'
     or jsonb_typeof(p_world_snapshot->'document') <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_WORLD_SNAPSHOT');
  end if;
  if jsonb_typeof(p_slot_snapshot) <> 'object'
     or p_slot_snapshot->>'schema' is distinct from 'vandrith.game-save'
     or p_slot_snapshot->>'version' is distinct from '1'
     or p_slot_snapshot->'world' is distinct from p_world_snapshot->'document'
     or not (p_slot_snapshot ? 'exterior') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_SLOT_SNAPSHOT');
  end if;

  -- Optional Terrain V2 metadata is accepted only as a complete, validated pair.
  -- Legacy v1 slots without this property remain supported unchanged.
  if p_slot_snapshot ? 'terrainSemantics' then
    if jsonb_typeof(p_slot_snapshot->'terrainSemantics') <> 'object'
       or ((p_slot_snapshot->'terrainSemantics') - 'world'::text - 'exterior'::text) <> '{}'::jsonb
       or not (p_slot_snapshot->'terrainSemantics' ? 'world')
       or not (p_slot_snapshot->'terrainSemantics' ? 'exterior') then
      return jsonb_build_object('ok', false, 'code', 'INVALID_TERRAIN_SEMANTICS');
    end if;
    if p_slot_snapshot->'terrainSemantics'->'world' <> 'null'::jsonb
       and not public.map_editor_validate_terrain_semantics_v1(
         p_slot_snapshot->'terrainSemantics'->'world', p_world_snapshot->'document'
       ) then
      return jsonb_build_object('ok', false, 'code', 'INVALID_TERRAIN_SEMANTICS');
    end if;
    if p_exterior_map_id is null then
      if p_slot_snapshot->'terrainSemantics'->'exterior' <> 'null'::jsonb then
        return jsonb_build_object('ok', false, 'code', 'INVALID_TERRAIN_SEMANTICS');
      end if;
    elsif p_slot_snapshot->'terrainSemantics'->'exterior' <> 'null'::jsonb
       and not public.map_editor_validate_terrain_semantics_v1(
         p_slot_snapshot->'terrainSemantics'->'exterior', p_exterior_snapshot->'document'
       ) then
      return jsonb_build_object('ok', false, 'code', 'INVALID_TERRAIN_SEMANTICS');
    end if;
  end if;
  if p_world_snapshot->'document'->>'id' is distinct from p_world_map_id::text
     or p_world_snapshot->'document'->>'mapType' is distinct from 'world' then
    return jsonb_build_object('ok', false, 'code', 'WORLD_IDENTITY_MISMATCH');
  end if;

  if p_exterior_map_id is null then
    if p_expected_exterior_version is not null or p_exterior_snapshot is not null
       or p_slot_snapshot->'exterior' <> 'null'::jsonb then
      return jsonb_build_object('ok', false, 'code', 'INVALID_EXTERIOR_REQUEST');
    end if;
  else
    if p_exterior_map_id = p_world_map_id
       or p_expected_exterior_version is null or p_expected_exterior_version < 0
       or jsonb_typeof(p_exterior_snapshot) <> 'object'
       or p_exterior_snapshot->>'schema' is distinct from 'vandrith.map-document'
       or p_exterior_snapshot->>'version' is distinct from '1'
       or jsonb_typeof(p_exterior_snapshot->'document') <> 'object'
       or p_slot_snapshot->'exterior' is distinct from p_exterior_snapshot->'document'
       or p_exterior_snapshot->'document'->>'id' is distinct from p_exterior_map_id::text
       or p_exterior_snapshot->'document'->>'mapType' is distinct from 'playable'
       or (p_exterior_snapshot->'document' ? 'playableSpace'
           and p_exterior_snapshot->'document'->>'playableSpace' is distinct from 'exterior') then
      return jsonb_build_object('ok', false, 'code', 'INVALID_EXTERIOR_REQUEST');
    end if;
  end if;

  -- Canonical lock order for this RPC: legacy World map row, then editor Exterior identity row.
  select m.* into v_world
  from public.maps m
  where m.id = p_world_map_id
    and m.map_type = 'world'
    and public.map_editor_can_access_v1(m.id)
  for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'WORLD_ACCESS_DENIED'); end if;

  if p_exterior_map_id is not null then
    select e.* into v_exterior
    from public.editor_map_identity e
    where e.editor_map_id = p_exterior_map_id
      and e.created_by = v_uid
      and e.map_type = 'playable'
      and e.world_id = v_world.world_id
    for update;
    if not found or v_exterior.parent_editor_map_id is null then
      return jsonb_build_object('ok', false, 'code', 'EXTERIOR_IDENTITY_NOT_ACCESSIBLE');
    end if;

    select p.* into v_parent
    from public.editor_map_identity p
    where p.editor_map_id = v_exterior.parent_editor_map_id
      and p.map_type = 'region'
      and p.world_id = v_world.world_id
      and p.created_by = v_uid
    for share;
    if not found then return jsonb_build_object('ok', false, 'code', 'EXTERIOR_PARENT_INVALID'); end if;
  end if;

  select coalesce(max(v.version_number), 0) into v_world_current
  from public.map_versions v where v.map_id = p_world_map_id;
  if v_world_current > 0 then
    select v.id, v.snapshot into v_world_current_id, v_world_current_snapshot
    from public.map_versions v where v.map_id = p_world_map_id and v.version_number = v_world_current;
  end if;

  if p_exterior_map_id is not null then
    select coalesce(max(v.version_number), 0) into v_exterior_current
    from public.editor_map_versions v where v.editor_map_id = p_exterior_map_id;
    if v_exterior_current > 0 then
      select v.id, v.snapshot into v_exterior_current_id, v_exterior_current_snapshot
      from public.editor_map_versions v where v.editor_map_id = p_exterior_map_id and v.version_number = v_exterior_current;
    end if;
  end if;

  if p_expected_world_version <> v_world_current
     or (p_exterior_map_id is not null and p_expected_exterior_version <> v_exterior_current) then
    return jsonb_build_object(
      'ok', false, 'code', 'VERSION_CONFLICT',
      'current_world_version', v_world_current,
      'current_exterior_version', case when p_exterior_map_id is null then null else v_exterior_current end
    );
  end if;

  -- A PL/pgSQL exception block is a subtransaction: any error after the first
  -- version write rolls back every version/slot write in this block.
  begin
    if v_world_current > 0 and v_world_current_snapshot = p_world_snapshot then
      v_world_version_id := v_world_current_id;
      v_world_version_number := v_world_current;
      v_projection_status := 'reused';
    else
      select * into v_world_result
      from public.map_editor_commit_merge_v1(
        p_world_map_id, p_expected_world_version, p_world_snapshot,
        coalesce(nullif(btrim(p_label), ''), format('Save Slot %s', p_slot_number))
      );
      if v_world_result.status is distinct from 'committed' then
        raise exception using errcode = 'PZ001', message = 'SAVE_CONFLICT';
      end if;
      v_world_version_id := v_world_result.version_id;
      v_world_version_number := v_world_result.version_number;
      -- Read optional projection metadata through JSON so this RPC remains compatible
      -- with deployments whose authoritative commit RPC still exposes the legacy four-column
      -- result. Missing projection metadata is reported honestly as not_run, not as a failed save.
      v_projection_status := coalesce(nullif(to_jsonb(v_world_result)->>'projection_status', ''), 'not_run');
      v_projection_error := to_jsonb(v_world_result)->>'projection_error';
    end if;

    if p_exterior_map_id is not null then
      if v_exterior_current > 0 and v_exterior_current_snapshot = p_exterior_snapshot then
        v_exterior_version_id := v_exterior_current_id;
        v_exterior_version_number := v_exterior_current;
      else
        select * into v_exterior_result
        from public.map_editor_commit_identity_v1(
          p_exterior_map_id, p_expected_exterior_version, p_exterior_snapshot,
          coalesce(nullif(btrim(p_label), ''), format('Save Slot %s', p_slot_number))
        );
        if v_exterior_result.status is distinct from 'committed' then
          raise exception using errcode = 'PZ001', message = 'SAVE_CONFLICT';
        end if;
        v_exterior_version_id := v_exterior_result.version_id;
        v_exterior_version_number := v_exterior_result.version_number;
      end if;
    end if;

    insert into public.map_editor_save_slots(
      map_id, slot_number, label, version_id, version_number, snapshot, created_by
    ) values (
      p_world_map_id, p_slot_number,
      coalesce(nullif(btrim(p_label), ''), format('Save Slot %s', p_slot_number)),
      v_world_version_id, v_world_version_number, p_slot_snapshot, v_uid
    )
    on conflict (map_id, created_by, slot_number) do update
      set label = excluded.label,
          version_id = excluded.version_id,
          version_number = excluded.version_number,
          snapshot = excluded.snapshot,
          updated_at = now()
      where public.map_editor_save_slots.created_by = v_uid;

    get diagnostics v_rows = row_count;
    if v_rows <> 1 then
      raise exception using errcode = 'PZ002', message = 'SAVE_SLOT_OWNER_MISMATCH';
    end if;

  exception
    when sqlstate 'PZ001' then
      select coalesce(max(v.version_number), 0) into v_conflict_world
      from public.map_versions v where v.map_id = p_world_map_id;
      if p_exterior_map_id is not null then
        select coalesce(max(v.version_number), 0) into v_conflict_exterior
        from public.editor_map_versions v where v.editor_map_id = p_exterior_map_id;
      end if;
      return jsonb_build_object(
        'ok', false, 'code', 'VERSION_CONFLICT',
        'current_world_version', v_conflict_world,
        'current_exterior_version', case when p_exterior_map_id is null then null else v_conflict_exterior end
      );
    when others then
      return jsonb_build_object('ok', false, 'code', 'ATOMIC_SAVE_FAILED');
  end;

  return jsonb_build_object(
    'ok', true,
    'slot_number', p_slot_number,
    'world_version_id', v_world_version_id,
    'world_version_number', v_world_version_number,
    'exterior_version_id', v_exterior_version_id,
    'exterior_version_number', v_exterior_version_number,
    'projection_status', v_projection_status,
    'projection_error', v_projection_error
  );
end;
$function$;

revoke all on function public.map_editor_save_game_slot_atomic_v1(uuid, integer, jsonb, uuid, integer, jsonb, smallint, text, jsonb) from public, anon;
grant execute on function public.map_editor_save_game_slot_atomic_v1(uuid, integer, jsonb, uuid, integer, jsonb, smallint, text, jsonb) to authenticated;
