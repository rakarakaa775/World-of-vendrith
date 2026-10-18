\set ON_ERROR_STOP on
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',false);
DO $$
DECLARE n integer; v_renewed boolean; v_seq bigint;
BEGIN
 BEGIN PERFORM * FROM public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',30); RAISE EXCEPTION 'ASSERT acquire leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT acquire leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.renew_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',30); RAISE EXCEPTION 'ASSERT renew leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT renew leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.read_latest_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'); RAISE EXCEPTION 'ASSERT checkpoint read leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT checkpoint read leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.read_world_runtime_mutations_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',0); RAISE EXCEPTION 'ASSERT journal read leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT journal read leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.read_world_runtime_mutation_by_id_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','b-seed-1'); RAISE EXCEPTION 'ASSERT mutation lookup leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT mutation lookup leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM * FROM public.append_world_runtime_mutation_batch_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','[{}]'::jsonb,'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'); RAISE EXCEPTION 'ASSERT append leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT append leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'v1','hash1',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','stateVersion','v1','tick',1),'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'); RAISE EXCEPTION 'ASSERT checkpoint write leaked'; EXCEPTION WHEN OTHERS THEN IF sqlerrm='ASSERT checkpoint write leaked' THEN RAISE; ELSIF sqlerrm NOT LIKE '%world access denied%' THEN RAISE; END IF; END;
 SELECT count(*) INTO n FROM public.world_runtime_leases WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 IF n<>0 THEN RAISE EXCEPTION 'ASSERT unauthorized lease row exists'; END IF;
 SELECT count(*) INTO n FROM public.world_runtime_mutation_log WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 IF n<>1 THEN RAISE EXCEPTION 'ASSERT private World journal changed'; END IF;
 -- Authorized shared canonical World remains accessible to User A.
 SELECT count(*) INTO n FROM public.read_latest_world_runtime_checkpoint_v1('3695d0b0-788e-42fa-9345-cc3197d0c94d');
 IF n<>1 THEN RAISE EXCEPTION 'ASSERT shared canonical checkpoint read failed'; END IF;
 SELECT count(*) INTO n FROM public.read_world_runtime_mutation_by_id_v1('3695d0b0-788e-42fa-9345-cc3197d0c94d','canonical-seed-1');
 IF n<>1 THEN RAISE EXCEPTION 'ASSERT shared canonical mutation lookup failed'; END IF;
 PERFORM * FROM public.acquire_world_runtime_lease_v1('3695d0b0-788e-42fa-9345-cc3197d0c94d','dddddddd-dddd-4ddd-8ddd-dddddddddddd',30);
 PERFORM * FROM public.append_world_runtime_mutation_batch_v1(
  '3695d0b0-788e-42fa-9345-cc3197d0c94d',
  jsonb_build_array(jsonb_build_object('mutation_id','canonical-a-write','mutation_type','security_test',
   'mutation',jsonb_build_object('expectedStateVersion','cv1','context',jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d')),
   'domain_event',jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d','mutationId','canonical-a-write','stateVersion','cv2'),
   'state_version','cv2','state_hash','chash2','tick',2)),
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd');
 PERFORM public.save_world_runtime_checkpoint_v1('3695d0b0-788e-42fa-9345-cc3197d0c94d',2,2,'cv2','chash2',
  jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d','stateVersion','cv2','tick',2),
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd');
 -- User B still has private-World owner access and working writes.
 PERFORM set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
 PERFORM set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false}',false);
 SELECT count(*) INTO n FROM public.read_latest_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 IF n<>1 THEN RAISE EXCEPTION 'ASSERT owner checkpoint read failed'; END IF;
 PERFORM * FROM public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc',30);
 SELECT renewed INTO v_renewed FROM public.renew_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc',30);
 IF NOT v_renewed THEN RAISE EXCEPTION 'ASSERT owner lease renew failed'; END IF;
 SELECT sequence INTO v_seq FROM public.append_world_runtime_mutation_batch_v1(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  jsonb_build_array(jsonb_build_object('mutation_id','b-owner-write','mutation_type','security_test',
   'mutation',jsonb_build_object('expectedStateVersion','v1','context',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
   'domain_event',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutationId','b-owner-write','stateVersion','v2'),
   'state_version','v2','state_hash','hash2','tick',2)),
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
 IF v_seq<>2 THEN RAISE EXCEPTION 'ASSERT owner append failed'; END IF;
 PERFORM public.save_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',2,2,'v2','hash2',
  jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','stateVersion','v2','tick',2),
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
 RAISE NOTICE 'PASS: private World cross-user access denied; owner and shared canonical World read/write access preserved.';
END $$;
SELECT 'PASS: runtime authorization candidate assertions' AS result;
