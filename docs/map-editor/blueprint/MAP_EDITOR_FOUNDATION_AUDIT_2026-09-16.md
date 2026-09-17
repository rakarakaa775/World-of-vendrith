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

### F-008 — MapDocument grid sizing violates the deterministic dimension contract
`MapDocument` declares `width` and `height`, and `createMap()` currently creates a 20×12 document. However, the shared `layer()` constructor hardcodes every layer to exactly 240 cells instead of deriving the cell count from the document dimensions. The current default happens to satisfy `20 × 12 = 240`, so the defect is latent rather than visible for the default map size. Any future resize, non-default map creation, imported document, or dimension-changing migration can produce a document whose declared dimensions and layer cell storage disagree.

### F-009 — Grid-size invariant is not visibly enforced by the serialization boundary
The current serializer/parser contract validates the presence and basic shape of `MapDocument`, but the audited `map-document.ts` implementation does not provide a central invariant for `cells.length === width * height`. Because the source search did not return additional `cells.length` matches, the hardcoded allocation in `map-document.ts` is the confirmed producer in the audited source. A focused parser/test check should still be added during implementation so malformed imported or persisted documents fail deterministically rather than reaching the renderer.

### F-010 — Save path contains a state-commit race boundary
The V4 `save()` calls `ensureConnection(client)` and then immediately reads `maps.find(m => m.id === activeMapId) || active`. `ensureConnection()` can asynchronously discover/adopt a persisted World Map and schedules React state updates (`maps`, `activeMapId`, `connectedMapId`, `baseDocument`, `version`), but those state updates are not synchronously visible inside the same `save()` invocation. Therefore, when connection repair/adoption is needed, the subsequent `current.id !== mapId` guard can evaluate against the pre-adoption document and report `Active map is not the connected World Map`, even though `ensureConnection()` has successfully found the target. This is a concrete frontend failure boundary before the merge RPC is reached.

### F-011 — Quick Save also depends on a remote load before commit
`saveWithConflictDetection()` first calls `loadMapDocumentSnapshot(client, local.id)`, then parses/merges the remote snapshot, checks the remote version, and only afterward calls `map_editor_commit_merge_v1`. Consequently, a Save failure can occur in remote snapshot retrieval/parsing or three-way merge without reaching the commit RPC. The commit RPC itself performs authentication, ownership, version comparison, durable version insertion, reconciliation, and runtime snapshot update. The current audit therefore cannot attribute every historical "Save failed" message to Supabase commit failure; the UI currently collapses all caught errors into a generic status string.

### F-012 — Runtime snapshot can be trusted before durable-version comparison
`loadMapDocumentSnapshot()` accepts a found runtime snapshot after parsing and returns its `result.version_number` without comparing that version against the newest durable `map_versions` row. The Supabase runtime RPC likewise returns the runtime row directly when present and only falls back to durable history when the runtime row is absent. Database identity audits found the current stored rows internally consistent, but the read contract does not prove that a stale runtime cache cannot become authoritative if it exists with an older valid snapshot. This is a separate persistence-integrity gap from the concrete frontend state race in F-010.

## Current implementation evidence

- Active page renders `MapEditorAppV4`.
- `MapDocument` supports three map types.
- `EditorShell` currently resets history only on `initialDocument.id`, avoiding the previous continuous-reference flicker regression.
- V4 Save Slot calls `map_editor_save_slot_v1`.
- V4 Load Slot calls `map_editor_load_save_slot_v1`.
- Quick Save calls `map_editor_commit_merge_v1` through conflict detection.
- `map-document.ts` currently allocates every layer with `cells:Array.from({length:240}, ...)` while the document separately declares `width:20` and `height:12`.
- `save()` can read stale React state after `ensureConnection()` schedules adoption state updates.
- `saveWithConflictDetection()` performs remote load and three-way merge before the commit RPC.
- `map_editor_commit_merge_v1` inserts a durable version and then invokes reconciliation; an unhandled reconciliation failure occurs inside the commit transaction boundary.
- `map_editor_get_runtime_snapshot_v1` returns an existing runtime row without checking it against the newest durable version.

## Current database evidence

Supabase exposes the dedicated Save/Load and merge RPCs. The current database contains repeated World Map rows; the newest observed World Map has one durable version and zero slots, while older maps demonstrate that slots have been persisted historically. The latest function audit confirms the merge RPC, reconcile RPC, runtime snapshot RPC, and Save Slot/Load Slot RPCs are present with the contracts described above. No database change was made during this audit.

## Phase 0 rule

These findings are audit evidence, not permission to patch architecture. Each finding must be reproduced or verified with focused tests. No Save/Load architecture rewrite should occur until the actual failure boundary is established.

## Foundation audit sequence

- State / identity lifecycle: audited; F-010 identifies a concrete Save state-commit race.
- Renderer lifecycle: audited; full Pixi application recreation on document changes is confirmed as a separate stability/performance defect.
- Layer/grid dimension invariant: audited; F-008/F-009 are confirmed foundation defects.
- Persistence failure boundary: audited at frontend and RPC-contract level; F-010/F-011/F-012 identified. Exact historical browser error instance is not available from the repository audit alone.
- Remaining Phase 0 items: canonical load/save identity validation, terrain approval enforcement, focused reproduction tests, and final foundation gate.
