\set ON_ERROR_STOP on
CREATE OR REPLACE FUNCTION public.map_editor_can_access_v1(p_map_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
 SELECT EXISTS (
  SELECT 1 FROM public.maps m WHERE m.id=p_map_id AND (
   m.created_by=auth.uid()
   OR (m.map_type='world' AND m.world_id='3695d0b0-788e-42fa-9345-cc3197d0c94d'::uuid)
  )
 )
$$;
TRUNCATE public.world_runtime_mutation_log, public.world_runtime_checkpoints, public.world_runtime_leases, public.maps, public.worlds CASCADE;
INSERT INTO public.worlds(id,name) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Private World A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Private World B'),
 ('3695d0b0-788e-42fa-9345-cc3197d0c94d','Canonical World');
INSERT INTO public.maps(id,world_id,created_by,map_type) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','world'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','world'),
 ('3695d0b0-788e-42fa-9345-cc3197d0c941','3695d0b0-788e-42fa-9345-cc3197d0c94d','22222222-2222-4222-8222-222222222222','world');
INSERT INTO public.world_runtime_mutation_log(world_id,sequence,mutation_id,mutation_type,mutation,domain_event,state_version,state_hash,tick) VALUES
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,'b-seed-1','seed',
  jsonb_build_object('context',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
  jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutationId','b-seed-1','stateVersion','v1'),'v1','hash1',1),
 ('3695d0b0-788e-42fa-9345-cc3197d0c94d',1,'canonical-seed-1','seed',
  jsonb_build_object('context',jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d')),
  jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d','mutationId','canonical-seed-1','stateVersion','cv1'),'cv1','chash1',1);
INSERT INTO public.world_runtime_checkpoints(world_id,sequence,tick,state_version,state_hash,state) VALUES
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'v1','hash1',jsonb_build_object('worldId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','stateVersion','v1','tick',1)),
 ('3695d0b0-788e-42fa-9345-cc3197d0c94d',1,1,'cv1','chash1',jsonb_build_object('worldId','3695d0b0-788e-42fa-9345-cc3197d0c94d','stateVersion','cv1','tick',1));
