\set ON_ERROR_STOP on
-- Run after hosted-runtime-disposable-fixture.sql, candidate SQL, setup SQL,
-- and candidate-authorization-assertions.sql in a disposable PostgreSQL 17 DB.
DO $$ DECLARE n integer; s bigint; BEGIN
 PERFORM set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
 PERFORM set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false}',false);
 SELECT sequence INTO s FROM public.append_world_runtime_mutation_batch_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  jsonb_build_array(jsonb_build_object('mutation_id','b-owner-write','mutation_type','security_test',
   'mutation',jsonb_build_object('expectedStateVersion','v1','context',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
   'domain_event',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutationId','b-owner-write','stateVersion','v2'),
   'state_version','v2','state_hash','hash2','tick',2)),
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
 IF s<>2 THEN RAISE EXCEPTION 'ASSERT idempotent retry sequence mismatch'; END IF;
 SELECT count(*) INTO n FROM public.world_runtime_mutation_log WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND mutation_id='b-owner-write';
 IF n<>1 THEN RAISE EXCEPTION 'ASSERT idempotent retry duplicated journal row'; END IF;
 BEGIN PERFORM * FROM public.append_world_runtime_mutation_batch_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','[{}]'::jsonb,'ffffffff-ffff-4fff-8fff-ffffffffffff');
  RAISE EXCEPTION 'ASSERT foreign token accepted'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT foreign token accepted' THEN RAISE; ELSIF sqlerrm NOT LIKE '%runtime authority lease is missing or expired%' THEN RAISE; END IF; END;
 UPDATE public.world_runtime_leases SET lease_until=now()-interval '1 second' WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 BEGIN PERFORM * FROM public.append_world_runtime_mutation_batch_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','[{}]'::jsonb,'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  RAISE EXCEPTION 'ASSERT expired lease accepted'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT expired lease accepted' THEN RAISE; ELSIF sqlerrm NOT LIKE '%runtime authority lease is missing or expired%' THEN RAISE; END IF; END;
 PERFORM set_config('request.jwt.claim.sub','',false);
 PERFORM set_config('request.jwt.claims','{"role":"anon","is_anonymous":true}',false);
 BEGIN PERFORM * FROM public.read_latest_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  RAISE EXCEPTION 'ASSERT anonymous checkpoint read accepted'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT anonymous checkpoint read accepted' THEN RAISE; ELSIF sqlerrm NOT LIKE '%authentication required%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ffffffff-ffff-4fff-8fff-ffffffffffff',30);
  RAISE EXCEPTION 'ASSERT anonymous lease acquire accepted'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT anonymous lease acquire accepted' THEN RAISE; ELSIF sqlerrm NOT LIKE '%authentication required%' THEN RAISE; END IF; END;
 RAISE NOTICE 'PASS: idempotent retry, foreign-token rejection, expired-lease rejection, and anonymous rejection';
END $$;
SELECT 'PASS28_EXTRA_NEGATIVE_AND_IDEMPOTENCY_OK' AS result;
