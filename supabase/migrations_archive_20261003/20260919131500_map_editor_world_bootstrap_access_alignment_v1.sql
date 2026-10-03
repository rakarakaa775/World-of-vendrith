create or replace function public.map_editor_bootstrap_world_identity_v1(p_legacy_map_id uuid)
returns table(editor_map_id uuid,legacy_map_id uuid,world_id uuid,map_type text,parent_editor_map_id uuid,created_by uuid)
language plpgsql security definer set search_path=public,pg_temp
as $function$
declare m public.maps%rowtype; existing public.editor_map_identity%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='EDITOR_AUTH_REQUIRED'; end if;
 if not public.map_editor_can_access_v1(p_legacy_map_id) then raise exception using errcode='42501',message='EDITOR_MAP_NOT_ACCESSIBLE'; end if;
 select * into m from public.maps where id=p_legacy_map_id;
 if not found then raise exception using errcode='P0002',message='EDITOR_MAP_NOT_FOUND'; end if;
 if m.map_type<>'world' then raise exception using errcode='23514',message='EDITOR_WORLD_LEGACY_TYPE_INVALID'; end if;
 select * into existing from public.editor_map_identity where legacy_map_id=m.id;
 if found then
  if existing.map_type<>'world' or existing.parent_editor_map_id is not null or existing.world_id is distinct from m.world_id then raise exception using errcode='23514',message='EDITOR_WORLD_IDENTITY_INVALID'; end if;
  if existing.created_by<>auth.uid() then raise exception using errcode='42501',message='EDITOR_WORLD_IDENTITY_NOT_ACCESSIBLE'; end if;
  return query select existing.editor_map_id,existing.legacy_map_id,existing.world_id,existing.map_type,existing.parent_editor_map_id,existing.created_by; return;
 end if;
 insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by)
 values(m.id,m.id,m.world_id,'world',null,auth.uid())
 returning editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by
 into editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by;
 return next;
end;
$function$;
revoke all on function public.map_editor_bootstrap_world_identity_v1(uuid) from public,anon;
grant execute on function public.map_editor_bootstrap_world_identity_v1(uuid) to authenticated;