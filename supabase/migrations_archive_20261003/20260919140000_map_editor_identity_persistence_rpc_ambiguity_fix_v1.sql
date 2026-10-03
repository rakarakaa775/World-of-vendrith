create or replace function public.map_editor_commit_identity_v1(p_editor_map_id uuid, p_expected_version integer, p_snapshot jsonb, p_label text default 'map-editor-save')
returns table(status text, version_id uuid, version_number integer, current_version integer, projection_status text, projection_error text)
language plpgsql security definer set search_path=public,pg_temp
as $function$
declare r public.editor_map_identity%rowtype; cur integer; nextv integer; vid uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_expected_version is null or p_expected_version < 0 then raise exception 'INVALID_EXPECTED_VERSION'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'INVALID_SNAPSHOT'; end if;
 select e.* into r from public.editor_map_identity e where e.editor_map_id=p_editor_map_id and e.created_by=auth.uid() for update;
 if not found then raise exception 'EDITOR_IDENTITY_NOT_ACCESSIBLE'; end if;
 select coalesce(max(v.version_number),0) into cur from public.editor_map_versions v where v.editor_map_id=p_editor_map_id;
 if p_expected_version <> cur then return query select 'conflict',null::uuid,null::integer,cur,'not_run',null::text; return; end if;
 nextv:=cur+1;
 insert into public.editor_map_versions(editor_map_id,version_number,label,snapshot,created_by)
 values(p_editor_map_id,nextv,coalesce(nullif(trim(p_label),''),'map-editor-save'),p_snapshot,auth.uid())
 returning id into vid;
 return query select 'committed',vid,nextv,nextv,'not_run',null::text;
exception when unique_violation then
 select coalesce(max(v.version_number),0) into cur from public.editor_map_versions v where v.editor_map_id=p_editor_map_id;
 return query select 'conflict',null::uuid,null::integer,cur,'not_run',null::text;
end $function$;