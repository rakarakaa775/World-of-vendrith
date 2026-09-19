create or replace function public.editor_map_identity_validate_v1()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $function$
declare parent public.editor_map_identity%rowtype; legacy public.maps%rowtype;
begin
 if new.created_by is distinct from auth.uid() then raise exception using errcode='42501',message='EDITOR_MAP_OWNER_MISMATCH'; end if;
 if new.map_type='world' and new.parent_editor_map_id is not null then raise exception using errcode='23514',message='EDITOR_WORLD_PARENT_INVALID'; end if;
 if new.map_type<>'world' and new.parent_editor_map_id is null then raise exception using errcode='23514',message='EDITOR_PARENT_REQUIRED'; end if;
 if new.parent_editor_map_id is not null then
   select * into parent from public.editor_map_identity where editor_map_id=new.parent_editor_map_id;
   if not found then raise exception using errcode='23503',message='EDITOR_PARENT_NOT_FOUND'; end if;
   if parent.created_by is distinct from new.created_by and parent.map_type<>'world' then raise exception using errcode='42501',message='EDITOR_PARENT_OWNER_MISMATCH'; end if;
   if parent.world_id is distinct from new.world_id then raise exception using errcode='23514',message='EDITOR_WORLD_SCOPE_MISMATCH'; end if;
   if new.map_type='region' and parent.map_type<>'world' then raise exception using errcode='23514',message='EDITOR_REGION_PARENT_INVALID'; end if;
   if new.map_type='playable' and parent.map_type<>'region' then raise exception using errcode='23514',message='EDITOR_PLAYABLE_PARENT_INVALID'; end if;
 end if;
 if new.legacy_map_id is not null then
   select * into legacy from public.maps where id=new.legacy_map_id;
   if not found then raise exception using errcode='23503',message='EDITOR_LEGACY_MAP_NOT_FOUND'; end if;
   if legacy.world_id is distinct from new.world_id then raise exception using errcode='23514',message='EDITOR_LEGACY_WORLD_SCOPE_MISMATCH'; end if;
   if new.map_type='world' and legacy.map_type<>'world' then raise exception using errcode='23514',message='EDITOR_WORLD_LEGACY_TYPE_INVALID'; end if;
   if new.map_type='playable' and legacy.map_type<>'exterior' then raise exception using errcode='23514',message='EDITOR_PLAYABLE_LEGACY_TYPE_INVALID'; end if;
   if new.map_type='region' then raise exception using errcode='23514',message='EDITOR_REGION_LEGACY_MAP_INVALID'; end if;
 end if;
 if tg_op='UPDATE' and new.parent_editor_map_id is not distinct from old.parent_editor_map_id and new.world_id is not distinct from old.world_id then return new; end if;
 if new.parent_editor_map_id is not null then
   if exists(with recursive ancestors(id) as (select new.parent_editor_map_id union all select e.parent_editor_map_id from public.editor_map_identity e join ancestors a on e.editor_map_id=a.id where e.parent_editor_map_id is not null) select 1 from ancestors where id=new.editor_map_id) then
     raise exception using errcode='23514',message='EDITOR_HIERARCHY_CYCLE';
   end if;
 end if;
 return new;
end $function$;