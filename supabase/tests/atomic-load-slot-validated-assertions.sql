\set ON_ERROR_STOP on
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);

-- A valid current Game Save must be returned only when its World equals the canonical version.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','valid Game Save loads: '||r::text);
  perform atomic_save_slot_test.assert_true(r->>'version_id'='aaaaaaaa-1111-1111-1111-111111111111','returns canonical version id');
  perform atomic_save_slot_test.assert_true(r->'snapshot'=atomic_save_slot_test.game_save('Old World','Old Exterior'),'returns stored Game Save');
end $$;
rollback;

-- Missing/deleted or foreign version reference is rejected.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set version_id='cccccccc-3333-3333-3333-333333333333'
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_VERSION_REFERENCE_INVALID','missing version reference rejected');
end $$;
rollback;

-- A version number that does not match the referenced version id is rejected.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots set version_number=2
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_VERSION_REFERENCE_INVALID','version number mismatch rejected');
end $$;
rollback;

-- Embedded World tampering cannot pass against the canonical version snapshot.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{world,name}','"Tampered World"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_VERSION_SNAPSHOT_MISMATCH','snapshot mismatch rejected');
end $$;
rollback;

-- A wrong World identity is rejected distinctly before any client can restore it.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{world,id}','"99999999-9999-9999-9999-999999999999"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_SNAPSHOT_IDENTITY_MISMATCH','wrong World identity rejected');
end $$;
rollback;

-- Existing legacy single-map snapshots remain loadable only when they match the canonical version exactly.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=atomic_save_slot_test.world_envelope('Old World')
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','matching legacy slot remains loadable: '||r::text);
end $$;
rollback;

-- Empty slots return a stable code without returning partial snapshot data.
begin;
select atomic_save_slot_test.seed_case();
delete from public.map_editor_save_slots
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_EMPTY','empty slot returns SLOT_EMPTY');
  perform atomic_save_slot_test.assert_true(not (r ? 'snapshot'),'empty slot returns no snapshot');
end $$;
rollback;
