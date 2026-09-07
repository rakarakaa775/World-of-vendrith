-- Vandrith / Supabase runtime reconciliation
-- 2026-09-07
-- Dungeon Navigation / Pathfinding mutation authority hardening

BEGIN;

REVOKE EXECUTE ON FUNCTION public.plan_dungeon_pathfinding(uuid,integer,integer,integer,integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sync_dungeon_navigation_batch(uuid,integer,integer,integer,integer) FROM PUBLIC, anon;

-- Runtime definitions add an ownership guard through maps.created_by = auth.uid().
-- plan_dungeon_pathfinding protects creation of dungeon_pathfinding_runs.
-- sync_dungeon_navigation_batch protects its call into the privileged
-- sync_dungeon_navigation_cell engine before any navigation cells are synced.

GRANT EXECUTE ON FUNCTION public.plan_dungeon_pathfinding(uuid,integer,integer,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_dungeon_navigation_batch(uuid,integer,integer,integer,integer) TO authenticated;

COMMIT;
