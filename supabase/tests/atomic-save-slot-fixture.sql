-- Isolated PostgreSQL fixture for map_editor_save_game_slot_atomic_v1.
-- Uses a disposable Postgres service; never connects to hosted Supabase.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;

create schema if not exists auth;
create or replace function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

create table public.maps (
  id uuid primary key,
  world_id uuid not null,
  map_type text not null,
  created_by uuid,
  updated_at timestamptz not null default now()
);
create table public.map_versions (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null,
  version_number integer not null,
  label text,
  snapshot jsonb not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique(map_id, version_number)
);
create table public.editor_map_identity (
  editor_map_id uuid primary key,
  legacy_map_id uuid,
  world_id uuid not null,
  map_type text not null,
  parent_editor_map_id uuid,
  created_by uuid not null
);
create table public.editor_map_versions (
  id uuid primary key default gen_random_uuid(),
  editor_map_id uuid not null,
  version_number integer not null,
  label text not null default 'save',
  snapshot jsonb not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  unique(editor_map_id, version_number)
);
create table public.map_editor_save_slots (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null,
  slot_number smallint not null check (slot_number between 1 and 12),
  label text not null default '',
  version_id uuid,
  version_number integer not null,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(map_id, created_by, slot_number)
);

create or replace function public.map_editor_can_access_v1(p_map_id uuid) returns boolean
language sql stable
as $$ select exists(select 1 from public.maps m where m.id=p_map_id and (m.created_by=auth.uid() or m.map_type='world')) $$;

create or replace function public.map_editor_commit_merge_v1(
  p_map_id uuid, p_expected_version integer, p_snapshot jsonb, p_label text default 'merge'
) returns table(status text, version_id uuid, version_number integer, current_version integer)
language plpgsql
as $legacy$
declare cur integer; nextv integer; vid uuid;
begin
  perform 1 from public.maps where id=p_map_id for update;
  select coalesce(max(v.version_number),0) into cur from public.map_versions v where v.map_id=p_map_id;
  if p_expected_version <> cur then return query select 'conflict',null::uuid,null::integer,cur; return; end if;
  nextv := cur + 1;
  insert into public.map_versions(map_id,version_number,label,snapshot,created_by)
    values(p_map_id,nextv,p_label,p_snapshot,auth.uid()) returning id into vid;
  update public.maps set updated_at=now() where id=p_map_id;
  if current_setting('test.fail_at',true) = 'world_after_insert' then raise exception 'injected world failure'; end if;
  return query select 'committed',vid,nextv,nextv;
end $legacy$;

create or replace function public.map_editor_commit_identity_v1(
  p_editor_map_id uuid, p_expected_version integer, p_snapshot jsonb, p_label text default 'map-editor-save'
) returns table(status text, version_id uuid, version_number integer, current_version integer, projection_status text, projection_error text)
language plpgsql
as $$
declare cur integer; nextv integer; vid uuid;
begin
  perform 1 from public.editor_map_identity where editor_map_id=p_editor_map_id for update;
  select coalesce(max(v.version_number),0) into cur from public.editor_map_versions v where v.editor_map_id=p_editor_map_id;
  if p_expected_version <> cur then return query select 'conflict',null::uuid,null::integer,cur,'not_run',null::text; return; end if;
  nextv := cur + 1;
  insert into public.editor_map_versions(editor_map_id,version_number,label,snapshot,created_by)
    values(p_editor_map_id,nextv,p_label,p_snapshot,auth.uid()) returning id into vid;
  if current_setting('test.fail_at',true) = 'identity_after_insert' then raise exception 'injected identity failure'; end if;
  return query select 'committed',vid,nextv,nextv,'not_run',null::text;
end $$;

create schema if not exists test_support;
create or replace function test_support.world_doc(p_name text) returns jsonb language sql immutable as $$
  select jsonb_build_object('id','11111111-1111-1111-1111-111111111111','mapType','world','version',1,'name',p_name,'width',1,'height',1,'tileSize',16,'layers',jsonb_build_array(jsonb_build_object('cells',jsonb_build_array(null))))
$$;
create or replace function test_support.world_envelope(p_name text) returns jsonb language sql immutable as $$
  select jsonb_build_object('schema','vandrith.map-document','version',1,'document',test_support.world_doc(p_name))
$$;
create or replace function test_support.exterior_doc(p_name text) returns jsonb language sql immutable as $$
  select jsonb_build_object('id','22222222-2222-2222-2222-222222222222','mapType','playable','version',1,'name',p_name,'width',1,'height',1,'tileSize',16,'layers',jsonb_build_array(jsonb_build_object('cells',jsonb_build_array(null))))
$$;
create or replace function test_support.exterior_envelope(p_name text) returns jsonb language sql immutable as $$
  select jsonb_build_object('schema','vandrith.map-document','version',1,'document',test_support.exterior_doc(p_name))
$$;
create or replace function test_support.game_save(p_world_name text, p_exterior_name text) returns jsonb language sql immutable as $$
  select jsonb_build_object('schema','vandrith.game-save','version',1,'world',test_support.world_doc(p_world_name),
    'exterior',case when p_exterior_name is null then 'null'::jsonb else test_support.exterior_doc(p_exterior_name) end)
$$;
create or replace function test_support.seed_case() returns void language plpgsql as $$
begin
  truncate public.map_editor_save_slots, public.editor_map_versions, public.map_versions, public.editor_map_identity, public.maps;
  insert into public.maps(id,world_id,map_type,created_by)
    values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','world','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  insert into public.editor_map_identity(editor_map_id,legacy_map_id,world_id,map_type,parent_editor_map_id,created_by) values
    ('11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','world',null,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('33333333-3333-3333-3333-333333333333',null,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','region','11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('22222222-2222-2222-2222-222222222222',null,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','playable','33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  insert into public.map_versions(id,map_id,version_number,label,snapshot,created_by)
    values ('aaaaaaaa-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',1,'seed',test_support.world_envelope('Old World'),'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  insert into public.editor_map_versions(id,editor_map_id,version_number,label,snapshot,created_by)
    values ('bbbbbbbb-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222',1,'seed',test_support.exterior_envelope('Old Exterior'),'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  insert into public.map_editor_save_slots(map_id,slot_number,label,version_id,version_number,snapshot,created_by)
    values ('11111111-1111-1111-1111-111111111111',1,'Old Slot','aaaaaaaa-1111-1111-1111-111111111111',1,test_support.game_save('Old World','Old Exterior'),'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
end $$;

create or replace function test_support.assert_true(p_ok boolean, p_message text) returns void language plpgsql as $$
begin if not coalesce(p_ok,false) then raise exception 'ASSERTION FAILED: %', p_message; end if; end $$;

create or replace function test_support.fail_after_slot_write() returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_at',true) = 'slot_after_upsert' then raise exception 'injected slot failure'; end if;
  return new;
end $$;
create trigger test_fail_after_slot_write
after insert or update on public.map_editor_save_slots
for each row execute function test_support.fail_after_slot_write();
