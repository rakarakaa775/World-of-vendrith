-- Live Supabase migration: fix ambiguous PL/pgSQL identifiers in identity snapshot loader.
-- Qualify table columns and use non-conflicting local variable names.

create or replace function public.map_editor_load_identity_snapshot_v1(p_editor_map_id uuid)
returns table(ok boolean, code text, editor_map_id uuid, version_id uuid, version_number integer, snapshot jsonb, created_at timestamptz)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  identity_row public.editor_map_identity%rowtype;
  version_row public.editor_map_versions%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  select e.*
    into identity_row
  from public.editor_map_identity e
  where e.editor_map_id = p_editor_map_id
    and e.created_by = auth.uid();

  if not found then raise exception 'EDITOR_IDENTITY_NOT_ACCESSIBLE'; end if;

  select ev.*
    into version_row
  from public.editor_map_versions ev
  where ev.editor_map_id = p_editor_map_id
  order by ev.version_number desc
  limit 1;

  if not found then
    return query
      select true, 'NO_SNAPSHOT'::text, identity_row.editor_map_id, null::uuid, 0, null::jsonb, null::timestamptz;
    return;
  end if;

  return query
    select true, 'OK'::text, version_row.editor_map_id, version_row.id, version_row.version_number, version_row.snapshot, version_row.created_at;
end
$function$;
