-- Live Supabase migration: fix ambiguous editor_map_id in identity snapshot loader.
-- The RETURNS TABLE output includes editor_map_id, so unqualified references to
-- editor_map_id inside the query collide with the output parameter.
-- This migration qualifies the table columns explicitly.

create or replace function public.map_editor_load_identity_snapshot_v1(p_editor_map_id uuid)
returns table(ok boolean, code text, editor_map_id uuid, version_id uuid, version_number integer, snapshot jsonb, created_at timestamptz)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  r public.editor_map_identity%rowtype;
  v public.editor_map_versions%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  select e.*
    into r
  from public.editor_map_identity e
  where e.editor_map_id = p_editor_map_id
    and e.created_by = auth.uid();

  if not found then raise exception 'EDITOR_IDENTITY_NOT_ACCESSIBLE'; end if;

  select v.*
    into v
  from public.editor_map_versions v
  where v.editor_map_id = p_editor_map_id
  order by v.version_number desc
  limit 1;

  if not found then
    return query
      select true, 'NO_SNAPSHOT'::text, r.editor_map_id, null::uuid, 0, null::jsonb, null::timestamptz;
    return;
  end if;

  return query
    select true, 'OK'::text, v.editor_map_id, v.id, v.version_number, v.snapshot, v.created_at;
end
$function$;
