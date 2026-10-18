-- Private Save Slots v1.
-- Candidate migration only: do not apply to hosted Supabase during audit.
-- Enforces per-user slot ownership while preserving authorized access to the shared canonical World.

do $$
begin
  if exists (
    select 1 from public.map_editor_save_slots where created_by is null
  ) then
    raise exception
      'PRIVATE_SAVE_SLOTS_MIGRATION_BLOCKED: rows without created_by need explicit ownership reconciliation';
  end if;
end;
$$;

alter table public.map_editor_save_slots
  alter column created_by set not null;

alter table public.map_editor_save_slots
  drop constraint if exists map_editor_save_slots_map_id_slot_number_key;

alter table public.map_editor_save_slots
  add constraint map_editor_save_slots_map_owner_slot_key
  unique (map_id, created_by, slot_number);

-- Remove the exception that exposed every canonical-World slot; the owner policy below still allows each user to access their own slot on an authorized shared World.
drop policy if exists map_editor_save_slots_canonical_world_select
  on public.map_editor_save_slots;

drop policy if exists map_editor_save_slots_select_owner
  on public.map_editor_save_slots;
create policy map_editor_save_slots_select_owner
  on public.map_editor_save_slots
  for select to authenticated
  using (
    created_by = (select auth.uid())
    and public.map_editor_can_access_v1(map_editor_save_slots.map_id)
  );

drop policy if exists map_editor_save_slots_insert_owner
  on public.map_editor_save_slots;
create policy map_editor_save_slots_insert_owner
  on public.map_editor_save_slots
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.map_editor_can_access_v1(map_editor_save_slots.map_id)
  );

drop policy if exists map_editor_save_slots_update_owner
  on public.map_editor_save_slots;
create policy map_editor_save_slots_update_owner
  on public.map_editor_save_slots
  for update to authenticated
  using (
    created_by = (select auth.uid())
    and public.map_editor_can_access_v1(map_editor_save_slots.map_id)
  )
  with check (
    created_by = (select auth.uid())
    and public.map_editor_can_access_v1(map_editor_save_slots.map_id)
  );

drop policy if exists map_editor_save_slots_delete_owner
  on public.map_editor_save_slots;
create policy map_editor_save_slots_delete_owner
  on public.map_editor_save_slots
  for delete to authenticated
  using (
    created_by = (select auth.uid())
    and public.map_editor_can_access_v1(map_editor_save_slots.map_id)
  );

-- Direct clients only need SELECT for the Save Slots panel. RLS does not protect TRUNCATE.
revoke all on table public.map_editor_save_slots from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.map_editor_save_slots from authenticated;
grant select on table public.map_editor_save_slots to authenticated;

-- Legacy SECURITY DEFINER entry points do not scope reads/upserts to slot owner.
-- New client flow uses map_editor_save_game_slot_atomic_v1 and
-- map_editor_load_save_slot_validated_v1, which explicitly enforce ownership.
revoke all on function public.map_editor_save_slot_v1(uuid,smallint,text,uuid,integer,jsonb)
  from public, anon, authenticated;
revoke all on function public.map_editor_load_save_slot_v1(uuid,smallint)
  from public, anon, authenticated;

comment on table public.map_editor_save_slots is
  'Private Save Slots: rows are scoped to created_by; clients read through owner RLS and write through owner-checking RPCs; authorized users may keep private slots on the shared canonical World.';

-- Remove inherited PUBLIC table privileges as well; retain the explicit authenticated SELECT grant.
revoke all on table public.map_editor_save_slots from public;
