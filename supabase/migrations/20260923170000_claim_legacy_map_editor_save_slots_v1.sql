create unique index if not exists profiles_display_name_lower_unique
on public.profiles (lower(display_name));

create or replace function public.claim_vandrith_legacy_save_slots_v1()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  uid uuid := auth.uid();
  map_ids uuid[];
  slot_count integer := 0;
  version_count integer := 0;
  identity_count integer := 0;
begin
  if uid is null then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.user_id = uid and lower(p.display_name) = 'raka775'
  ) then
    return jsonb_build_object('ok',false,'code','NOT_LEGACY_OWNER');
  end if;

  select coalesce(array_agg(distinct s.map_id), '{}')
    into map_ids
  from public.map_editor_save_slots s
  where s.slot_number in (1,2,3);

  update public.maps m set created_by = uid, updated_at = now()
  where m.id = any(map_ids);

  update public.map_versions mv set created_by = uid
  where mv.map_id = any(map_ids);
  get diagnostics version_count = row_count;

  update public.map_editor_save_slots s set created_by = uid, updated_at = now()
  where s.map_id = any(map_ids);
  get diagnostics slot_count = row_count;

  update public.editor_map_identity e set created_by = uid, updated_at = now()
  where e.legacy_map_id = any(map_ids)
     or e.editor_map_id in (
       select emi.playable_editor_map_id
       from public.editor_map_interior emi
       where emi.legacy_map_id = any(map_ids)
     );
  get diagnostics identity_count = row_count;

  update public.editor_map_versions ev set created_by = uid
  where ev.editor_map_id in (
    select e.editor_map_id from public.editor_map_identity e where e.created_by = uid
  );

  return jsonb_build_object('ok',true,'code','CLAIMED','slot_count',slot_count,
    'map_version_count',version_count,'identity_count',identity_count);
end
$function$;

revoke all on function public.claim_vandrith_legacy_save_slots_v1() from public;
grant execute on function public.claim_vandrith_legacy_save_slots_v1() to authenticated;