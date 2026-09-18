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


## 2026-09-19 — migration-level verification gate

**Status:** IN PROGRESS — design mapping is established; production hierarchy migration remains gated.

### Verified live database boundary
- public.maps contains exactly 1 row: the canonical World Map.
- Legacy map types currently present: world = 1, exterior = 0, interior = 0.
- maps.map_type remains constrained to world | exterior | interior.
- There is no existing Map Editor identity/hierarchy table matching the editor contract.
- There is no parent_map_id column on public.maps.
- map_versions.map_id and map_editor_save_slots.map_id still reference maps.id.
- Canonical World Map has 12 authoritative versions (1–12).

### RPC/security audit
- map_editor_can_access_v1(uuid) exists as SECURITY DEFINER.
- map_editor_commit_merge_v1(uuid, integer, jsonb, text) exists as SECURITY DEFINER and remains the authoritative commit boundary.
- map_editor_load_document_snapshot_v1(uuid) exists as the snapshot loader.
- Save-slot RPCs are SECURITY DEFINER and owner-scoped.
- Existing RLS policies protect owner writes while canonical-world read policies remain explicit.
- Current persistence RPCs are tied directly to legacy maps.id; they are not yet an editor-identity abstraction.

### Historical source parity finding
The earlier spatial foundation migrations are recorded in Supabase migration history, but their original standalone files are not present in the current supabase/migrations tree. This is migration-source drift and matters for rollback/source reconstruction.

### Gate decision
Do not apply the hierarchy schema yet. The documented Option B contract is explicit, but the remaining gate is to reconstruct/verify the exact legacy spatial/game mapping and define physical table, RLS, uniqueness, cycle prevention, world-scope validation, RPC surface, and rollback as concrete SQL.

No existing maps, map_versions, save-slot, or World Map data was changed by this audit.
