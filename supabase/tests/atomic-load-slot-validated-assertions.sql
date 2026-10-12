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

-- World-only Game Saves preserve an explicit null Exterior and remain loadable.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=atomic_save_slot_test.game_save('Old World',null)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $null_exterior_load$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','World-only Game Save remains loadable: '||r::text);
  perform atomic_save_slot_test.assert_true(r->'snapshot'->'exterior'='null'::jsonb,'World-only Game Save preserves explicit null Exterior');
end
$null_exterior_load$;
rollback;

-- A version owned by another user cannot satisfy this owner's canonical version reference.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
update public.map_versions set created_by='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
where id='aaaaaaaa-1111-1111-1111-111111111111';
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_VERSION_REFERENCE_INVALID','foreign-owner canonical version reference rejected');
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

-- Exterior identity and map type are validated before a snapshot can be returned.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,id}','"11111111-1111-1111-1111-111111111111"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_SNAPSHOT_INVALID','Exterior cannot reuse World identity');
end $$;
rollback;

begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,mapType}','"world"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_SNAPSHOT_INVALID','Exterior map type mismatch rejected');
end $$;
rollback;


begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,playableSpace}','"interior"'::jsonb,true)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $interior_load$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='SLOT_SNAPSHOT_INVALID','Interior playable map cannot be returned as Exterior');
end $interior_load$;
rollback;

-- Authentication and slot-number checks return stable errors.
begin;
select set_config('request.jwt.claim.sub','',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='AUTH_REQUIRED','unauthenticated Load Slot denied');
end $$;
rollback;

begin;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',0::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='INVALID_SLOT','invalid slot number rejected');
end $$;
rollback;


-- A structurally valid Exterior payload cannot invent a persisted identity.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,id}','"44444444-4444-4444-4444-444444444444"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $exterior_identity_missing$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_IDENTITY_NOT_ACCESSIBLE','unknown Exterior identity must be rejected');
end
$exterior_identity_missing$;
rollback;

-- Simulate a pre-existing/corrupt foreign-owner identity row so the RPC's
-- owner filter is tested independently of the table's normal invariant trigger.
-- This runs only in the disposable superuser-owned CI database and rolls back.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
set local session_replication_role = replica;
update public.editor_map_identity set created_by='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
where editor_map_id='22222222-2222-2222-2222-222222222222';
set local session_replication_role = origin;
do $exterior_identity_foreign$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_IDENTITY_NOT_ACCESSIBLE','foreign-owner Exterior identity must be rejected');
end
$exterior_identity_foreign$;
rollback;

-- An Exterior identity whose parent is not a Region must not be returned.
begin;
select atomic_save_slot_test.seed_case();
-- Bypass only the invariant trigger to model a corrupt pre-existing parent row.
set local session_replication_role = replica;
update public.editor_map_identity set map_type='playable'
where editor_map_id='33333333-3333-3333-3333-333333333333';
set local session_replication_role = origin;
do $exterior_parent_invalid$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_PARENT_INVALID','Exterior with non-Region parent must be rejected');
end
$exterior_parent_invalid$;
rollback;

-- A valid Exterior identity cannot be paired with content absent from its version history.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,name}','"Forged Exterior"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $exterior_snapshot_mismatch$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_VERSION_SNAPSHOT_MISMATCH','unpersisted Exterior content must be rejected');
end
$exterior_snapshot_mismatch$;
rollback;
