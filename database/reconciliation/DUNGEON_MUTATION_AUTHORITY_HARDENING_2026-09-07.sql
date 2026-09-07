-- Vandrith / Supabase runtime reconciliation
-- 2026-09-07
-- Dungeon client mutation authority hardening
--
-- Applied to the linked Supabase project before this file was committed.
-- This file records the runtime patch for repository reconciliation.
-- It is intentionally kept under database/reconciliation rather than the
-- legacy 000x migration chain because the repository migration history is
-- not a complete mirror of the current Supabase migration history.
--
-- Changes:
--   1. Remove PUBLIC/anon EXECUTE from four client-facing Dungeon mutations.
--   2. Keep authenticated EXECUTE.
--   3. Add ownership validation through maps.created_by = auth.uid().
--   4. Validate room/corridor ownership against the requested map.
--   5. Protect generate_dungeon_room replacement before map_cells deletion.
--
-- Functions:
--   public.generate_dungeon_room(uuid,integer,integer,integer,integer,jsonb,boolean)
--   public.create_dungeon_opening(uuid,integer,integer,text,text,uuid,uuid,integer,uuid)
--   public.plan_dungeon_room_connection(uuid,uuid,integer)
--   public.set_dungeon_opening_state(uuid,text)
--
-- NOTE:
-- The live function bodies are the authoritative implementation. This
-- reconciliation record documents the security contract and privilege delta.
-- Do not replay blindly against a database whose function signatures differ.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.create_dungeon_opening(uuid,integer,integer,text,text,uuid,uuid,integer,uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_dungeon_room(uuid,integer,integer,integer,integer,jsonb,boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.plan_dungeon_room_connection(uuid,uuid,integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_dungeon_opening_state(uuid,text) FROM PUBLIC, anon;

-- The live definitions were replaced in the Supabase runtime with
-- SECURITY INVOKER implementations that reject non-owned maps.
--
--   NOT EXISTS (
--     SELECT 1 FROM public.maps
--     WHERE id = p_map_id AND created_by = auth.uid()
--   )
--   => MAP_NOT_OWNED
--
-- create_dungeon_opening additionally verifies supplied room_id/corridor_id
-- belong to p_map_id.
--
-- plan_dungeon_room_connection verifies both rooms exist, belong to the
-- same map, and that the map is owned by auth.uid().
--
-- set_dungeon_opening_state resolves opening.map_id and verifies ownership
-- before UPDATE.
--
-- generate_dungeon_room verifies map ownership before any replacement
-- deletion or room/cell writes.

GRANT EXECUTE ON FUNCTION public.create_dungeon_opening(uuid,integer,integer,text,text,uuid,uuid,integer,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_dungeon_room(uuid,integer,integer,integer,integer,jsonb,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.plan_dungeon_room_connection(uuid,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_dungeon_opening_state(uuid,text) TO authenticated;

COMMIT;
