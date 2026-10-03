create or replace function public.map_editor_save_slot_v1(
  p_map_id uuid,
  p_slot_number smallint,
  p_label text,
  p_version_id uuid,
  p_version_number integer,
  p_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_slot public.map_editor_save_slots%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  if p_slot_number < 1 or p_slot_number > 12 then
    return jsonb_build_object('ok',false,'code','INVALID_SLOT');
  end if;
  if not exists (select 1 from public.maps where id=p_map_id and created_by=v_uid) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    return jsonb_build_object('ok',false,'code','INVALID_SNAPSHOT');
  end if;
  if p_version_number is null or p_version_number < 1 then
    return jsonb_build_object('ok',false,'code','INVALID_VERSION');
  end if;
  if not exists (
    select 1 from public.map_versions
    where id=p_version_id and map_id=p_map_id and version_number=p_version_number and created_by=v_uid
  ) then
    return jsonb_build_object('ok',false,'code','VERSION_ACCESS_DENIED');
  end if;

  insert into public.map_editor_save_slots(
    map_id,slot_number,label,version_id,version_number,snapshot,created_by
  ) values (
    p_map_id,p_slot_number,coalesce(nullif(btrim(p_label),''),format('Save Slot %s',p_slot_number)),p_version_id,p_version_number,p_snapshot,v_uid
  )
  on conflict (map_id,slot_number) do update set
    label=excluded.label,
    version_id=excluded.version_id,
    version_number=excluded.version_number,
    snapshot=excluded.snapshot,
    updated_at=now()
  returning * into v_slot;

  return jsonb_build_object(
    'ok',true,
    'map_id',v_slot.map_id,
    'slot_number',v_slot.slot_number,
    'label',v_slot.label,
    'version_id',v_slot.version_id,
    'version_number',v_slot.version_number,
    'updated_at',v_slot.updated_at
  );
end;
$$;

create or replace function public.map_editor_load_save_slot_v1(
  p_map_id uuid,
  p_slot_number smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_slot public.map_editor_save_slots%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;
  if not exists (select 1 from public.maps where id=p_map_id and created_by=v_uid) then
    return jsonb_build_object('ok',false,'code','MAP_ACCESS_DENIED');
  end if;
  select * into v_slot
  from public.map_editor_save_slots
  where map_id=p_map_id and slot_number=p_slot_number;
  if not found then
    return jsonb_build_object('ok',false,'code','SLOT_EMPTY','slot_number',p_slot_number);
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
$$;

revoke all on function public.map_editor_save_slot_v1(uuid,smallint,text,uuid,integer,jsonb) from public, anon;
revoke all on function public.map_editor_load_save_slot_v1(uuid,smallint) from public, anon;
grant execute on function public.map_editor_save_slot_v1(uuid,smallint,text,uuid,integer,jsonb) to authenticated;
grant execute on function public.map_editor_load_save_slot_v1(uuid,smallint) to authenticated;

comment on function public.map_editor_save_slot_v1(uuid,smallint,text,uuid,integer,jsonb) is 'Owner-scoped save-slot gateway. Stores a validated immutable map version snapshot in one manual slot.';
comment on function public.map_editor_load_save_slot_v1(uuid,smallint) is 'Owner-scoped load-slot gateway. Returns the immutable snapshot stored in one manual slot.';
