\set ON_ERROR_STOP on
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);

-- Real World + Playable version RPCs and real schema constraints.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('New Exterior'),
    1::smallint,'Full schema success',atomic_save_slot_test.game_save('New World','New Exterior')
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','combined save should succeed: '||r::text);
  perform atomic_save_slot_test.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World history advances once');
  perform atomic_save_slot_test.assert_true((select count(*)=2 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Playable history advances once');
  perform atomic_save_slot_test.assert_true((select version_number=2 and snapshot=atomic_save_slot_test.game_save('New World','New Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot and committed snapshots agree');
end $$;
rollback;

-- An unchanged snapshot reuses the authoritative versions without adding history.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Old World'),
    '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('Old Exterior'),
    1::smallint,'Reuse unchanged',atomic_save_slot_test.game_save('Old World','Old Exterior')
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','unchanged save should succeed: '||r::text);
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'unchanged World snapshot must be reused');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'unchanged Playable snapshot must be reused');
end $$;
rollback;

-- Stale Playable baseline rejects before the World history changes.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222',0,atomic_save_slot_test.exterior_envelope('New Exterior'),
    1::smallint,'Stale baseline',atomic_save_slot_test.game_save('New World','New Exterior')
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='VERSION_CONFLICT','stale baseline must return conflict');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'stale baseline cannot commit World');
  perform atomic_save_slot_test.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'stale baseline cannot change slot');
end $$;
rollback;

-- World-only save remains supported with explicit JSON null Exterior.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('World Only'),
    null,null,null,1::smallint,'World only',atomic_save_slot_test.game_save('World Only',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','World-only save should succeed: '||r::text);
  perform atomic_save_slot_test.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World-only save adds one World version');
  perform atomic_save_slot_test.assert_true((select snapshot->'exterior'='null'::jsonb from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'World-only save stores explicit null Exterior');
end $$;
rollback;

-- Inject a failure after the World insert; the outer transaction must roll it back.
begin;
select atomic_save_slot_test.seed_case();
select set_config('test.fail_at','world_after_insert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Injected World failure'),
    null,null,null,1::smallint,'World failure',atomic_save_slot_test.game_save('Injected World failure',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','World failure should be reported');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'failed World version must roll back');
  perform atomic_save_slot_test.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'failed World save leaves slot untouched');
end $$;
rollback;
select set_config('test.fail_at','',false);

-- Inject a failure after the Playable insert; the preceding World insert must roll back.
begin;
select atomic_save_slot_test.seed_case();
select set_config('test.fail_at','identity_after_insert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('Injected Playable failure'),
    1::smallint,'Playable failure',atomic_save_slot_test.game_save('New World','Injected Playable failure')
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','Playable failure should be reported');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World insert rolls back on Playable failure');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'failed Playable insert rolls back');
end $$;
rollback;
select set_config('test.fail_at','',false);

-- Inject a failure after the slot upsert; both version histories and the slot revert.
begin;
select atomic_save_slot_test.seed_case();
select set_config('test.fail_at','slot_after_upsert',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('New World'),
    '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('New Exterior'),
    1::smallint,'Slot failure',atomic_save_slot_test.game_save('New World','New Exterior')
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='ATOMIC_SAVE_FAILED','slot failure should be reported');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'World insert rolls back on slot failure');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Playable insert rolls back on slot failure');
  perform atomic_save_slot_test.assert_true((select version_number=1 and snapshot=atomic_save_slot_test.game_save('Old World','Old Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot update rolls back on slot failure');
end $$;
rollback;
select set_config('test.fail_at','',false);

select 'atomic Save Slot full-schema assertions passed' as result;

-- Reject unauthenticated requests before touching any persisted state.
begin;
select atomic_save_slot_test.seed_case();
select set_config('request.jwt.claim.sub','',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('No Auth'),
    null,null,null,1::smallint,'No Auth',atomic_save_slot_test.game_save('No Auth',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='AUTH_REQUIRED','unauthenticated request must be rejected');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'unauthenticated request cannot add a World version');
end $$;
rollback;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);

-- Reject malformed envelope and identity mismatch before any writes.
begin;
select atomic_save_slot_test.seed_case();
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,'{"schema":"wrong","version":1,"document":{}}'::jsonb,
    null,null,null,1::smallint,'Malformed',atomic_save_slot_test.game_save('Malformed',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='INVALID_WORLD_SNAPSHOT','malformed World envelope must be rejected');
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,
    jsonb_set(atomic_save_slot_test.world_envelope('Wrong ID'),'{document,id}','"99999999-9999-9999-9999-999999999999"'::jsonb),
    null,null,null,1::smallint,'Wrong ID',atomic_save_slot_test.game_save('Wrong ID',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='WORLD_IDENTITY_MISMATCH','World identity mismatch must be rejected');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'invalid requests cannot add World versions');
end $$;
rollback;

-- A different authenticated owner must not save another user's World.
begin;
select atomic_save_slot_test.seed_case();
select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Wrong Owner'),
    null,null,null,1::smallint,'Wrong Owner',atomic_save_slot_test.game_save('Wrong Owner',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='WORLD_ACCESS_DENIED','other owner must not save World');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'other owner cannot add World versions');
end $$;
rollback;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);

select 'atomic Save Slot full-schema security assertions passed' as result;
