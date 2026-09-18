-- Map Editor hierarchy identity layer v1
-- Phase 3 Migration A: identity/hierarchy schema only.
-- Existing public.maps/map_versions/save-slot persistence is intentionally untouched.

create table if not exists public.editor_map_identity (
  editor_map_id uuid primary key default gen_random_uuid(),
  legacy_map_id uuid null references public.maps(id) on delete restrict,
  world_id uuid not null references public.worlds(id) on delete restrict,
  map_type text not null check (map_type in ('world','region','playable')),
  parent_editor_map_id uuid null references public.editor_map_identity(editor_map_id) on delete restrict,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editor_map_identity_no_self_parent check (
    parent_editor_map_id is null or parent_editor_map_id <> editor_map_id
  )
);

create unique index if not exists editor_map_identity_legacy_unique
  on public.editor_map_identity(legacy_map_id);
create index if not exists editor_map_identity_world_idx
  on public.editor_map_identity(world_id);
create index if not exists editor_map_identity_parent_idx
  on public.editor_map_identity(parent_editor_map_id);
create index if not exists editor_map_identity_owner_idx
  on public.editor_map_identity(created_by);

create table if not exists public.editor_map_interior (
  editor_map_id uuid primary key references public.editor_map_identity(editor_map_id) on delete cascade,
  playable_editor_map_id uuid not null references public.editor_map_identity(editor_map_id) on delete restrict,
  legacy_map_id uuid null references public.maps(id) on delete restrict,
  building_id uuid null references public.buildings(id) on delete restrict,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editor_map_interior_owner_map_unique
    unique (playable_editor_map_id, editor_map_id)
);

create index if not exists editor_map_interior_playable_idx
  on public.editor_map_interior(playable_editor_map_id);
create index if not exists editor_map_interior_legacy_idx
  on public.editor_map_interior(legacy_map_id);
create index if not exists editor_map_interior_building_idx
  on public.editor_map_interior(building_id);

alter table public.editor_map_identity enable row level security;
alter table public.editor_map_interior enable row level security;

drop policy if exists editor_map_identity_owner_select on public.editor_map_identity;
create policy editor_map_identity_owner_select
  on public.editor_map_identity
  for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists editor_map_interior_owner_select on public.editor_map_interior;
create policy editor_map_interior_owner_select
  on public.editor_map_interior
  for select
  to authenticated
  using (created_by = auth.uid());

revoke insert, update, delete on public.editor_map_identity from anon, authenticated;
revoke insert, update, delete on public.editor_map_interior from anon, authenticated;

create or replace function public.editor_map_identity_validate_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  parent public.editor_map_identity%rowtype;
  legacy public.maps%rowtype;
begin
  if new.created_by is distinct from auth.uid() then
    raise exception using errcode='42501', message='EDITOR_MAP_OWNER_MISMATCH';
  end if;

  if new.map_type = 'world' and new.parent_editor_map_id is not null then
    raise exception using errcode='23514', message='EDITOR_WORLD_PARENT_INVALID';
  end if;

  if new.map_type <> 'world' and new.parent_editor_map_id is null then
    raise exception using errcode='23514', message='EDITOR_PARENT_REQUIRED';
  end if;

  if new.parent_editor_map_id is not null then
    select * into parent from public.editor_map_identity
    where editor_map_id = new.parent_editor_map_id;
    if not found then
      raise exception using errcode='23503', message='EDITOR_PARENT_NOT_FOUND';
    end if;
    if parent.created_by is distinct from new.created_by then
      raise exception using errcode='42501', message='EDITOR_PARENT_OWNER_MISMATCH';
    end if;
    if parent.world_id is distinct from new.world_id then
      raise exception using errcode='23514', message='EDITOR_WORLD_SCOPE_MISMATCH';
    end if;
    if new.map_type='region' and parent.map_type <> 'world' then
      raise exception using errcode='23514', message='EDITOR_REGION_PARENT_INVALID';
    end if;
    if new.map_type='playable' and parent.map_type <> 'region' then
      raise exception using errcode='23514', message='EDITOR_PLAYABLE_PARENT_INVALID';
    end if;
  end if;

  if new.legacy_map_id is not null then
    select * into legacy from public.maps where id=new.legacy_map_id;
    if not found then
      raise exception using errcode='23503', message='EDITOR_LEGACY_MAP_NOT_FOUND';
    end if;
    if legacy.world_id is distinct from new.world_id then
      raise exception using errcode='23514', message='EDITOR_LEGACY_WORLD_SCOPE_MISMATCH';
    end if;
    if new.map_type='world' and legacy.map_type <> 'world' then
      raise exception using errcode='23514', message='EDITOR_WORLD_LEGACY_TYPE_INVALID';
    end if;
    if new.map_type='playable' and legacy.map_type <> 'exterior' then
      raise exception using errcode='23514', message='EDITOR_PLAYABLE_LEGACY_TYPE_INVALID';
    end if;
    if new.map_type='region' then
      raise exception using errcode='23514', message='EDITOR_REGION_LEGACY_MAP_INVALID';
    end if;
  end if;

  if tg_op='UPDATE' and new.parent_editor_map_id is not distinct from old.parent_editor_map_id
     and new.world_id is not distinct from old.world_id then
    return new;
  end if;

  if new.parent_editor_map_id is not null then
    if exists (
      with recursive ancestors(id) as (
        select new.parent_editor_map_id
        union all
        select e.parent_editor_map_id
        from public.editor_map_identity e
        join ancestors a on e.editor_map_id=a.id
        where e.parent_editor_map_id is not null
      )
      select 1 from ancestors where id=new.editor_map_id
    ) then
      raise exception using errcode='23514', message='EDITOR_HIERARCHY_CYCLE';
    end if;
  end if;

  return new;
