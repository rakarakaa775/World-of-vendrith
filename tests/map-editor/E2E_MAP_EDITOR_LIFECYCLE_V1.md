# Map Editor E2E Lifecycle v1

Purpose: verify the existing authoritative Map Editor command stack without bypassing authentication or inventing production canon.

## Preconditions
- Authenticated editor user.
- Map owned by that user.
- Valid layer and asset IDs from the live database.
- Existing navigation projection enabled.

## Lifecycle
1. Load owned map.
2. Set a map cell through the editor cell command.
3. Place one map object through the unified placement command.
4. Verify object footprint and OBB synchronization.
5. Move/transform the object and refresh navigation using the exclude-object projection path.
6. Duplicate the object.
7. Undo the duplicate/create command.
8. Redo the duplicate/create command.
9. Delete the original object through the safe delete gateway.
10. Undo the delete and verify object restoration, OBB, footprint, and navigation state.
11. Redo the delete.
12. Reload the map and verify persistence.

## Pass criteria
- No operation bypasses ownership/auth guards.
- Every mutation has a corresponding command-history record where supported.
- Undo/redo restores the expected object state.
- OBB and footprint remain synchronized.
- Navigation projection reflects changed cells/objects.
- Reload returns the persisted final state.

## Current blocker
This contract requires an authenticated runtime identity and an owned test map. Database-only invocation with NULL IDs is intentionally insufficient and must not be treated as an E2E pass.
