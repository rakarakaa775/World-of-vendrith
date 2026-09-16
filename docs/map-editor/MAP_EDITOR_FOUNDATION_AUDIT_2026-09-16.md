# Map Editor Foundation Audit — 2026-09-16

Status: In progress
Roadmap phase: Phase 0 — Foundation Audit

## Findings

### F-001 — Three-map model is documented but runtime authoring is not three-map complete
`MapDocument` defines `world`, `region`, and `playable`, but the active V4 application bootstrap currently only supports the persisted World Map path and rejects non-world maps during connection.

### F-002 — Canonical snapshot and relational projections need focused verification
The canonical editor snapshot contains layers/cells/objects. Supabase also contains `map_cells`, `map_objects`, navigation and geometry projections. The reconcile RPC derives projections from the snapshot, but reproducibility must be verified before relying on them as derived data.

### F-003 — Quick Save has a large server-side dependency chain
Quick Save uses conflict detection and `map_editor_commit_merge_v1`. That RPC inserts the durable version and then calls reconciliation, which projects cells, syncs geometry, rebuilds navigation, and updates the runtime snapshot. A save failure can therefore occur after the version insert and must be traced to the exact RPC boundary.

### F-004 — Runtime snapshot has layered fallback behavior
The client loader checks the runtime snapshot and then durable `map_versions`; the runtime RPC also falls back to `map_versions`. Phase 0 must verify that stale runtime data cannot become authoritative.

### F-005 — V4 terrain loading bypasses the new whitelist rule
The approved whitelist requires both asset registry approval and binding-candidate approval. V4 can synthesize base bindings from registry-approved assets without requiring an approved binding candidate. This must be corrected only after the foundation audit is complete.

### F-006 — Repeated anonymous bootstrap sessions created many World Map rows
Supabase currently contains multiple World Map records with different owner UUIDs. Some have versions and some have no versions; older records contain save slots. The identity strategy for development and production must be explicitly defined.

### F-007 — Save Slot RPC is the correct active contract
`map_editor_save_slot_v1` validates authentication, slot range, ownership, snapshot, version, and referenced version. V4 uses the dedicated Save Slot RPC. Legacy `map-editor-app.tsx` still contains a direct table path but is not the active page; `app/page.tsx` renders V4.

## Current implementation evidence

- Active page renders `MapEditorAppV4`.
- `MapDocument` supports three map types.
- `EditorShell` currently resets history only on `initialDocument.id`, avoiding the previous continuous-reference flicker regression.
- V4 Save Slot calls `map_editor_save_slot_v1`.
- V4 Load Slot calls `map_editor_load_save_slot_v1`.
- Quick Save calls `map_editor_commit_merge_v1` through conflict detection.

## Current database evidence

Supabase exposes the dedicated Save/Load and merge RPCs. The current database contains repeated World Map rows; the newest observed World Map has one durable version and zero slots, while older maps demonstrate that slots have been persisted historically.

## Phase 0 rule

These findings are audit evidence, not permission to patch architecture. Each finding must be reproduced or verified with focused tests. No Save/Load architecture rewrite should occur until the actual failure boundary is established.
