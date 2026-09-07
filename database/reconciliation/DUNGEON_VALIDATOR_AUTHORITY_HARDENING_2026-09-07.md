# Dungeon Validator Authority Hardening — 2026-09-07

## Finding

The Dungeon validation RPCs were read-oriented but callable anonymously and accepted arbitrary connection/map identifiers. They could reveal validation status and connector information across ownership boundaries.

## Runtime fix

- `validate_dungeon_room_connection(uuid)` is `SECURITY INVOKER`.
- Anonymous/public execution removed.
- Authenticated execution retained.
- Target connection now requires `maps.created_by = auth.uid()`.
- `validate_dungeon_map_connections(uuid)` is `SECURITY INVOKER`.
- Anonymous/public execution removed.
- Authenticated execution retained.
- Target map now requires `maps.created_by = auth.uid()` before iterating its connections.

## Result

Dungeon validation/read diagnostics no longer provide an anonymous cross-map validation surface.

## Exclusions

No table schema changes, no broad table mutation policies, and no Game Master/LPC assets changed.
