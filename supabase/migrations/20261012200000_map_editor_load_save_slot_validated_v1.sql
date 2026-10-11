-- Candidate server-side Load Slot integrity contract v1.
-- Intentionally not applied to hosted Supabase. CI applies this only to disposable PostgreSQL.
create or replace function public.map_editor_load_save_slot_validated_v1(
  p_map_id uuid,
  p_slot_number smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_slot public.map_editor_save_slots%rowtype;
  v_version public.map_versions%rowtype;
  v_canonical_document jsonb;
  v_slot_world jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  if p_map_id is null then
    return jsonb_build_object('ok',false,'code','INVALID_MAP');
  end if;
  if p_slot_number is null or p_slot_number < 1 or p_slot_number > 12 then
    return jsonb_build_object('ok',false,'code','INVALID_SLOT');
  end if;

  if not exists (
    select 1 from public.maps m
    where m.id = p_map_id and m.created_by = v_uid and m.map_type = 'world'
  ) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;

  select s.* into v_slot
  from public.map_editor_save_slots s
  where s.map_id = p_map_id
    and s.slot_number = p_slot_number
    and s.created_by = v_uid
  for update;

  if not found then
    return jsonb_build_object('ok',false,'code','SLOT_EMPTY','slot_number',p_slot_number);
  end if;

  if v_slot.version_id is null or v_slot.version_number is null or v_slot.version_number < 1 then
    return jsonb_build_object('ok',false,'code','SLOT_VERSION_REFERENCE_INVALID');
  end if;

  select mv.* into v_version
  from public.map_versions mv
  where mv.id = v_slot.version_id
    and mv.map_id = p_map_id
    and mv.version_number = v_slot.version_number
    and mv.created_by = v_uid
  for share;

  if not found then
    return jsonb_build_object('ok',false,'code','SLOT_VERSION_REFERENCE_INVALID');
  end if;

  if jsonb_typeof(v_version.snapshot) is distinct from 'object'
     or v_version.snapshot->>'schema' is distinct from 'vandrith.map-document'
     or v_version.snapshot->>'version' is distinct from '1'
     or jsonb_typeof(v_version.snapshot->'document') is distinct from 'object' then
    return jsonb_build_object('ok',false,'code','CANONICAL_VERSION_INVALID');
  end if;

  v_canonical_document := v_version.snapshot->'document';
  if v_canonical_document->>'id' is distinct from p_map_id::text
     or v_canonical_document->>'mapType' is distinct from 'world' then
    return jsonb_build_object('ok',false,'code','CANONICAL_VERSION_IDENTITY_MISMATCH');
  end if;

  if jsonb_typeof(v_slot.snapshot) is distinct from 'object' then
    return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_INVALID');
  end if;

  if v_slot.snapshot->>'schema' = 'vandrith.game-save'
     and v_slot.snapshot->>'version' = '1' then
    v_slot_world := v_slot.snapshot->'world';
    if jsonb_typeof(v_slot_world) is distinct from 'object' then
      return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_INVALID');
    end if;
    if v_slot_world->>'id' is distinct from p_map_id::text
       or v_slot_world->>'mapType' is distinct from 'world' then
      return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_IDENTITY_MISMATCH');
    end if;
    if v_slot_world is distinct from v_canonical_document then
      return jsonb_build_object('ok',false,'code','SLOT_VERSION_SNAPSHOT_MISMATCH');
    end if;
    if not (v_slot.snapshot ? 'exterior')
       or (v_slot.snapshot->'exterior' <> 'null'::jsonb
           and (jsonb_typeof(v_slot.snapshot->'exterior') is distinct from 'object'
             or v_slot.snapshot->'exterior'->>'mapType' is distinct from 'playable')) then
      return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_INVALID');
    end if;
  elsif v_slot.snapshot->>'schema' = 'vandrith.map-document'
        and v_slot.snapshot->>'version' = '1' then
    if v_slot.snapshot->'document'->>'id' is distinct from p_map_id::text
       or v_slot.snapshot->'document'->>'mapType' is distinct from 'world' then
      return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_IDENTITY_MISMATCH');
    end if;
    if v_slot.snapshot is distinct from v_version.snapshot then
      return jsonb_build_object('ok',false,'code','SLOT_VERSION_SNAPSHOT_MISMATCH');
    end if;
  else
    return jsonb_build_object('ok',false,'code','SLOT_SNAPSHOT_INVALID');
  end if;

  return jsonb_build_object(
    'ok',true,
    'map_id',v_slot.map_id,
    'slot_number',v_slot.slot_number,
    'label',v_slot.label,
    'version_id',v_slot.version_id,
    'version_number',v_slot.version_number,
    'snapshot',v_slot.snapshot,
    'updated_at',v_slot.updated_at
  );
end;
$function$;

revoke all on function public.map_editor_load_save_slot_validated_v1(uuid,smallint) from public, anon;
grant execute on function public.map_editor_load_save_slot_validated_v1(uuid,smallint) to authenticated;

comment on function public.map_editor_load_save_slot_validated_v1(uuid,smallint) is
'Candidate owner-scoped Load Slot gateway. Validates the slot version reference, canonical World identity, and slot/canonical snapshot agreement before returning a snapshot. Not wired into active UI.';
