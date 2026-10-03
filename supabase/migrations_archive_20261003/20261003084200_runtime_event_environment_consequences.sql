-- Allow runtime events to mutate authoritative environment state.
-- The same change has already been applied to the connected project.

alter table public.event_definitions
  drop constraint if exists event_definitions_consequence_type_chk;

alter table public.event_definitions
  add constraint event_definitions_consequence_type_chk
  check (consequence_type = any (array['world_status'::text, 'environment'::text]));
