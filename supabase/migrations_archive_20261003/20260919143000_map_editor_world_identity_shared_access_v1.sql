create or replace function public.map_editor_bootstrap_world_identity_v1(p_legacy_map_id uuid)
returns table(editor_map_id uuid, legacy_map_id uuid, world_id uuid, map_type text, parent_editor_map_id uuid, created_by uuid)
language plpgsql security definer set search_path=public,pg_temp
as $function$
declare m public.maps%rowtype; existing public.editor_map_identity%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='EDITOR_AUTH_REQUIRED'; end if;
 if not public.map_editor_can_access_v1(p_legacy_map_id) then raise exception using errcode='42501',message='EDITOR_MAP_NOT_ACCESSIBLE'; end if;
 select m0.* into m from public.maps m0 where m0.id=p_legacy_map_id;
 if not found then raise exception using errcode='P0002',message='EDITOR_MAP_NOT_FOUND'; end if;
 if m.map_type<>'world' then raise exception using errcode='23514',message='EDITOR_WORLD_LEGACY_TYPE_INVALID'; end if;
 select e.* into existing from public.editor_map_identity e where e.legacy_map_id=m.id;
 if found then
   if existing.map_type<>'world' or existing.parent_editor_map_id is not null or existing.world_id is distinct from m.world_id then raise exception using errcode='23514',message='EDITOR_WORLD_IDENTITY_INVALID'; end if;
   return query select existing.editor_map_id,existing.legacy_map_id,existing.world_id,existing.map_type,existing.parent_editor_map_id,existing.created_by;
   return;
 end if;
 insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by) values(m.id,m.id,m.world_id,'world',null,auth.uid());
 return query select e.editor_map_id,e.legacy_map_id,e.world_id,e.map_type,e.parent_editor_map_id,e.created_by from public.editor_map_identity e where e.editor_map_id=m.id;
end $function$;

create or replace function public.map_editor_create_child_v1(
 p_parent_editor_map_id uuid,p_map_type text,p_legacy_map_id uuid default null)
returns table(editor_map_id uuid,legacy_map_id uuid,world_id uuid,map_type text,parent_editor_map_id uuid,created_by uuid)
language plpgsql security definer set search_path=public,pg_temp
as $function$
declare v_parent public.editor_map_identity%rowtype; v_legacy public.maps%rowtype; v_id uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_map_type not in ('region','playable') then raise exception 'EDITOR_CHILD_TYPE_INVALID' using errcode='22023'; end if;
 if p_parent_editor_map_id is null then raise exception 'EDITOR_PARENT_REQUIRED' using errcode='22023'; end if;
 select e.* into v_parent from public.editor_map_identity e where e.editor_map_id=p_parent_editor_map_id and (e.map_type='world' or e.created_by=auth.uid()) for update;
 if not found then raise exception 'EDITOR_PARENT_NOT_ACCESSIBLE' using errcode='42501'; end if;
 if (p_map_type='region' and v_parent.map_type<>'world') or (p_map_type='playable' and v_parent.map_type<>'region') then raise exception 'EDITOR_PARENT_TYPE_INVALID' using errcode='22023'; end if;
 if p_legacy_map_id is not null then
   select m.* into v_legacy from public.maps m where m.id=p_legacy_map_id;
   if not found then raise exception 'LEGACY_MAP_NOT_FOUND' using errcode='P0002'; end if;
   if v_legacy.created_by<>auth.uid() then raise exception 'LEGACY_MAP_NOT_ACCESSIBLE' using errcode='42501'; end if;
   if v_legacy.world_id<>v_parent.world_id then raise exception 'LEGACY_MAP_WORLD_MISMATCH' using errcode='22023'; end if;
   if p_map_type='region' then raise exception 'REGION_CANNOT_MAP_LEGACY_MAP' using errcode='22023'; end if;
   if v_legacy.map_type<>'exterior' then raise exception 'PLAYABLE_LEGACY_MAP_TYPE_INVALID' using errcode='22023'; end if;
   if exists(select 1 from public.editor_map_identity e where e.legacy_map_id=p_legacy_map_id) or exists(select 1 from public.editor_map_interior i where i.legacy_map_id=p_legacy_map_id) then raise exception 'LEGACY_MAP_ALREADY_MAPPED' using errcode='23505'; end if;
 end if;
 insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by) values(gen_random_uuid(),p_legacy_map_id,v_parent.world_id,p_map_type,p_parent_editor_map_id,auth.uid()) returning public.editor_map_identity.editor_map_id into v_id;
 return query select e.editor_map_id,e.legacy_map_id,e.world_id,e.map_type,e.parent_editor_map_id,e.created_by from public.editor_map_identity e where e.editor_map_id=v_id;
end $function$;