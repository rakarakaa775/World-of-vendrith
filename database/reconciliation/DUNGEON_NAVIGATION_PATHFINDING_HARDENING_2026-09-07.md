# Dungeon Navigation / Pathfinding Hardening — 2026-09-07

## Verified runtime changes

- `plan_dungeon_pathfinding` is `SECURITY INVOKER`.
- Anonymous/public execution was removed.
- Authenticated execution remains available.
- `plan_dungeon_pathfinding` now verifies `maps.created_by = auth.uid()` before creating an auditable pathfinding run.
- `sync_dungeon_navigation_batch` is `SECURITY INVOKER`.
- Anonymous/public execution was removed.
- Authenticated execution remains available.
- `sync_dungeon_navigation_batch` now verifies map ownership before invoking the privileged `sync_dungeon_navigation_cell` engine.
- `sync_dungeon_navigation_cell` remains isolated as `SECURITY DEFINER` with no client EXECUTE privilege.

## Deliberate exclusions

- No Dungeon table schema changes.
- No broad INSERT/UPDATE/DELETE policies were added.
- Game Master assets and LPC Asset Library are excluded.

## Next audit

Verify the remaining Dungeon validation/read APIs and then move to asset/terrain → world simulation integration.
