create table if not exists public.map_editor_save_slots (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.maps(id) on delete cascade,
  slot_number smallint not null check (slot_number between 1 and 12),
  label text not null default '',
  version_id uuid references public.map_versions(id) on delete set null,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(map_id, slot_number)
);

create index if not exists idx_map_editor_save_slots_map_id on public.map_editor_save_slots(map_id, slot_number);

alter table public.map_editor_save_slots enable row level security;

create policy map_editor_save_slots_select_owner on public.map_editor_save_slots
  for select to authenticated
  using (exists (select 1 from public.maps m where m.id = map_editor_save_slots.map_id and m.created_by = auth.uid()));

create policy map_editor_save_slots_insert_owner on public.map_editor_save_slots
  for insert to authenticated
  with check (exists (select 1 from public.maps m where m.id = map_editor_save_slots.map_id and m.created_by = auth.uid()) and created_by = auth.uid());

create policy map_editor_save_slots_update_owner on public.map_editor_save_slots
  for update to authenticated
  using (exists (select 1 from public.maps m where m.id = map_editor_save_slots.map_id and m.created_by = auth.uid()))
  with check (exists (select 1 from public.maps m where m.id = map_editor_save_slots.map_id and m.created_by = auth.uid()));

create policy map_editor_save_slots_delete_owner on public.map_editor_save_slots
  for delete to authenticated
  using (exists (select 1 from public.maps m where m.id = map_editor_save_slots.map_id and m.created_by = auth.uid()));

comment on table public.map_editor_save_slots is 'Game-like manual save slots for the Vandrith map editor. Each slot points at an immutable map version snapshot.';
