# Dungeon Mutation Authority Hardening — 2026-09-07

## Scope

Runtime reconciliation record for the Vandrith Dungeon client mutation surface.

## Verified

- RLS is enabled on the audited Dungeon tables.
- Dungeon engine functions remain separated from client RPCs.
- The four audited client mutation RPCs are SECURITY INVOKER.
- Anonymous/public execution was removed.
- Authenticated execution remains available.
- Ownership is enforced through the root map boundary: maps.created_by = auth.uid().
- generate_dungeon_room checks ownership before p_replace can delete/replace map cells.
- create_dungeon_opening validates supplied room/corridor membership in the requested map.
- plan_dungeon_room_connection requires both rooms to exist on the same owned map.
- set_dungeon_opening_state resolves the opening's map and checks ownership before update.

## Deliberate exclusions

- Game Master assets are not included.
- LPC Asset Library is not included.
- maps.created_by was not changed to NOT NULL.
- No Dungeon table schema was changed.
- No direct broad INSERT/UPDATE/DELETE policies were added to Dungeon tables.

## Repository reconciliation note

The repository's visible migration chain currently uses database/migrations/0001... through 0005..., while the linked Supabase runtime contains a later migration history. Therefore this checkpoint records the applied runtime hardening under database/reconciliation/ rather than pretending it is part of the old 000x chain.

## Next audit

Continue with Dungeon navigation/pathfinding and verify that client-facing planning/sync APIs cannot bypass the ownership boundary.
