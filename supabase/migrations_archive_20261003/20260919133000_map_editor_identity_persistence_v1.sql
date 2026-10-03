create table if not exists public.editor_map_versions (
  id uuid primary key default gen_random_uuid(),
  editor_map_id uuid not null references public.editor_map_identity(editor_map_id) on delete cascade,
  version_number integer not null check (version_number > 0),
  label text not null default 'save',
  snapshot jsonb not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (editor_map_id, version_number)
);
create index if not exists editor_map_versions_editor_map_idx on public.editor_map_versions(editor_map_id, version_number desc);
create index if not exists editor_map_versions_owner_idx on public.editor_map_versions(created_by);
alter table public.editor_map_versions enable row level security;
drop policy if exists editor_map_versions_owner_select on public.editor_map_versions;
create policy editor_map_versions_owner_select on public.editor_map_versions for select to authenticated using (created_by = auth.uid());
revoke insert, update, delete on public.editor_map_versions from anon, authenticated;

create or replace function public.map_editor_load_identity_snapshot_v1(p_editor_map_id uuid)
returns table(ok boolean, code text, editor_map_id uuid, version_id uuid, version_number integer, snapshot jsonb, created_at timestamptz)
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.editor_map_identity%rowtype; v public.editor_map_versions%rowtype;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into r from public.editor_map_identity where editor_map_id=p_editor_map_id and created_by=auth.uid();
 if not found then raise exception 'EDITOR_IDENTITY_NOT_ACCESSIBLE'; end if;
 select * into v from public.editor_map_versions where editor_map_id=p_editor_map_id order by version_number desc limit 1;
 if not found then return query select true,'NO_SNAPSHOT',p_editor_map_id,null::uuid,0,null::jsonb,null::timestamptz; return; end if;
 return query select true,'OK',v.editor_map_id,v.id,v.version_number,v.snapshot,v.created_at;
end $$;

create or replace function public.map_editor_commit_identity_v1(p_editor_map_id uuid,p_expected_version integer,p_snapshot jsonb,p_label text default 'map-editor-save')
returns table(status text,version_id uuid,version_number integer,current_version integer,projection_status text,projection_error text)
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.editor_map_identity%rowtype; cur integer; nextv integer; vid uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_expected_version is null or p_expected_version < 0 then raise exception 'INVALID_EXPECTED_VERSION'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'INVALID_SNAPSHOT'; end if;
 select * into r from public.editor_map_identity where editor_map_id=p_editor_map_id and created_by=auth.uid() for update;
 if not found then raise exception 'EDITOR_IDENTITY_NOT_ACCESSIBLE'; end if;
 select coalesce(max(version_number),0) into cur from public.editor_map_versions where editor_map_id=p_editor_map_id;
 if p_expected_version <> cur then return query select 'conflict',null::uuid,null::integer,cur,'not_run',null::text; return; end if;
 nextv:=cur+1;
 insert into public.editor_map_versions(editor_map_id,version_number,label,snapshot,created_by) values(p_editor_map_id,nextv,coalesce(nullif(trim(p_label),''),'map-editor-save'),p_snapshot,auth.uid()) returning id into vid;
 return query select 'committed',vid,nextv,nextv,'not_run',null::text;
exception when unique_violation then
 select coalesce(max(version_number),0) into cur from public.editor_map_versions where editor_map_id=p_editor_map_id;
 return query select 'conflict',null::uuid,null::integer,cur,'not_run',null::text;
end $$;
revoke all on function public.map_editor_load_identity_snapshot_v1(uuid) from public,anon;
grant execute on function public.map_editor_load_identity_snapshot_v1(uuid) to authenticated;
revoke all on function public.map_editor_commit_identity_v1(uuid,integer,jsonb,text) from public,anon;
grant execute on function public.map_editor_commit_identity_v1(uuid,integer,jsonb,text) to authenticated;