end;
$function$;

create or replace function public.editor_map_interior_validate_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  child public.editor_map_identity%rowtype;
  parent public.editor_map_identity%rowtype;
  legacy public.maps%rowtype;
begin
  select * into child from public.editor_map_identity where editor_map_id=new.editor_map_id;
  select * into parent from public.editor_map_identity where editor_map_id=new.playable_editor_map_id;

  if not found then raise exception using errcode='23503', message='EDITOR_INTERIOR_MAP_NOT_FOUND'; end if;
  if child.map_type <> 'playable' then raise exception using errcode='23514', message='EDITOR_INTERIOR_IDENTITY_TYPE_INVALID'; end if;
  if parent.map_type <> 'playable' then raise exception using errcode='23514', message='EDITOR_INTERIOR_PARENT_INVALID'; end if;
  if child.created_by is distinct from new.created_by or parent.created_by is distinct from new.created_by then
    raise exception using errcode='42501', message='EDITOR_INTERIOR_OWNER_MISMATCH';
  end if;
  if child.world_id is distinct from parent.world_id then
    raise exception using errcode='23514', message='EDITOR_INTERIOR_WORLD_SCOPE_MISMATCH';
  end if;

  if new.legacy_map_id is not null then
    select * into legacy from public.maps where id=new.legacy_map_id;
    if not found then raise exception using errcode='23503', message='EDITOR_INTERIOR_LEGACY_MAP_NOT_FOUND'; end if;
    if legacy.map_type <> 'interior' then raise exception using errcode='23514', message='EDITOR_INTERIOR_LEGACY_TYPE_INVALID'; end if;
    if legacy.world_id is distinct from child.world_id then raise exception using errcode='23514', message='EDITOR_INTERIOR_LEGACY_WORLD_SCOPE_MISMATCH'; end if;
    if legacy.building_id is null then raise exception using errcode='23514', message='EDITOR_INTERIOR_BUILDING_REQUIRED'; end if;
    if new.building_id is not null and new.building_id is distinct from legacy.building_id then
      raise exception using errcode='23514', message='EDITOR_INTERIOR_BUILDING_MISMATCH';
    end if;
  end if;

  if new.building_id is not null and new.legacy_map_id is null then
    perform 1 from public.buildings where id=new.building_id;
    if not found then raise exception using errcode='23503', message='EDITOR_BUILDING_NOT_FOUND'; end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists editor_map_identity_validate_v1 on public.editor_map_identity;
create trigger editor_map_identity_validate_v1
before insert or update on public.editor_map_identity
for each row execute function public.editor_map_identity_validate_v1();

drop trigger if exists editor_map_interior_validate_v1 on public.editor_map_interior;
create trigger editor_map_interior_validate_v1
before insert or update on public.editor_map_interior
for each row execute function public.editor_map_interior_validate_v1();

revoke execute on function public.editor_map_identity_validate_v1() from public, anon, authenticated;
revoke execute on function public.editor_map_interior_validate_v1() from public, anon, authenticated;
