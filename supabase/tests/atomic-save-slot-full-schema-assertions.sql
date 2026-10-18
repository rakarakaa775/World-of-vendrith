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
  perform atomic_save_slot_test.assert_true(
    r->>'projection_status' in ('committed','failed','not_run','reused'),
    'projection outcome must be explicit even when the underlying merge RPC omits optional metadata: '||r::text
  );
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


-- A playable Interior must never be accepted as the Exterior portion of a Game Save.
begin;
select atomic_save_slot_test.seed_case();
do $interior_full_schema$
declare
  r jsonb;
  v_exterior jsonb := jsonb_set(atomic_save_slot_test.exterior_envelope('Interior masquerading as Exterior'), '{document,playableSpace}', '"interior"'::jsonb, true);
  v_slot jsonb := jsonb_set(atomic_save_slot_test.game_save('Interior guard','Interior masquerading as Exterior'), '{exterior,playableSpace}', '"interior"'::jsonb, true);
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,
    atomic_save_slot_test.world_envelope('Interior guard'),
    '22222222-2222-2222-2222-222222222222',1,
    v_exterior,1::smallint,'Reject Interior',v_slot
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='INVALID_EXTERIOR_REQUEST','Interior must not be stored as Exterior');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'Interior rejection cannot add a World version');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'Interior rejection cannot add an Exterior version');
  perform atomic_save_slot_test.assert_true((select version_number=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'Interior rejection leaves the slot untouched');
end $interior_full_schema$;
rollback;

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
    null,null,null,1::smallint,'Wrong ID',
    jsonb_set(atomic_save_slot_test.game_save('Wrong ID',null),'{world,id}','"99999999-9999-9999-9999-999999999999"'::jsonb)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='WORLD_IDENTITY_MISMATCH','World identity mismatch must be rejected');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'invalid requests cannot add World versions');
end $$;
rollback;

-- A different authenticated user may save a private slot on the shared canonical World.
-- Slot ownership is per user; canonical World access is governed by map_editor_can_access_v1.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values ('cccccccc-cccc-cccc-cccc-cccccccccccc') on conflict (id) do nothing;
select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Private Slot User C'),
    null,null,null,1::smallint,'User C Slot',atomic_save_slot_test.game_save('Private Slot User C',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','authorized non-owner must save a private slot on shared canonical World: '||r::text);
  perform atomic_save_slot_test.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'shared World history should advance once');
  perform atomic_save_slot_test.assert_true((select created_by='cccccccc-cccc-cccc-cccc-cccccccccccc' and snapshot=atomic_save_slot_test.game_save('Private Slot User C',null) from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1 and created_by='cccccccc-cccc-cccc-cccc-cccccccccccc'),'new slot must be owned by the requesting user');
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
do $$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='true' and r->'snapshot'=atomic_save_slot_test.game_save('Old World','Old Exterior'),'user A must still load only A private slot');
end $$;
rollback;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);

select 'atomic Save Slot full-schema security assertions passed' as result;

