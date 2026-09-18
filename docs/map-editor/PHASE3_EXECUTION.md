# Vandrith Map Editor — Phase 3 Execution

## 2026-09-18 — Phase 3 checkpoint

**Status:** IN PROGRESS — authoritative resolution is hardened; multi-scale persistence is blocked by an existing database map-type contract mismatch.

### Phase 3 scope
- authenticated session;
- explicit map resolution;
- access/owner validation;
- authoritative version read;
- version-aware commit through existing map_editor_commit_merge_v1;
- structured client-visible failure codes;
- server-confirmed success;
- preservation of MapDocument mapType and relationship metadata.

### Implemented
- Added apps/map-editor/editor/map-authoritative-resolver.ts.
- Resolution now follows: requested map id → map_editor_can_access_v1 → authoritative maps row → authoritative snapshot → parser identity check → version.
- World save connection now uses this explicit resolver before falling back to the existing bootstrap path.
- Added focused regression tests for inaccessible maps, successful World resolution, and rejection of ambiguous non-World database types.
- Existing map_editor_commit_merge_v1 remains the persistence boundary; no replacement RPC or new persistence table was introduced.

### Supabase audit evidence
- Project: ojtmfokjcirvjvhnbnos.
- public.maps currently contains only one map row and it is map_type = world.
- public.map_editor_can_access_v1(uuid) exists as SECURITY DEFINER and checks authenticated access.
- public.map_editor_commit_merge_v1(uuid, integer, jsonb, text) exists as SECURITY DEFINER with search_path = public, pg_temp.
- The current database maps.map_type CHECK constraint allows world | exterior | interior.
- The editor MapDocument contract uses world | region | playable.

### Verified blocker
The database currently cannot uniquely identify editor region versus playable from maps.map_type: both are outside the database's current world | exterior | interior vocabulary, and exterior alone cannot distinguish the two editor scales. The resolver therefore deliberately rejects a non-World save instead of silently inventing a mapping.

This is a contract-alignment blocker, not a reason to redesign the existing version/RPC foundation.

### Next controlled step
Audit the existing database/game contract for the intended mapping of world | exterior | interior to the editor's world | region | playable model. Only after that mapping is explicitly established should a minimal compatibility migration be considered. No table/RPC change is being invented at this checkpoint.
