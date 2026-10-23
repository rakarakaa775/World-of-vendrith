-- Integration test for map_editor_materialize_world_hierarchy_v1.
-- Run only against a disposable PostgreSQL database with the reconstructed schema.
DO $test$
DECLARE
  v_user uuid := gen_random_uuid();
  v_world_id uuid;
  v_world_map_id uuid;
  v_children jsonb := '[]'::jsonb;
  v_result record;
  v_region_key text;
  v_playable integer;
  v_key text;
  v_parent text;
  v_type text;
  v_snapshot jsonb;
  v_count integer;
BEGIN
  INSERT INTO auth.users(id) VALUES (v_user);
  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
  INSERT INTO public.worlds(name) VALUES ('Hierarchy SQL Test ' || v_user::text) RETURNING id INTO v_world_id;
  INSERT INTO public.editor_map_identity(world_id,map_type,parent_editor_map_id,created_by)
  VALUES(v_world_id,'world',NULL,v_user) RETURNING editor_map_id INTO v_world_map_id;

  FOR v_region_key IN SELECT unnest(ARRAY['region-a','region-b','region-c','region-d']) LOOP
    v_snapshot := jsonb_build_object('schema','vandrith.map-document','version',1,
      'document',jsonb_build_object('id','seed-'||v_region_key,'parentMapId',v_world_map_id::text,
        'mapType','region','name',upper(v_region_key),'width',4,'height',4,'layers','[]'::jsonb));
    v_children := v_children || jsonb_build_array(jsonb_build_object(
      'key',v_region_key,'parent_key','world','map_type','region','name',upper(v_region_key),'snapshot',v_snapshot));
    FOR v_playable IN 1..4 LOOP
      v_key := v_region_key||'-playable-'||v_playable;
      v_snapshot := jsonb_build_object('schema','vandrith.map-document','version',1,
        'document',jsonb_build_object('id','seed-'||v_key,'parentMapId','seed-'||v_region_key,
          'mapType','playable','name',upper(v_key),'width',8,'height',8,'layers','[]'::jsonb));
      v_children := v_children || jsonb_build_array(jsonb_build_object(
        'key',v_key,'parent_key',v_region_key,'map_type','playable','name',upper(v_key),'snapshot',v_snapshot));
    END LOOP;
  END LOOP;

  SELECT * INTO v_result FROM public.map_editor_materialize_world_hierarchy_v1(v_world_map_id,v_children);
  IF NOT v_result.ok OR v_result.code <> 'CREATED' OR jsonb_array_length(v_result.created) <> 20 THEN
    RAISE EXCEPTION 'Unexpected RPC result: %', row_to_json(v_result);
  END IF;
  SELECT count(*) INTO v_count FROM public.editor_map_identity WHERE parent_editor_map_id=v_world_map_id;
  IF v_count <> 4 THEN RAISE EXCEPTION 'Expected 4 regions, got %',v_count; END IF;
  SELECT count(*) INTO v_count FROM public.editor_map_identity p
    JOIN public.editor_map_identity c ON c.parent_editor_map_id=p.editor_map_id
    WHERE p.parent_editor_map_id=v_world_map_id AND c.map_type='playable';
  IF v_count <> 16 THEN RAISE EXCEPTION 'Expected 16 playables, got %',v_count; END IF;
  SELECT count(*) INTO v_count FROM public.editor_map_versions v
    JOIN public.editor_map_identity e ON e.editor_map_id=v.editor_map_id
    WHERE (e.parent_editor_map_id=v_world_map_id OR e.parent_editor_map_id IN
      (SELECT editor_map_id FROM public.editor_map_identity WHERE parent_editor_map_id=v_world_map_id))
      AND v.version_number=1 AND v.snapshot->'document'->>'id'=e.editor_map_id::text
      AND v.snapshot->'document'->>'parentMapId'=e.parent_editor_map_id::text;
  IF v_count <> 20 THEN RAISE EXCEPTION 'Expected 20 correctly rewritten initial snapshots, got %',v_count; END IF;
  SELECT count(*) INTO v_count
  FROM jsonb_array_elements(v_result.created) c
  CROSS JOIN LATERAL public.map_editor_load_identity_snapshot_v1((c->>'editor_map_id')::uuid) loaded
  WHERE loaded.ok AND loaded.code='OK'
    AND loaded.editor_map_id=(c->>'editor_map_id')::uuid
    AND loaded.snapshot->'document'->>'id'=loaded.editor_map_id::text
    AND loaded.snapshot->'document'->>'parentMapId'=c->>'parent_editor_map_id'
    AND loaded.snapshot->'document'->>'mapType'=c->>'map_type';
  IF v_count <> 20 THEN RAISE EXCEPTION 'Authoritative snapshot read-back failed for % of 20 children',v_count; END IF;

  -- Retry must be rejected without creating duplicate descendants.
  BEGIN
    PERFORM * FROM public.map_editor_materialize_world_hierarchy_v1(v_world_map_id,v_children);
    RAISE EXCEPTION 'Expected duplicate hierarchy rejection';
  EXCEPTION WHEN SQLSTATE '23505' THEN NULL;
  END;
  SELECT count(*) INTO v_count FROM public.editor_map_identity WHERE parent_editor_map_id=v_world_map_id;
  IF v_count <> 4 THEN RAISE EXCEPTION 'Retry changed hierarchy unexpectedly'; END IF;

  -- Invalid payload must fail before any child write on a separate world.
  INSERT INTO public.worlds(name) VALUES ('Hierarchy Rollback Test ' || v_user::text) RETURNING id INTO v_world_id;
  INSERT INTO public.editor_map_identity(world_id,map_type,parent_editor_map_id,created_by)
  VALUES(v_world_id,'world',NULL,v_user) RETURNING editor_map_id INTO v_world_map_id;
  BEGIN
    PERFORM * FROM public.map_editor_materialize_world_hierarchy_v1(v_world_map_id,'[]'::jsonb);
    RAISE EXCEPTION 'Expected malformed payload rejection';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  SELECT count(*) INTO v_count FROM public.editor_map_identity WHERE parent_editor_map_id=v_world_map_id;
  IF v_count <> 0 THEN RAISE EXCEPTION 'Invalid payload left partial descendants'; END IF;
END;
$test$;

SELECT 'world hierarchy integration assertions passed' AS result;