-- Slot numbers are private per user: the same slot number may coexist on the shared World.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values ('cccccccc-cccc-cccc-cccc-cccccccccccc') on conflict (id) do nothing;
select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',false);
do $slot_owner$
declare r jsonb;
begin
  r := public.map_editor_save_game_slot_atomic_v1(
    '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('User C Slot One'),
    null,null,null,1::smallint,'User C Slot One',atomic_save_slot_test.game_save('User C Slot One',null)
  );
  perform atomic_save_slot_test.assert_true(r->>'ok'='true','another user may own the same slot number on a shared World: '||r::text);
  perform atomic_save_slot_test.assert_true((select count(*)=2 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot number must coexist once per owner');
  perform atomic_save_slot_test.assert_true((select count(*)=1 from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1 and created_by='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and snapshot=atomic_save_slot_test.game_save('Old World','Old Exterior')),'user C save must not alter user A slot');
end $slot_owner$;
rollback;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);

-- Verify the RPC's execute grants match the intended Supabase caller boundary.
do $$
declare
  v_signature constant text := 'public.map_editor_save_game_slot_atomic_v1(uuid, integer, jsonb, uuid, integer, jsonb, smallint, text, jsonb)';
begin
  perform atomic_save_slot_test.assert_true(
    not has_function_privilege('anon', v_signature, 'EXECUTE'),
    'anon role must not execute atomic Save Slot RPC'
  );
  perform atomic_save_slot_test.assert_true(
    has_function_privilege('authenticated', v_signature, 'EXECUTE'),
    'authenticated role must execute atomic Save Slot RPC'
  );
end $$;

select 'atomic Save Slot execute-grant assertions passed' as result;


-- Load Slot must reject a plausible Exterior document whose persisted identity is missing.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,id}','"44444444-4444-4444-4444-444444444444"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $exterior_identity_missing$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_IDENTITY_NOT_ACCESSIBLE','unknown Exterior identity must be rejected on full schema');
end
$exterior_identity_missing$;
rollback;

-- A foreign-owner Exterior identity cannot be returned through this user's World slot.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
-- Model a corrupt legacy row to exercise the RPC owner filter independently.
set local session_replication_role = replica;
update public.editor_map_identity set created_by='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
where editor_map_id='22222222-2222-2222-2222-222222222222';
set local session_replication_role = origin;
do $exterior_identity_foreign$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_IDENTITY_NOT_ACCESSIBLE','foreign-owner Exterior identity must be rejected on full schema');
end
$exterior_identity_foreign$;
rollback;

-- The persisted parent of an Exterior must resolve to an owner-scoped Region in this World.
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
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_PARENT_INVALID','invalid Exterior parent must be rejected on full schema');
end
$exterior_parent_invalid$;
rollback;

-- The slot's Exterior document must match a persisted version for that identity.
begin;
select atomic_save_slot_test.seed_case();
update public.map_editor_save_slots
set snapshot=jsonb_set(snapshot,'{exterior,name}','"Forged Exterior"',false)
where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1;
do $exterior_snapshot_mismatch$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_VERSION_SNAPSHOT_MISMATCH','unpersisted Exterior content must be rejected on full schema');
end
$exterior_snapshot_mismatch$;
rollback;

-- Load Slot must reject a Region parent that belongs to another World.
begin;
select atomic_save_slot_test.seed_case();
-- Model a corrupt cross-World parent row so the RPC's world-scope check is exercised.
set local session_replication_role = replica;
update public.editor_map_identity
set world_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
where editor_map_id='33333333-3333-3333-3333-333333333333';
set local session_replication_role = origin;
do $exterior_parent_world_mismatch$
declare r jsonb;
begin
  r := public.map_editor_load_save_slot_validated_v1('11111111-1111-1111-1111-111111111111',1::smallint);
  perform atomic_save_slot_test.assert_true(r->>'ok'='false' and r->>'code'='EXTERIOR_PARENT_INVALID','Exterior parent from another World must be rejected');
end
$exterior_parent_world_mismatch$;
rollback;

-- Verify Load Slot is callable only by authenticated sessions, not anon/public.
do $load_slot_grants$
declare
  v_signature constant text := 'public.map_editor_load_save_slot_validated_v1(uuid, smallint)';
begin
  perform atomic_save_slot_test.assert_true(
    not has_function_privilege('anon', v_signature, 'EXECUTE'),
    'anon role must not execute validated Load Slot RPC'
  );
  perform atomic_save_slot_test.assert_true(
    has_function_privilege('authenticated', v_signature, 'EXECUTE'),
    'authenticated role must execute validated Load Slot RPC'
  );
end
$load_slot_grants$;

select 'validated Load Slot parent-scope and execute-grant assertions passed' as result;


-- RLS must show each authenticated user only their own slot rows, even on shared canonical World.
begin;
select atomic_save_slot_test.seed_case();
insert into auth.users(id) values ('cccccccc-cccc-cccc-cccc-cccccccccccc') on conflict (id) do nothing;
insert into public.map_editor_save_slots(map_id,slot_number,label,version_id,version_number,snapshot,created_by)
values ('11111111-1111-1111-1111-111111111111',1,'User C private slot','aaaaaaaa-1111-1111-1111-111111111111',1,atomic_save_slot_test.game_save('Old World','Old Exterior'),'cccccccc-cccc-cccc-cccc-cccccccccccc');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);
do $$
begin
  if (select count(*) from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111') <> 1 then
    raise exception 'RLS must expose only user A private slot';
  end if;
end $$;
select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',true);
do $$
begin
  if (select count(*) from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111') <> 1 then
    raise exception 'RLS must expose only user C private slot';
  end if;
end $$;
reset role;
rollback;
