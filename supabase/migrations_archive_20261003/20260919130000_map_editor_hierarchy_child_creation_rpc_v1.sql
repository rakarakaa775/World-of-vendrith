create or replace function public.map_editor_create_child_v1(p_parent_editor_map_id uuid,p_map_type text,p_legacy_map_id uuid default null) returns table(editor_map_id uuid,legacy_map_id uuid,world_id uuid,map_type text,parent_editor_map_id uuid,created_by uuid) language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.editor_map_identity%rowtype; l public.maps%rowtype; id uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_map_type not in ('region','playable') then raise exception 'EDITOR_CHILD_TYPE_INVALID' using errcode='22023'; end if;
 if p_parent_editor_map_id is null then raise exception 'EDITOR_PARENT_REQUIRED' using errcode='22023'; end if;
 select * into p from public.editor_map_identity where editor_map_id=p_parent_editor_map_id and created_by=auth.uid() for update;
 if not found then raise exception 'EDITOR_PARENT_NOT_ACCESSIBLE' using errcode='42501'; end if;
 if (p_map_type='region' and p.map_type<>'world') or (p_map_type='playable' and p.map_type<>'region') then raise exception 'EDITOR_PARENT_TYPE_INVALID' using errcode='22023'; end if;
 if p_legacy_map_id is not null then
  select * into l from public.maps where id=p_legacy_map_id;
  if not found then raise exception 'LEGACY_MAP_NOT_FOUND' using errcode='P0002'; end if;
  if l.created_by<>auth.uid() then raise exception 'LEGACY_MAP_NOT_ACCESSIBLE' using errcode='42501'; end if;
  if l.world_id<>p.world_id then raise exception 'LEGACY_MAP_WORLD_MISMATCH' using errcode='22023'; end if;
  if p_map_type='region' then raise exception 'REGION_CANNOT_MAP_LEGACY_MAP' using errcode='22023'; end if;
  if l.map_type<>'exterior' then raise exception 'PLAYABLE_LEGACY_MAP_TYPE_INVALID' using errcode='22023'; end if;
  if exists(select 1 from public.editor_map_identity where legacy_map_id=p_legacy_map_id) or exists(select 1 from public.editor_map_interior where legacy_map_id=p_legacy_map_id) then raise exception 'LEGACY_MAP_ALREADY_MAPPED' using errcode='23505'; end if;
 end if;
 insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by) values(gen_random_uuid(),p_legacy_map_id,p.world_id,p_map_type,p_parent_editor_map_id,auth.uid()) returning editor_map_id into id;
 return query select e.editor_map_id,e.legacy_map_id,e.world_id,e.map_type,e.parent_editor_map_id,e.created_by from public.editor_map_identity e where e.editor_map_id=id;
end; $$;
create or replace function public.map_editor_create_interior_v1(p_playable_editor_map_id uuid,p_legacy_map_id uuid default null,p_building_id uuid default null) returns table(editor_map_id uuid,playable_editor_map_id uuid,legacy_map_id uuid,building_id uuid,world_id uuid,created_by uuid) language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.editor_map_identity%rowtype; l public.maps%rowtype; id uuid; b uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 select * into p from public.editor_map_identity where editor_map_id=p_playable_editor_map_id and created_by=auth.uid() for update;
 if not found then raise exception 'PLAYABLE_PARENT_NOT_ACCESSIBLE' using errcode='42501'; end if;
 if p.map_type<>'playable' then raise exception 'INTERIOR_PARENT_TYPE_INVALID' using errcode='22023'; end if;
 if p_legacy_map_id is not null then
  select * into l from public.maps where id=p_legacy_map_id;
  if not found then raise exception 'LEGACY_INTERIOR_MAP_NOT_FOUND' using errcode='P0002'; end if;
  if l.created_by<>auth.uid() then raise exception 'LEGACY_INTERIOR_MAP_NOT_ACCESSIBLE' using errcode='42501'; end if;
  if l.world_id<>p.world_id or l.map_type<>'interior' or l.building_id is null then raise exception 'LEGACY_INTERIOR_CONTRACT_INVALID' using errcode='22023'; end if;
  if exists(select 1 from public.editor_map_identity where legacy_map_id=p_legacy_map_id) or exists(select 1 from public.editor_map_interior where legacy_map_id=p_legacy_map_id) then raise exception 'LEGACY_MAP_ALREADY_MAPPED' using errcode='23505'; end if;
  b:=l.building_id; if p_building_id is not null and p_building_id<>b then raise exception 'BUILDING_MISMATCH' using errcode='22023'; end if;
 else
  b:=p_building_id;
  if b is not null and not exists(select 1 from public.buildings where id=b) then raise exception 'BUILDING_NOT_FOUND' using errcode='P0002'; end if;
 end if;
 insert into public.editor_map_identity(editor_map_id,world_id,map_type,parent_editor_map_id,created_by) values(gen_random_uuid(),p.world_id,'playable',p_playable_editor_map_id,auth.uid()) returning editor_map_id into id;
 insert into public.editor_map_interior(editor_map_id,playable_editor_map_id,legacy_map_id,building_id,created_by) values(id,p_playable_editor_map_id,p_legacy_map_id,b,auth.uid());
 return query select i.editor_map_id,i.playable_editor_map_id,i.legacy_map_id,i.building_id,e.world_id,i.created_by from public.editor_map_interior i join public.editor_map_identity e on e.editor_map_id=i.editor_map_id where i.editor_map_id=id;
end; $$;
revoke all on function public.map_editor_create_child_v1(uuid,text,uuid) from public,anon;
revoke all on function public.map_editor_create_interior_v1(uuid,uuid,uuid) from public,anon;
grant execute on function public.map_editor_create_child_v1(uuid,text,uuid) to authenticated;
grant execute on function public.map_editor_create_interior_v1(uuid,uuid,uuid) to authenticated;
comment on function public.map_editor_create_child_v1(uuid,text,uuid) is 'Controlled owner-authenticated Region/Playable editor identity creation; legacy map types are never reinterpreted.';
comment on function public.map_editor_create_interior_v1(uuid,uuid,uuid) is 'Controlled owner-authenticated Interior relation creation; Interior remains a separate relation while MapDocument stays world|region|playable.';
