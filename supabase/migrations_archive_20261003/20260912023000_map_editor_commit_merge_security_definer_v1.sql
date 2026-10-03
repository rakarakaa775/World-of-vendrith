-- Map Editor: the authenticated save RPC performs owner checks itself and must
-- write the authoritative version plus derived projections in one transaction.
-- Keep the function non-public by requiring authentication and verifying map
-- ownership with auth.uid(); SECURITY DEFINER is needed because the protected
-- map tables intentionally have no direct client RLS write policy.
CREATE OR REPLACE FUNCTION public.map_editor_commit_merge_v1(
  p_map_id uuid,
  p_expected_version integer,
  p_snapshot jsonb,
  p_label text DEFAULT 'merge'
)
RETURNS TABLE(status text, version_id uuid, version_number integer, current_version integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_map public.maps%rowtype;
  v_current integer;
  v_version_id uuid;
  v_next integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'snapshot must be a JSON object';
  end if;

  select * into v_map
  from public.maps
  where id = p_map_id
    and created_by = auth.uid()
  for update;

  if not found then
    raise exception 'map not found or not owned by current user';
  end if;

  select coalesce(max(mv.version_number), 0) into v_current
  from public.map_versions mv
  where mv.map_id = p_map_id;

  if p_expected_version <> v_current then
    return query select 'conflict'::text, null::uuid, null::integer, v_current;
    return;
  end if;

  v_next := v_current + 1;

  insert into public.map_versions (map_id, version_number, label, snapshot, created_by)
  values (
    p_map_id,
    v_next,
    coalesce(nullif(btrim(p_label), ''), 'merge'),
    p_snapshot,
    auth.uid()
  )
  returning id into v_version_id;

  perform public.map_editor_reconcile_after_merge_v1(
    p_map_id,
    v_version_id,
    p_snapshot
  );

  update public.maps
  set updated_at = now()
  where id = p_map_id;

  return query select 'committed'::text, v_version_id, v_next, v_next;
exception
  when unique_violation then
    return query
      select 'conflict'::text, null::uuid, null::integer,
             (select coalesce(max(mv.version_number), 0)
              from public.map_versions mv
              where mv.map_id = p_map_id);
end;
$function$;
