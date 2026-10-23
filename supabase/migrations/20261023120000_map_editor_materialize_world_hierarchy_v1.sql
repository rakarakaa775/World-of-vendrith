-- Atomically create the 4 Region + 16 Playable identities and their initial snapshots.
-- The function is intentionally additive; it does not mutate legacy maps or production data by itself.
CREATE OR REPLACE FUNCTION public.map_editor_materialize_world_hierarchy_v1(
  p_world_editor_map_id uuid,
  p_children jsonb
)
RETURNS TABLE(ok boolean, code text, created jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_world public.editor_map_identity%rowtype;
  v_child jsonb;
  v_parent_id uuid;
  v_new_id uuid;
  v_key text;
  v_parent_key text;
  v_type text;
  v_snapshot jsonb;
  v_ids jsonb := jsonb_build_object('world', p_world_editor_map_id::text);
  v_created jsonb := '[]'::jsonb;
  v_region_count integer := 0;
  v_playable_count integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING errcode = '42501', message = 'EDITOR_AUTH_REQUIRED';
  END IF;
  SELECT * INTO v_world
    FROM public.editor_map_identity e
    WHERE e.editor_map_id = p_world_editor_map_id
      AND e.map_type = 'world'
      AND e.created_by = auth.uid()
      AND e.parent_editor_map_id IS NULL
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode = '42501', message = 'EDITOR_WORLD_NOT_ACCESSIBLE';
  END IF;
  -- Reject retries when this world already has regions; partial trees need explicit repair.
  IF EXISTS (SELECT 1 FROM public.editor_map_identity e WHERE e.parent_editor_map_id = p_world_editor_map_id AND e.map_type = 'region') THEN
    RAISE EXCEPTION USING errcode = '23505', message = 'EDITOR_WORLD_HIERARCHY_ALREADY_EXISTS';
  END IF;
  IF p_children IS NULL OR jsonb_typeof(p_children) <> 'array' OR jsonb_array_length(p_children) <> 20 THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'EDITOR_HIERARCHY_EXPECTS_20_CHILDREN';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_children) c
    WHERE jsonb_typeof(c) <> 'object'
       OR nullif(c->>'key','') IS NULL
       OR nullif(c->>'parent_key','') IS NULL
       OR c->>'map_type' NOT IN ('region','playable')
       OR jsonb_typeof(c->'snapshot') <> 'object'
       OR jsonb_typeof(c->'snapshot'->'document') <> 'object'
  ) THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'EDITOR_HIERARCHY_CHILD_INVALID';
  END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(p_children) c WHERE c->>'map_type'='region') <> 4
     OR (SELECT count(*) FROM jsonb_array_elements(p_children) c WHERE c->>'map_type'='playable') <> 16
     OR (SELECT count(DISTINCT c->>'key') FROM jsonb_array_elements(p_children) c) <> 20 THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'EDITOR_HIERARCHY_SHAPE_INVALID';
  END IF;

  -- Reject duplicate/reused keys and malformed parent links before any write.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_children) c
    WHERE c->>'key' = 'world'
       OR (c->>'map_type'='region' AND c->>'parent_key' <> 'world')
       OR (c->>'map_type'='playable' AND NOT EXISTS (
         SELECT 1 FROM jsonb_array_elements(p_children) r
         WHERE r->>'key'=c->>'parent_key' AND r->>'map_type'='region'
       ))
       OR coalesce((c->'snapshot'->'document'->>'width')::integer,0) < 1
       OR coalesce((c->'snapshot'->'document'->>'height')::integer,0) < 1
       OR jsonb_typeof(c->'snapshot'->'document'->'layers') <> 'array'
  ) THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'EDITOR_HIERARCHY_PARENT_OR_SNAPSHOT_INVALID';
  END IF;

  -- Regions first so all Playable parents have permanent UUIDs.
  FOR v_child IN SELECT value FROM jsonb_array_elements(p_children) WHERE value->>'map_type'='region' ORDER BY value->>'key'
  LOOP
    v_key := v_child->>'key';
    v_parent_key := v_child->>'parent_key';
    v_parent_id := (v_ids->>v_parent_key)::uuid;
    v_new_id := gen_random_uuid();
    INSERT INTO public.editor_map_identity(editor_map_id, legacy_map_id, world_id, map_type, parent_editor_map_id, created_by)
    VALUES(v_new_id, NULL, v_world.world_id, 'region', v_parent_id, auth.uid());
    v_snapshot := jsonb_set(jsonb_set(jsonb_set(v_child->'snapshot','{document,id}',to_jsonb(v_new_id::text),true),'{document,parentMapId}',to_jsonb(v_parent_id::text),true),'{document,mapType}',to_jsonb('region'::text),true);
    v_snapshot := jsonb_set(v_snapshot,'{document,name}',to_jsonb(coalesce(nullif(v_child->>'name',''),v_child->'snapshot'->'document'->>'name','Region')),true);
    INSERT INTO public.editor_map_versions(editor_map_id,version_number,label,snapshot,created_by)
    VALUES(v_new_id,1,'world-hierarchy-initial',v_snapshot,auth.uid());
    v_ids := v_ids || jsonb_build_object(v_key,v_new_id::text);
    v_created := v_created || jsonb_build_array(jsonb_build_object('key',v_key,'editor_map_id',v_new_id,'parent_editor_map_id',v_parent_id,'map_type','region'));
    v_region_count := v_region_count + 1;
  END LOOP;

  FOR v_child IN SELECT value FROM jsonb_array_elements(p_children) WHERE value->>'map_type'='playable' ORDER BY value->>'key'
  LOOP
    v_key := v_child->>'key';
    v_parent_key := v_child->>'parent_key';
    IF NOT (v_ids ? v_parent_key) THEN
      RAISE EXCEPTION USING errcode = '22023', message = 'EDITOR_HIERARCHY_PARENT_KEY_UNKNOWN';
    END IF;
    v_parent_id := (v_ids->>v_parent_key)::uuid;
    v_new_id := gen_random_uuid();
    INSERT INTO public.editor_map_identity(editor_map_id, legacy_map_id, world_id, map_type, parent_editor_map_id, created_by)
    VALUES(v_new_id, NULL, v_world.world_id, 'playable', v_parent_id, auth.uid());
    v_snapshot := jsonb_set(jsonb_set(jsonb_set(v_child->'snapshot','{document,id}',to_jsonb(v_new_id::text),true),'{document,parentMapId}',to_jsonb(v_parent_id::text),true),'{document,mapType}',to_jsonb('playable'::text),true);
    v_snapshot := jsonb_set(v_snapshot,'{document,name}',to_jsonb(coalesce(nullif(v_child->>'name',''),v_child->'snapshot'->'document'->>'name','Playable')),true);
    INSERT INTO public.editor_map_versions(editor_map_id,version_number,label,snapshot,created_by)
    VALUES(v_new_id,1,'world-hierarchy-initial',v_snapshot,auth.uid());
    v_ids := v_ids || jsonb_build_object(v_key,v_new_id::text);
    v_created := v_created || jsonb_build_array(jsonb_build_object('key',v_key,'editor_map_id',v_new_id,'parent_editor_map_id',v_parent_id,'map_type','playable'));
    v_playable_count := v_playable_count + 1;
  END LOOP;

  RETURN QUERY SELECT true, 'CREATED'::text, v_created;
END;
$function$;

REVOKE ALL ON FUNCTION public.map_editor_materialize_world_hierarchy_v1(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.map_editor_materialize_world_hierarchy_v1(uuid,jsonb) TO authenticated;
