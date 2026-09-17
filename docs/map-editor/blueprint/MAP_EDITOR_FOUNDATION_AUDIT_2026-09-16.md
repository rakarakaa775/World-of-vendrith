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
The client loader checks the runtime snapshot and then durable `map_versions`; the runtime RPC also falls back to durable history. Phase 0 must verify that stale runtime data cannot become authoritative.

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

### F-013 — Load Latest does not validate loaded document identity against the requested map ID
The V4 `adopt(client, mapId)` function calls `loadMapDocumentSnapshot(client, mapId)` and, if a document is returned, directly sets `maps`, `activeMapId`, and `baseDocument` from `loaded.document`; it does not assert `loaded.document.id === mapId`. This means the requested persistence target is not explicitly bound to the adopted document at the frontend load boundary. The existing three-way merge later checks IDs, but that is too late to serve as the Load identity gate.

### F-014 — Load Slot has the same missing identity gate
The V4 `loadSlot()` calls the requested map's Save Slot RPC, parses the returned snapshot, and directly adopts the parsed document. It sets `connectedMapId` to the requested map ID but does not verify `doc.id === id`. This can create a state in which the connected persistence target and the active document identity differ.

### F-015 — Persistence loader does not cross-check snapshot identity against the requested map ID
`loadMapDocumentSnapshot(client, mapId)` parses the runtime or durable snapshot but its parser only validates that the document has a non-empty `id`; it does not receive `mapId` as an expected identity and therefore cannot reject a validly shaped snapshot belonging to another map. The database RPCs enforce ownership and `map_id` at the row/query boundary, but the frontend canonical-load boundary should independently validate the returned document identity before adoption.

### F-016 — Serializer validation is structural but not complete for the grid and requested-target contract
`parseMapDocument()` validates schema/version, document identity presence, positive integer dimensions/tile size, and non-empty layers, but it does not validate layer IDs/kinds, layer cell counts against `width × height`, or equality between a caller's requested map ID and `document.id`. Those checks belong at the appropriate validation boundary rather than being inferred from later renderer or merge behavior.

### F-017 — Terrain binding loader accepts states outside the documented approval whitelist
The documented asset approval boundary requires both `asset_registry.status = approved` and `asset_binding_candidates.candidate_status = approved`, with terrain category required for terrain staging. The current `terrain-asset-binding-loader.ts` instead treats asset status values `approved`, `verified`, or `active` as acceptable. Its full-autotile path requires `candidate_status = approved`, but its base-terrain path (`neighbor_mask === 255`) does not require `candidate_status = approved` at all. Therefore the loader can promote a registry-approved base terrain asset even when its binding candidate is `needs_review` or `pending`, which directly contradicts the Phase 0 whitelist. This is a confirmed implementation-boundary defect; no runtime change has been made yet.

### F-018 — V4 creates a second terrain approval path outside the binding-candidate gate
`map-editor-app-v4.tsx` separately queries `asset_registry` for the five named terrain files and synthesizes base bindings whenever the asset has `status === approved` and a license registry ID. Those synthesized rows are then combined with `transition.accepted` from the binding loader. Because this path does not query or require a matching approved binding candidate, it can reintroduce an asset that the whitelist has rejected even if the binding workbench correctly rejected its candidate. This duplicates approval logic in the UI and makes the loader's whitelist non-authoritative at runtime.

### F-019 — Focused automated reproduction tests are not currently available in the Map Editor package
The audited `apps/map-editor/package.json` exposes only `dev`, `build`, and `start` scripts; no test runner or test script is defined. Repository search did not return an existing Vitest/Jest-style test suite for the audited Map Editor. `tsconfig.json` includes the application TypeScript/TSX sources but does not establish a test configuration. Therefore the Phase 0 requirement for focused reproduction tests cannot yet be marked verified from repository evidence. The failures identified in F-008/F-010/F-013/F-014/F-017/F-018 remain source-verified findings, but their runtime reproduction is not yet automated.

