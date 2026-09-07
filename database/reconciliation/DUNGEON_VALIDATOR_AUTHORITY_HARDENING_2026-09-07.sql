-- Vandrith / Supabase runtime reconciliation
-- 2026-09-07
-- Dungeon validator authority hardening

BEGIN;

REVOKE EXECUTE ON FUNCTION public.validate_dungeon_map_connections(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.validate_dungeon_room_connection(uuid) FROM PUBLIC, anon;

-- Runtime definitions remain SECURITY INVOKER and now require the target
-- connection/map to resolve to a map owned by auth.uid().
-- The map validator delegates only after the same ownership check.

GRANT EXECUTE ON FUNCTION public.validate_dungeon_map_connections(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_dungeon_room_connection(uuid) TO authenticated;

COMMIT;
