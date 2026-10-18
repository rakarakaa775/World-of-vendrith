\set ON_ERROR_STOP on
INSERT INTO public.worlds(id,name) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Private World A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Private World B');
INSERT INTO public.maps(id,world_id,created_by,map_type) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','world'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','world');
INSERT INTO public.world_runtime_mutation_log(world_id,sequence,mutation_id,mutation_type,mutation,domain_event,state_version,state_hash,tick)
VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,'b-seed-1','seed',
 jsonb_build_object('context',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
 jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutationId','b-seed-1','stateVersion','v1'),
 'v1','hash1',1);
INSERT INTO public.world_runtime_checkpoints(world_id,sequence,tick,state_version,state_hash,state)
VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'v1','hash1',
 jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','stateVersion','v1','tick',1));
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',false);
DO $$
DECLARE v_acquired boolean; v_count integer; v_seq bigint;
BEGIN
 SELECT acquired INTO v_acquired FROM public.acquire_world_runtime_lease_v1(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',30);
 IF NOT v_acquired THEN RAISE EXCEPTION 'Expected vulnerability: unauthorized lease did not acquire'; END IF;
 SELECT count(*) INTO v_count FROM public.read_latest_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 IF v_count <> 1 THEN RAISE EXCEPTION 'Expected vulnerability: checkpoint read did not return private World B data'; END IF;
 SELECT count(*) INTO v_count FROM public.read_world_runtime_mutations_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',0);
 IF v_count <> 1 THEN RAISE EXCEPTION 'Expected vulnerability: mutation read did not return private World B data'; END IF;
 SELECT sequence INTO v_seq FROM public.append_world_runtime_mutation_batch_v1(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  jsonb_build_array(jsonb_build_object(
   'mutation_id','unauthorized-a-write','mutation_type','security_repro',
   'mutation',jsonb_build_object('expectedStateVersion','v1','context',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
   'domain_event',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutationId','unauthorized-a-write','stateVersion','v2'),
   'state_version','v2','state_hash','hash2','tick',2
  )), 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 IF v_seq <> 2 THEN RAISE EXCEPTION 'Expected vulnerability: unauthorized append did not create sequence 2'; END IF;
 PERFORM public.save_world_runtime_checkpoint_v1(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',2,2,'v2','hash2',
  jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','stateVersion','v2','tick',2),
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 SELECT count(*) INTO v_count FROM public.world_runtime_mutation_log
  WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND mutation_id='unauthorized-a-write';
 IF v_count <> 1 THEN RAISE EXCEPTION 'Expected vulnerability: unauthorized mutation row missing'; END IF;
 SELECT count(*) INTO v_count FROM public.world_runtime_checkpoints
  WHERE world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND sequence=2;
 IF v_count <> 1 THEN RAISE EXCEPTION 'Expected vulnerability: unauthorized checkpoint write missing'; END IF;
 RAISE NOTICE 'VULNERABILITY_REPRODUCED: User A acquired lease, read private World B checkpoint and journal, appended mutation, and saved checkpoint.';
END $$;
SELECT 'PASS: unauthorized cross-World lease/read/append/checkpoint behavior reproduced on disposable PostgreSQL only' AS result;