### F-020 — Phase 0 failure cases can be converted into deterministic unit-level test targets
The source audit provides clear test seams without requiring a browser-first reproduction for every defect: grid allocation/validation can be tested around `map-document.ts` and serialization; requested-ID rejection around the persistence/adoption boundary; terrain approval acceptance/rejection around `terrain-asset-binding-loader.ts`; and Save connection state can be isolated around the connection/adoption contract. These tests have not been implemented in Phase 0, so this is a test-plan finding rather than a claim of runtime verification.

### F-021 — Final Foundation Gate cannot pass yet because required focused tests are not established and executed
The Blueprint defines Foundation stability as requiring deterministic map identity, load safety, non-flickering renderer behavior, deterministic grid sizing, explicit World/Region/Playable identity, testable Save/Load contracts without canvas side effects, and synchronized Change/Status logging. The Requirements Matrix makes these acceptance conditions testable, including `STATE-001`, `STATE-002`, `STATE-003`, `DOC-002`, `SER-002`, `SER-003`, `RENDER-002`, `SAVE-001`, and `LOAD-002`. The repository audit has identified source-level defects touching these requirements, and F-019 confirms there is currently no Map Editor test harness. No focused runtime/unit test execution has been performed. Therefore Phase 0 remains **BLOCKED / NOT PASSED**. This is an evidence-gate result, not a claim that every defect has been reproduced at runtime.

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
- `parseMapDocument()` validates basic schema/document shape and dimensions but does not validate `document.id` against a requested persistence target or validate `cells.length === width × height`.
- `adopt()` and `loadSlot()` currently adopt parsed documents without an explicit requested-ID equality check.
- `terrain-asset-binding-loader.ts` accepts `approved`, `verified`, and `active` asset statuses, and its base-terrain path omits binding-candidate approval.
- `map-editor-app-v4.tsx` synthesizes additional base bindings directly from `asset_registry` without checking binding-candidate approval.
- `apps/map-editor/package.json` has no test script or test-runner dependency.

## Current database evidence

Supabase exposes the dedicated Save/Load and merge RPCs. The current database contains repeated World Map rows; the newest observed World Map has one durable version and zero slots, while older maps demonstrate that slots have been persisted historically. The latest function audit confirms the merge RPC, reconcile RPC, runtime snapshot RPC, and Save Slot/Load Slot RPCs are present with the contracts described above. The current asset approval audit found inconsistent registry/candidate states and therefore no final approved terrain staging set. No database change was made during this audit.

## Phase 0 rule

These findings are audit evidence, not permission to patch architecture. Each finding must be reproduced or verified with focused tests. No Save/Load architecture rewrite should occur until the actual failure boundary is established.

## Foundation audit sequence

- State / identity lifecycle: audited; F-010 identifies a concrete Save state-commit race.
- Renderer lifecycle: audited; full Pixi application recreation on document changes is confirmed as a separate stability/performance defect.
- Layer/grid dimension invariant: audited; F-008/F-009 are confirmed foundation defects.
- Persistence failure boundary: audited at frontend and RPC-contract level; F-010/F-011/F-012 identified. Exact historical browser error instance is not available from the repository audit alone.
- Canonical load/save identity validation: audited; F-013/F-014/F-015/F-016 are confirmed validation-boundary defects.
- Terrain approval enforcement: audited; F-017/F-018 confirm that runtime terrain loading has approval paths that are broader than the documented two-source whitelist.
- Focused reproduction tests: audited; F-019 confirms there is currently no repository test harness for the Map Editor, and F-020 defines the deterministic test seams that should be implemented next.
- Final foundation gate: evaluated; F-021 records that the gate is blocked until the focused tests are established and executed with evidence.
- Remaining Phase 0 work: establish the focused test harness, implement the deterministic reproduction tests, execute them, then re-evaluate the Foundation Gate before runtime architecture fixes or Phase 1 work.
