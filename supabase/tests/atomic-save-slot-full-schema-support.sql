-- Support helpers for tests against the reconstructed Vendrith schema.
-- This file must only run in the disposable PostgreSQL CI database.
create schema if not exists atomic_save_slot_test;

create or replace function atomic_save_slot_test.world_doc(p_name text)
returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'id', '11111111-1111-1111-1111-111111111111',
    'mapType', 'world', 'version', 1, 'name', p_name,
    'width', 1, 'height', 1, 'tileSize', 16,
    'layers', jsonb_build_array(jsonb_build_object('kind','ground','cells',jsonb_build_array(null)))
  )
$$;

create or replace function atomic_save_slot_test.world_envelope(p_name text)
returns jsonb language sql immutable as $$
  select jsonb_build_object('schema','vandrith.map-document','version',1,'document',atomic_save_slot_test.world_doc(p_name))
$$;

create or replace function atomic_save_slot_test.exterior_doc(p_name text)
returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'id', '22222222-2222-2222-2222-222222222222',
    'mapType', 'playable', 'version', 1, 'name', p_name,
    'width', 1, 'height', 1, 'tileSize', 16,
    'layers', jsonb_build_array(jsonb_build_object('kind','ground','cells',jsonb_build_array(null)))
  )
$$;

create or replace function atomic_save_slot_test.exterior_envelope(p_name text)
returns jsonb language sql immutable as $$
  select jsonb_build_object('schema','vandrith.map-document','version',1,'document',atomic_save_slot_test.exterior_doc(p_name))
$$;

create or replace function atomic_save_slot_test.game_save(p_world_name text, p_exterior_name text)
returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'schema','vandrith.game-save','version',1,
    'world',atomic_save_slot_test.world_doc(p_world_name),
    'exterior',case when p_exterior_name is null then 'null'::jsonb else atomic_save_slot_test.exterior_doc(p_exterior_name) end
  )
$$;

create or replace function atomic_save_slot_test.seed_case()
returns void language plpgsql as $$
declare
  v_user constant uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_world constant uuid := '3695d0b0-788e-42fa-9345-cc3197d0c94d';
  v_map constant uuid := '11111111-1111-1111-1111-111111111111';
  v_region constant uuid := '33333333-3333-3333-3333-333333333333';
  v_playable constant uuid := '22222222-2222-2222-2222-222222222222';
  v_world_version constant uuid := 'aaaaaaaa-1111-1111-1111-111111111111';
  v_exterior_version constant uuid := 'bbbbbbbb-2222-2222-2222-222222222222';
begin
  insert into auth.users(id) values(v_user);
  insert into public.worlds(id,name,status) values(v_world,'Atomic Save Slot CI World','active');
  insert into public.maps(id,world_id,name,map_type,width,height,tile_size,created_by)
    values(v_map,v_world,'Atomic Save Slot CI World','world',1,1,16,v_user);
  insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by)
    values
      (v_map,v_map,v_world,'world',null,v_user),
      (v_region,null,v_world,'region',v_map,v_user),
      (v_playable,null,v_world,'playable',v_region,v_user);
  insert into public.map_versions(id,map_id,version_number,label,snapshot,created_by)
    values(v_world_version,v_map,1,'seed',atomic_save_slot_test.world_envelope('Old World'),v_user);
  insert into public.editor_map_versions(id,editor_map_id,version_number,label,snapshot,created_by)
    values(v_exterior_version,v_playable,1,'seed',atomic_save_slot_test.exterior_envelope('Old Exterior'),v_user);
  insert into public.map_editor_save_slots(map_id,slot_number,label,version_id,version_number,snapshot,created_by)
    values(v_map,1,'Old Slot',v_world_version,1,atomic_save_slot_test.game_save('Old World','Old Exterior'),v_user);
end
$$;

create or replace function atomic_save_slot_test.assert_true(p_ok boolean,p_message text)
returns void language plpgsql as $$
begin
  if not coalesce(p_ok,false) then raise exception 'ASSERTION FAILED: %',p_message; end if;
end
$$;

create or replace function atomic_save_slot_test.inject_map_version_failure()
returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_at',true)='world_after_insert' then raise exception 'injected World version failure'; end if;
  return new;
end
$$;
create trigger atomic_save_slot_test_world_failure
after insert on public.map_versions
for each row execute function atomic_save_slot_test.inject_map_version_failure();

create or replace function atomic_save_slot_test.inject_identity_version_failure()
returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_at',true)='identity_after_insert' then raise exception 'injected Exterior version failure'; end if;
  return new;
end
$$;
create trigger atomic_save_slot_test_identity_failure
after insert on public.editor_map_versions
for each row execute function atomic_save_slot_test.inject_identity_version_failure();

create or replace function atomic_save_slot_test.inject_slot_failure()
returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_at',true)='slot_after_upsert' then raise exception 'injected Save Slot failure'; end if;
  return new;
end
$$;
create trigger atomic_save_slot_test_slot_failure
after insert or update on public.map_editor_save_slots
for each row execute function atomic_save_slot_test.inject_slot_failure();
