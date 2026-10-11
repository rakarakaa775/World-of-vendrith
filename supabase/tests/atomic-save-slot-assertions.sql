-- Run after atomic-save-slot-fixture.sql and the candidate migration.
\set ON_ERROR_STOP on
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);

-- Successful World + Exterior save advances both histories and the slot together.
select set_config('test.fail_at','',false);
select test_support.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222', 1, test_support.exterior_envelope('New Exterior'),
    1::smallint, 'Atomic success', test_support.game_save('New World','New Exterior')
  );
  perform test_support.assert_true(r->>'ok'='true','combined save should succeed: '||r::text);
  perform test_support.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World history should advance exactly once');
  perform test_support.assert_true((select count(*)=2 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Exterior history should advance exactly once');
  perform test_support.assert_true((select version_number=2 and snapshot=test_support.game_save('New World','New Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot should reference the committed World and combined snapshot');
end $$;

-- Failure after the Exterior version insert must roll back the earlier World insert too.
select set_config('test.fail_at','',false);
select test_support.seed_case();
select set_config('test.fail_at','identity_after_insert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222', 1, test_support.exterior_envelope('New Exterior'),
    1::smallint, 'Injected Exterior failure', test_support.game_save('New World','New Exterior')
  );
  perform test_support.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','Exterior failure should be reported');
  perform test_support.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World insert must roll back on Exterior failure');
  perform test_support.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Exterior insert must roll back on its own failure');
  perform test_support.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot must remain unchanged on Exterior failure');
end $$;

-- Failure after slot upsert starts must roll back both version inserts and the slot mutation.
select set_config('test.fail_at','',false);
select test_support.seed_case();
select set_config('test.fail_at','slot_after_upsert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222', 1, test_support.exterior_envelope('New Exterior'),
    1::smallint, 'Injected slot failure', test_support.game_save('New World','New Exterior')
  );
  perform test_support.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','slot failure should be reported');
  perform test_support.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World insert must roll back on slot failure');
  perform test_support.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Exterior insert must roll back on slot failure');
  perform test_support.assert_true((select version_number=1 and snapshot=test_support.game_save('Old World','Old Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot upsert must roll back on trigger failure');
end $$;

-- Stale Exterior baseline must reject the request before writing the World.
select set_config('test.fail_at','',false);
select test_support.seed_case();
select set_config('test.fail_at','',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222', 0, test_support.exterior_envelope('New Exterior'),
    1::smallint, 'Stale Exterior', test_support.game_save('New World','New Exterior')
  );
  perform test_support.assert_true(r->>'ok'='false' and r->>'code'='VERSION_CONFLICT','stale Exterior must return conflict');
  perform test_support.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'stale Exterior must not advance World');
  perform test_support.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'stale Exterior must not alter slot');
end $$;

-- World-only legacy-compatible save must work and keep exterior explicitly null.
select set_config('test.fail_at','',false);
select test_support.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('World Only'),
    null, null, null, 1::smallint, 'World only', test_support.game_save('World Only',null)
  );
  perform test_support.assert_true(r->>'ok'='true','World-only save should succeed: '||r::text);
  perform test_support.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World-only save should add one World version');
  perform test_support.assert_true((select snapshot->'exterior'='null'::jsonb and version_number=2 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'World-only slot should store explicit null Exterior');
end $$;

-- Failure immediately after World insert must not leave a partial version.
select set_config('test.fail_at','',false);
select test_support.seed_case();
select set_config('test.fail_at','world_after_insert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('World Insert Failure'),
    null, null, null, 1::smallint, 'World failure', test_support.game_save('World Insert Failure',null)
  );
  perform test_support.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','World insert failure should be reported');
  perform test_support.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'failed World insert must roll back');
  perform test_support.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'failed World insert must not change slot');
end $$;


-- Interior snapshots must not be accepted as an Exterior, even when IDs and envelopes agree.
select set_config('test.fail_at','',false);
select test_support.seed_case();
do $
declare
  r jsonb;
  v_exterior jsonb := jsonb_set(test_support.exterior_envelope('Interior as Exterior'), '{document,playableSpace}', '"interior"'::jsonb, true);
  v_slot jsonb := jsonb_set(test_support.game_save('Interior guard','Interior as Exterior'), '{exterior,playableSpace}', '"interior"'::jsonb, true);
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,
    test_support.world_envelope('Interior guard'),
    '22222222-2222-2222-2222-222222222222',1,
    v_exterior,1::smallint,'Reject Interior',v_slot
  );
  perform test_support.assert_true(r->>'ok'='false' and r->>'code'='INVALID_EXTERIOR_REQUEST','Interior must not be stored as Exterior');
  perform test_support.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'Interior rejection leaves World history unchanged');
  perform test_support.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Interior rejection leaves Exterior history unchanged');
  perform test_support.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'Interior rejection leaves slot unchanged');
end $;

select 'atomic Save Slot SQL tests passed' as result;
