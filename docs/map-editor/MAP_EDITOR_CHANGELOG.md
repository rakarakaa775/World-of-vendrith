## 2026-10-10 — Terrain v2 history map-identity guard

- **Type:** Bug fix and regression test added (execution pending)
- **Reason:** The lower-level `MapHistoryV2` helper allowed a different map ID to be committed into an existing history, unlike `MapEditorStateHistory`. Undo could therefore restore a state belonging to another map.
- **Details:** `commitHistoryV2` now rejects map-identity changes. The test asserts that rejection leaves the original history untouched and that a different map starts a fresh history using `createHistoryV2`.
- **Affected:** `apps/map-editor/editor/map-history-v2.ts`, `apps/map-editor/editor/map-history-v2.test.ts`, `docs/map-editor/MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Terrain semantics v2 — editor-state and persistence integration gate.
- **Verification:** Source/test updates are committed; tests, typecheck, and build have not been executed. No passing CI is claimed. No active editor wiring or production persistence/database changes.

## 2026-10-10 — Terrain v2 pair-validation regression coverage

- **Type:** Tests added (execution pending)
- **Reason:** Cover two Save v2 boundary cases called out by the editor-state integration contract.
- **Details:** Added regression tests that reject a `playableSpace: "interior"` map as the exterior and accept a valid world-only save with `exterior: null`.
- **Affected:** `apps/map-editor/editor/game-save-state-v2.test.ts`, `docs/map-editor/MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Terrain semantics v2 — editor-state and persistence integration gate.
- **Verification:** Tests were authored through the GitHub connector but not executed; no passing test/typecheck/build/CI is claimed. No live UI, RPC, database/schema/data, or production runtime changes.

## 2026-10-10 — Terrain v2 editor-state integration contract

- **Type:** Documentation / integration gate
- **Reason:** Define a safe migration path from opt-in terrain v2 state to the document-only active editor without losing semantics or changing production persistence prematurely.
- **Details:** Documented atomic world/exterior pair adoption, authoritative world identity, strict map-type validation, legacy v1 behavior, combined history, recovery and conflict-save requirements, Save Slot/RPC invariants, and verification/rollout gates.
- **Affected:** `docs/map-editor/MAP_EDITOR_TERRAIN_V2_EDITOR_STATE_INTEGRATION_CONTRACT.md`, `docs/map-editor/MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Terrain semantics v2 — editor-state and persistence integration gate.
- **Verification:** Documentation-only change. No test, typecheck, or build was run; no passing CI is claimed. No live editor, RPC, database/schema/data, or production runtime changes.
- **Next:** Implement only missing pure pair-adoption tests/logic after checking existing parser coverage; avoid duplicating the existing authoritative-world-ID parser helper.

## 2026-10-10 — Opt-in terrain v2 snapshot adapter

- **Type:** Added / Tested (test execution pending)
- **Reason:** Establish a serializer boundary that can carry authored terrain semantics together with MapDocument without changing the live v1 Save/Load path.
- **Details:** Added `map-snapshot-v2.ts` with an explicit `vandrith.map-document-v2` envelope, terrain semantics validation against document bounds, strict requested-map identity, and v1 parsing compatibility. Legacy v1 inputs intentionally return `terrainSemantics: null`; the adapter does not fabricate semantics or mutate stored data. Added regression cases for round-trip, legacy compatibility, requested-ID mismatch, unsupported versions, out-of-bounds cells, and envelope identity.
- **Affected:** `apps/map-editor/editor/map-snapshot-v2.ts`, `apps/map-editor/editor/map-snapshot-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — persistence integration gate.
- **Verification:** GitHub source writes completed. Tests and typecheck have not been executed in this session; no passing CI is claimed. Adapter is not connected to the live Save/Load, Save Slot, recovery, or editor UI. No Supabase schema/data/RPC or runtime navigation changes.
- **Notes:** Next step is run targeted Vitest and typecheck, fix any failures, then integrate only at a clearly versioned persistence boundary after tests pass.

## 2026-10-10 — Atomic terrain v2 history model added

- **Type:** Added / Tested (test execution pending)
- **Reason:** Prevent document edits and authored terrain semantics from drifting apart when undo/redo is eventually enabled for v2 snapshots.
- **Details:** Added a separate `MapHistoryV2` pure state helper whose history entries hold the MapDocument and TerrainSemanticsSection together. Added tests for undo, redo, alternate edit after undo, identity no-op, and history boundaries. The existing v1 `MapHistory` and EditorShell remain unchanged; this is not yet wired into UI state or persistence.
- **Affected:** `apps/map-editor/editor/map-history-v2.ts`, `apps/map-editor/tests/map-history-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — persistence integration gate.
- **Verification:** Source and fixtures reviewed against allowed terrain feature values. Tests/typecheck were not executed through the available GitHub connector; no passing CI result is claimed. No Supabase schema/data/RPC or runtime navigation changes.

## 2026-10-10 — Terrain persistence integration audit and serializer test hardening

- **Type:** Added / Tested (test execution pending)
- **Reason:** Establish the safe integration boundary for authored terrain semantics before changing save/load, history, or runtime navigation.
- **Details:** Expanded v2 envelope tests to cover deterministic parse/serialize round-trip and requested map identity for v1/v2. Added `VENDRITH_TERRAIN_PERSISTENCE_INTEGRATION_AUDIT_V1.md` documenting current v1 MapDocument shape, resize behavior, v2 envelope boundary, legacy handling, and required save/load/history/recovery sequence.
- **Affected:** `apps/map-editor/tests/map-serialization-v2.test.ts`, `docs/architecture/VENDRITH_TERRAIN_PERSISTENCE_INTEGRATION_AUDIT_V1.md`.
- **Roadmap phase:** Terrain semantics v2 — persistence integration gate.
- **Verification:** Changes committed to `feat/vendrith-ecc-v1`. Automated tests and typecheck were not executed in this turn; GitHub status/workflow results were unavailable. No Supabase schema/data/RPC, production runtime, or navigation changes.
- **Notes:** The v2 envelope is not yet wired into all save/load/history/recovery call sites.

## 2026-10-02 — Phase 2D diagnostic views implemented

- **Type:** Added / Updated
- **Reason:** Complete the World Map Editor diagnostic surface so map problems can be inspected directly on the canvas without mutating authoring data.
- **Details:** Added projection-only Grid, Terrain ID, Water Depth (D1–D4 derived bands), Collision/Passability, Layer Isolation, Object Bounds, Invalid-cell Highlight, Diagnostic Legend, and Read-only Debug Mode. Debug state is kept outside MapDocument; layer isolation does not mutate persisted layer visibility/active flags.
- **Affected:** `apps/map-editor/components/editor-shell.tsx`, `apps/map-editor/components/pixi-map-canvas.tsx`, `apps/map-editor/editor/debug-views.ts`, `apps/map-editor/editor/terrain-engine.ts`, focused debug/depth tests.
- **Roadmap phase:** Phase 2D — Debug & Diagnostic Views. Implementation is marked `[~]` until browser runtime verification is completed.
- **Verification:** Focused debug/depth tests passed; TypeScript and production build checks completed locally. Existing autoprefixer warning remains non-fatal. Browser click-level verification is pending because the connected Codespace has no browser/Chromium runner.
- **Notes:** No Supabase schema/data/RPC changes and no terrain/object persistence contract changes.

## 2026-10-01 — Phase 0 Foundation closure hardening

- **Type:** Fixed / Added
- **Reason:** Final Phase 0 audit found that map adoption could prefer a browser-provided document over an existing authoritative identity snapshot, Save Slot adoption lacked an explicit World identity gate, and the repository lacked focused regression coverage for the foundation invariants.
- **Details:** `openMap()` now prefers the authoritative identity snapshot whenever one exists and rejects requested/provided/adopted ID mismatches. Save Slot loading now verifies the restored World ID and playable Exterior shape. Added Phase 0 regression tests for grid sizing, resize invariants, malformed cell counts, requested-map identity, and persistence navigation boundaries. Added a GitHub Actions Phase 0 gate for `npm test` and `npm run build`.
- **Affected:** `apps/map-editor/components/vendrith-world-builder-app.tsx`, `apps/map-editor/tests/map-foundation.test.ts`, `apps/map-editor/tests/map-save-state.test.ts`, `.github/workflows/map-editor-phase0.yml`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Vercel production build reached READY on commit `3f801bfc072df1bf4669049ccbca1e6a4c72766b`. Supabase audit confirms the deployed `map_editor_get_runtime_snapshot_v1` already rejects stale runtime snapshots by returning the newest durable version. The new GitHub Actions workflow was committed, but no workflow run is currently exposed for the commit, so test execution is not claimed as passed here.
- **Notes:** No terrain paint path was changed. No existing applied migration was rewritten; the database already contains the later stale-runtime guard migration.

# Vandrith Map Editor — Change Log

**Purpose:** Detailed historical record of what was updated, changed, added, removed, restored, or fixed in the Map Editor.

## Rules

- Every implementation update must add an entry.
- Record both successful changes and reversions when they affect the repository or Supabase contract.
- Never delete historical entries; append corrections as new entries.
- Each entry must identify the date, area, change type, reason, affected files/contracts, and verification state when known.
- If a change is later reverted, record the revert as a separate entry and link it conceptually to the original change.
- This log and `MAP_EDITOR_STATUS_LOG.md` are mandatory companions for every project update.
- Roadmap changes must record the affected phase, goal, gate, and reason.
- Asset-library changes must record storage category, provenance/approval state, and whether binaries were actually transferred.

## Entry format

### YYYY-MM-DD — Short title

- **Type:** Added / Changed / Updated / Removed / Restored / Reverted / Fixed
- **Reason:** Why the change was made.
- **Details:** What was changed.
- **Affected:** Files, database objects, RPCs, UI, serializer, assets, or contracts.
- **Roadmap phase:** Active phase at the time of change.
- **Verification:** Not tested / In progress / Verified / Reverted.
- **Notes:** Important compatibility or rollback information.

## 2026-09-16 — Documentation baseline created

- **Type:** Added
- **Reason:** Establish a stable specification before further Save/Load implementation work.
- **Details:** Added the Map Editor Database Contract and formalized the documentation-first workflow.
- **Affected:** `docs/map-editor/MAP_EDITOR_DATABASE_CONTRACT.md`, this changelog, Bible.
- **Roadmap phase:** Foundation documentation.
- **Verification:** Documentation committed to repository.
- **Notes:** No runtime behavior was changed by this documentation entry.

## 2026-09-16 — Save/Load V4 experiment recorded

- **Type:** Updated / Reverted
- **Reason:** The Save/Load V4 experiment attempted to resolve Supabase map connection and Load state handling, but introduced canvas flicker and still reported save errors.
- **Details:** The V4 experiment was superseded/reverted so canvas stability could be restored before further persistence changes.
- **Affected:** Editor state/history behavior and Save/Load flow.
- **Roadmap phase:** Pre-roadmap debugging; now returned to Foundation Audit.
- **Verification:** Flicker regression observed; persistence issue remained unresolved.
- **Notes:** Future fixes must isolate persistence errors without coupling canvas rendering/history to network state.

## 2026-09-16 — Canvas flicker baseline restored

- **Type:** Restored
- **Reason:** A history-reset comparison introduced render instability during normal painting.
- **Details:** Restored the editor behavior that does not reset history continuously while the document changes during painting.
- **Affected:** `EditorShell` history/document boundary behavior.
- **Roadmap phase:** Foundation Audit.
- **Verification:** Commit recorded as the stability restoration baseline; browser verification remains required.
- **Notes:** A future Load implementation must create an explicit state boundary only after a successful validated load.

## 2026-09-16 — Database contract and documentation controls formalized

- **Type:** Added / Changed
- **Reason:** Prevent further implementation drift and preserve an auditable project history.
- **Details:** Added the database contract, detailed changelog, and short status log; updated the Bible to require both logs for every project update.
- **Affected:** `MAP_EDITOR_DATABASE_CONTRACT.md`, `MAP_EDITOR_CHANGELOG.md`, `MAP_EDITOR_STATUS_LOG.md`, `MAP_EDITOR_BIBLE.md`.
- **Roadmap phase:** Foundation documentation.
- **Verification:** Documentation committed to GitHub.
- **Notes:** Future implementation work must update both logs in the same work session as the change.

## 2026-09-16 — Roadmap audited and reset to Foundation Audit

- **Type:** Added / Changed / Reset
- **Reason:** Previous implementation progress and checklist assumptions were not sufficient to establish the actual foundation state after repeated Save/Load regressions.
- **Details:** Added the Master Roadmap and Phase Goals documents. Audited the documented architecture against the current known issues. Removed the concept of completed roadmap checkmarks and reset phase progress to a fresh Foundation Audit.
- **Affected:** `MAP_EDITOR_ROADMAP.md`, `MAP_EDITOR_PHASE_GOALS.md`, `MAP_EDITOR_BIBLE.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Roadmap and phase-goal documents committed; foundation audit itself is pending.
- **Notes:** No new runtime implementation was performed as part of this roadmap reset.

## 2026-09-16 — Roadmap made mandatory construction order

- **Type:** Changed
- **Reason:** Prevent implementation from jumping ahead to later phases while foundation problems remain unresolved.
- **Details:** Bible now requires every implementation task to identify and follow the active roadmap phase. Later-phase work may not be silently implemented early.
- **Affected:** `MAP_EDITOR_BIBLE.md`, `MAP_EDITOR_ROADMAP.md`, `MAP_EDITOR_PHASE_GOALS.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Documentation committed.
- **Notes:** Any future roadmap revision must also update the phase-goal document and both logs.

## 2026-09-16 — Three-map scope formalized

- **Type:** Changed / Updated
- **Reason:** Ensure the Map Editor documentation explicitly matches the product goal of authoring World, Kingdom/Region, and Playable maps.
- **Details:** Added map-scale definitions, scale-specific authoring rules, explicit `map_type` semantics, World → Region and Region → Playable relationships, and scale-specific technical/projection/test requirements.
- **Affected:** `MAP_EDITOR_BIBLE.md`, `MAP_EDITOR_GAME_DESIGN.md`, `MAP_EDITOR_TECHNICAL.md`, `MAP_EDITOR_ROADMAP.md`, `MAP_EDITOR_PHASE_GOALS.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Documentation committed; implementation audit remains pending.
-**Notes:** The three map types share one canonical MapDocument and persistence architecture.

## 2026-09-16 — Asset library staging structure created

- **Type:** Added
- **Reason:** Separate asset storage from application use and establish dedicated system categories.
- **Details:** Added `assets/` with categories for Map Editor, Life Build, Inventory, Characters, Environment, Weapons, Objects, UI, Effects, Vehicles, Animations, Animals, Shared, Source, and Documentation. Added storage/approval rules and asset registry.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Folder structure and registry committed. Binary asset transfer not yet verified through GitHub.
- **Notes:** Supplied audited source packages remain the provenance baseline; no asset has been activated in application code.

## 2026-09-16 — Asset binary transfer boundary documented

- **Type:** Added / Changed
- **Reason:** Prevent a false claim that large supplied ZIP libraries were copied into GitHub when the available connector does not provide a suitable verified binary transfer path.
- **Details:** Recorded the supplied master/LPC packages as source-library inputs and explicitly separated repository storage structure from binary transfer status.
- **Affected:** `assets/_source/README.md`, `assets/_documentation/ASSET_LIBRARY_REGISTRY.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Source package presence verified in project-uploaded files; repository binary transfer remains pending.
- **Notes:** Individual assets must not be declared repository-present until a verified transfer occurs.

## 2026-09-16 — Supabase terrain whitelist audited

- **Type:** Added / Changed
- **Reason:** Prevent unapproved or partially reviewed terrain assets from entering the Map Editor staging library.
- **Details:** Queried Supabase terrain types, binding candidates, and asset registry records. Established a two-source approval rule requiring both `asset_registry.status = approved` and `asset_binding_candidates.candidate_status = approved`, with `category = terrain` for terrain staging.
- **Affected:** `docs/map-editor/MAP_EDITOR_ASSET_APPROVAL.md`, `assets/map-editor/terrain/README.md`, Supabase asset approval boundary.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Supabase audit completed. Current final approved terrain staging set is empty because the discovered records contain status mismatches.
- **Notes:** Examples include `Mountains v6 Snow` (binding approved, registry pending) and `tile_grass.png`, `tile_dirt.png`, `tile_pavement.png` (registry approved, binding needs_review). No binary terrain asset was activated or promoted.

## 2026-09-16 — Save/Load contract created

- **Type:** Added
- **Reason:** Establish an implementation-independent contract before repairing Save/Load behavior.
- **Details:** Defined identity, MapDocument, serialization, Quick Save, Save Slot, Load Latest, Load Slot, error boundaries, atomicity, concurrency, projection separation, and verification requirements.
- **Affected:** `docs/map-editor/MAP_EDITOR_SAVE_LOAD_CONTRACT.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Documentation committed to GitHub.
-**Notes:** No runtime Save/Load code was changed. The contract requires explicit error stages rather than collapsing failures into a generic save error.

## 2026-09-17 — Construction Blueprint and Requirements Matrix established

- **Type:** Added
- **Reason:** Create a single construction guide so future implementation follows the documented architecture rather than improvising from legacy code or symptoms.
- **Details:** Added `BLUEPRINT.md` as the Map Editor construction guide and `REQUIREMENTS.md` as a testable foundation requirements matrix. The blueprint consolidates the existing Bible, roadmap, contracts, game-design and technical boundaries and explicitly maps the current foundation defects to implementation requirements.
- **Affected:** `docs/map-editor/blueprint/BLUEPRINT.md`, `docs/map-editor/blueprint/REQUIREMENTS.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Documentation committed to GitHub. No runtime code, Supabase schema, RPC, or asset binary was changed.
-**Notes:** Immediate foundation focus is editor-state identity, failed-load safety, renderer lifecycle stability, and deterministic MapDocument grid sizing. Existing Save/Load and Database contracts remain authoritative.

## 2026-09-17 — Map Editor documentation consolidated under Blueprint

- **Type:** Changed / Moved
- **Reason:** Make the Blueprint the single navigational root for the Map Editor construction documentation while preserving the Change Log and Status Log at the documented governance path.
- **Details:** Moved the existing Bible, Requirements, Database Contract, Save/Load Contract, Technical Architecture, Game Design, Roadmap, Phase Goals, Asset Approval, and Foundation/Load audits into `docs/map-editor/blueprint/`. No document contents were rewritten as part of the move.
- **Affected:** `docs/map-editor/blueprint/` documentation tree; root Change Log and Status Log remain at `docs/map-editor/`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Repository tree move prepared; runtime code, Supabase schema/RPCs, deployment, and asset binaries unchanged.
-**Notes:** The Change Log and Status Log remain at their original paths because the Bible explicitly defines those paths as mandatory governance records.

## 2026-09-17 — Blueprint documentation move verified

- **Type:** Verified / Updated
- **Reason:** The previous entry described the move as prepared; the repository tree has now been checked after the actual create/delete operations.
- **Details:** Confirmed the Blueprint directory contains the moved construction documents and the root `docs/map-editor/` directory retains only the governance logs. The moved files preserve their original blob SHAs/content identity.
- **Affected:** `docs/map-editor/blueprint/`, `MAP_EDITOR_CHANGELOG.md`, `MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Verified against the GitHub repository tree on 2026-09-17. No runtime code, Supabase schema/RPCs, deployment, or binary asset was changed.
-**Notes:** The governance logs remain at root by design. Future documentation references should use the new `blueprint/` paths.

## 2026-09-17 — State / identity foundation audit recorded

- **Type:** Added
- **Reason:** Verify the next foundation invariants before touching Save/Load implementation.
- **Details:** Audited `activeMapId`, `connectedMapId`, EditorShell history boundaries, MapBrowser navigation, Load Slot identity handling, and local child-map persistence scope. Identified that map selection does not atomically synchronize persistence metadata, and Load Slot does not explicitly verify `document.id === requested mapId` before adoption.
- **Affected:** `map-editor-app-v4.tsx`, `editor-shell.tsx`, `map-browser.tsx`, `map-document.ts`, `map-manager.ts`, `playable-hierarchy.ts`, `MAP_EDITOR_STATE_IDENTITY_AUDIT_2026-09-17.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Source audit completed; no runtime or Supabase change made.
-**Notes:** This is an audit finding, not yet a code fix. The next implementation must preserve the anti-flicker history rule while introducing an explicit map-open boundary.

## 2026-09-17 — Layer/grid dimension foundation audit recorded

- **Type:** Added
- **Reason:** Verify the deterministic MapDocument grid invariant before terrain, object, persistence, or renderer implementation proceeds.
- **Details:** Audited `map-document.ts` and searched the repository for additional `cells.length` producers. Confirmed that the shared `layer()` constructor hardcodes 240 cells while the document separately declares width/height. The current default 20×12 map masks the defect because 20×12 equals 240, but the data model is not dimension-safe.
- **Affected:** `apps/map-editor/editor/map-document.ts`, `MAP_EDITOR_FOUNDATION_AUDIT_2026-09-16.md`, grid/serialization requirements.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Source audit completed; no runtime or Supabase change made. Repository code search found no additional matching `cells.length` producer in the available index.
-**Notes:** Implementation should centralize grid allocation around `width * height` and add an explicit validation/test boundary for imported or persisted documents. This is a foundation correction, not yet applied.

## 2026-09-17 — Persistence failure boundary audit recorded

- **Type:** Added
- **Reason:** Trace Quick Save from the V4 UI through remote snapshot loading, three-way merge, commit RPC, reconciliation, and runtime snapshot update before changing persistence code.
- **Details:** Confirmed a concrete frontend state race: `ensureConnection()` can schedule adoption of a persisted World Map, while `save()` immediately continues using its pre-adoption React state. This can reach the `Active map is not the connected World Map` guard before the merge RPC. Also confirmed that Quick Save has pre-commit failure stages in remote snapshot retrieval/parsing/merge, and that the runtime snapshot read path does not compare a valid runtime cache against the newest durable version before accepting it.
- **Affected:** `map-editor-app-v4.tsx`, `map-persistence.ts`, `map-conflict-save-controller.ts`, `map-merge-persistence.ts`, `map-merge-persistence-supabase.ts`, Supabase `map_editor_commit_merge_v1`, `map_editor_reconcile_after_merge_v1`, `map_editor_get_runtime_snapshot_v1`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Repository source and current Supabase function definitions audited. No runtime or database change made; exact historical browser error cannot be reconstructed from source alone.
-**Notes:** The next implementation should separate connection/adoption from Save execution and make the authoritative load/version boundary explicit. Do not rewrite the merge RPC until a focused reproduction demonstrates an RPC-side failure.

## 2026-09-17 — Terrain approval enforcement audit recorded

- **Type:** Added
- **Reason:** Verify that runtime terrain loading obeys the documented two-source asset whitelist before terrain implementation proceeds.
- **Details:** Audited `MAP_EDITOR_ASSET_APPROVAL.md`, `terrain-asset-binding-loader.ts`, `terrain-asset-binding.ts`, and the V4 terrain bootstrap path. Confirmed two approval-boundary defects: the loader accepts `verified`/`active` asset statuses beyond the documented `approved` state, and its base-terrain path does not require an approved binding candidate. V4 also synthesizes base bindings directly from `asset_registry` without checking a matching approved binding candidate, creating a second approval path outside the whitelist.
- **Affected:** `MAP_EDITOR_ASSET_APPROVAL.md`, `apps/map-editor/editor/terrain-asset-binding-loader.ts`, `apps/map-editor/editor/terrain-asset-binding.ts`, `apps/map-editor/components/map-editor-app-v4.tsx`, Supabase asset approval boundary.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Repository source audit completed against current `main`. No runtime, Supabase, or asset binary change made.
-**Notes:** The documented final approved terrain staging set remains empty from the prior Supabase audit. The next step is focused reproduction tests and the final Phase 0 foundation gate; approval enforcement should be implemented only after that gate.

## 2026-09-17 — Focused test readiness audit recorded

- **Type:** Added
- **Reason:** Determine whether Phase 0 failure boundaries can be reproduced automatically before beginning foundation implementation.
- **Details:** Audited `apps/map-editor/package.json`, `apps/map-editor/tsconfig.json`, and repository test-search results. The Map Editor package has only `dev`, `build`, and `start` scripts and no test-runner dependency or discovered test suite. Defined deterministic test seams for grid sizing/serialization, requested map identity, terrain approval, and Save connection/adoption state.
- **Affected:** `apps/map-editor/package.json`, `apps/map-editor/tsconfig.json`, `MAP_EDITOR_FOUNDATION_AUDIT_2026-09-16.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
**Verification:** Repository audit completed. Focused tests themselves are not yet implemented or executed.
-**Notes:** The V4 React `ensureConnection()`/`save()` adoption race still has no direct deterministic UI seam; it remains an audit finding until an implementation seam can be tested without coupling tests to React timing.

## 2026-09-17 — Focused test harness expanded

- **Type:** Added
- **Reason:** Establish executable unit-test coverage around the audited foundation boundaries before runtime fixes.
- **Details:** Added Vitest configuration and the Map Editor `test` script, grid/serialization foundation tests, requested-map identity contract tests, terrain approval boundary tests, and persistence autosaver tests. The identity tests intentionally expose the current missing requested-map guard rather than marking the defect as passing.
- **Affected:** `apps/map-editor/package.json`, `apps/map-editor/vitest.config.ts`, `apps/map-editor/tests/map-document-grid.test.ts`, `apps/map-editor/tests/map-foundation-invariants.test.ts`, `apps/map-editor/tests/map-persistence-identity.test.ts`, `apps/map-editor/tests/terrain-asset-binding.test.ts`, `apps/map-editor/tests/map-persistence-autosaver.test.ts`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Test files and runner configuration committed to GitHub. Tests have not been executed in this session, so no pass/fail result is claimed.
-**Notes:** The V4 React `ensureConnection()`/`save()` adoption race still has no direct deterministic UI seam; it remains an audit finding until an implementation seam can be tested without coupling tests to React timing.

## 2026-09-17 — Authoritative commit separated from projection failure

- **Type:** Changed / Fixed
- **Reason:** The database commit RPC now distinguishes a durable `map_versions` commit from downstream projection/reconciliation failure. The frontend needed to preserve that distinction instead of treating the RPC result as a generic committed response.
- **Details:** Extended the merge persistence response with `projection_status` and `projection_error`; exposed those fields through `ConflictSaveResult`; added regression coverage for successful projection, failed projection after authoritative commit, optimistic conflict, and missing commit metadata. Verified the live `map_editor_commit_merge_v1` definition after migration `separate_authoritative_commit_from_projection_failure` and confirmed the Map Editor test workflow passed on commit `e75bbdcec7a111852262511fbd98d5ef7d76a137` (run `35187622874`).
- **Affected:** `apps/map-editor/editor/map-merge-persistence.ts`, `apps/map-editor/editor/map-merge-persistence-supabase.ts`, `apps/map-editor/editor/map-conflict-save-controller.ts`, `apps/map-editor/tests/map-merge-persistence.test.ts`, Supabase `map_editor_commit_merge_v1`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Verified by live Supabase function inspection and GitHub Actions run `35187622874`.
-**Notes:** The authoritative version remains committed even when projection reports `failed`; UI-level messaging/handling of `projectionStatus` is the next boundary to audit before closing F-011.

## 2026-09-17 — V4 Quick Save projection-aware status

- **Type:** Changed / Fixed
- **Reason:** The merge persistence contract now exposes projection outcome separately from authoritative commit success, so the V4 UI must not collapse a durable save with a downstream projection failure into a generic `Saved` message.
- **Details:** Updated `map-editor-app-v4.tsx` bootstrap handling to preserve `projectionStatus` and `projectionError`. Quick Save now reports three explicit states after a committed version: projection committed, projection not run, or projection failed, while still preserving the authoritative version and document in editor state.
- **Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository write succeeded as commit `d64c8f8dcc62e494ec7845bb9ad78e7f1158a417`. Browser/Vercel verification is still pending.
-**Notes:** This closes the UI messaging portion of F-011 for Quick Save, but end-to-end browser verification and projection-failure recovery behavior remain open foundation work.

## 2026-09-17 — Asset scale-scope contract defined

- **Type:** Added / Changed
- **Reason:** The Phase 0 asset audit confirmed that the current database records approval/provenance and asset capabilities but has no contractual mechanism to distinguish World, Region, and Playable eligibility.
- **Details:** Added `MAP_EDITOR_ASSET_SCOPE_CONTRACT.md`, defining explicit `world`, `region`, and `playable` scopes, separating approval from scope eligibility, prohibiting inference from filenames/folders/categories/metadata, and specifying a future many-to-many scope relation. Updated `MAP_EDITOR_ASSET_APPROVAL.md` to reference the new contract. No existing asset received an automatic scope assignment.
- **Affected:** `docs/map-editor/blueprint/MAP_EDITOR_ASSET_SCOPE_CONTRACT.md`, `docs/map-editor/blueprint/MAP_EDITOR_ASSET_APPROVAL.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository documentation committed. Live Supabase schema was audited and confirmed to have no dedicated Map Editor asset-scope relation; no Supabase schema/RPC or asset binary changed.
-**Notes:** The next step is migration/RLS design and an implementation-level audit. The contract does not authorize a schema migration or initial scope assignments.

## 2026-09-17 — Pixi renderer lifecycle foundation repair

-**Type:** Fixed
-**Reason:** The Phase 0 renderer audit found that `PixiMapCanvas` destroyed and recreated the Pixi `Application` whenever the document, tool state, selection, callbacks, asset bindings, or environment state changed. That lifecycle coupled ordinary editor changes to canvas teardown/reinitialization and was the documented source of flicker risk.
-**Details:** Split the Pixi lifecycle from scene rendering. The component now creates one `Application` and one world container for its lifetime, keeps the latest editor props in refs, redraws the existing scene on document/render-input changes, and guards asynchronous asset loading against stale renders. Pointer/paint handlers are attached to the persistent world and read current props through the ref. Renderer readiness gates scene/event effects so initialization and interaction do not race.
-**Affected:** `apps/map-editor/components/pixi-map-canvas.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source update completed. Automated build/test and browser/Vercel verification are still pending in this session.
-**Notes:** This repair intentionally does not redesign the rendering model or introduce asset-scope persistence. It only establishes the renderer lifecycle boundary required by the foundation audit.

## 2026-09-17 — Authoritative bootstrap conflict guarded

-**Type:** Fixed
-**Reason:** Browser testing showed `Save failed: bootstrap: conflict` even though the audited authoritative World Map already contains durable versions. The frontend could enter the bootstrap branch when an existing authoritative snapshot was not adopted, masking the real load/read/parse boundary behind a misleading bootstrap conflict.
-**Details:** Updated `map-editor-app-v4.tsx` so `ensureConnection()` now treats an existing discovered authoritative version as a loadability error instead of attempting bootstrap against expected version `0`. Bootstrap remains reserved for an authoritative map with no discovered durable version. The error now reports the discovered version and loadability code, making the next failure stage explicit.
-**Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source update committed as `73cf73278154f8237144054db893762e17715a48`. Live Supabase audit confirms the canonical World Map exists with durable versions; browser/Vercel verification of this correction is pending.
-**Notes:** No Supabase schema/RPC or asset binary was changed by this correction. The next browser result should distinguish `version > 0 but snapshot not loadable` from a true empty-map bootstrap case.

## 2026-09-17 — Save adopts authoritative document on seed identity mismatch

-**Type:** Fixed
-**Reason:** The bootstrap-conflict repair exposed the remaining identity race: Save captured the local bootstrap seed before `ensureConnection()` could adopt the authoritative World Map. If those IDs differ, the stale seed must never be sent to the authoritative merge boundary.
-**Details:** Quick Save now preserves local edits only when the local document ID matches the resolved authoritative connection. When the IDs differ, it uses the already validated authoritative document returned by `ensureConnection()`. This keeps the identity guard strict while preventing a known bootstrap seed from being published as the connected World Map.
-**Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source update committed as `2fe13486d8c6f60ce5d2303228d98301a9d828f9`. Automated test/Vercel/browser verification remains pending.
-**Notes:** No Supabase schema/RPC or asset binary changed. This is a frontend persistence-boundary correction.

## 2026-09-17 — Authoritative snapshot diagnostics added

-**Type:** Fixed
-**Reason:** Browser testing still reported `snapshot-parse-or-read-failure` with an existing authoritative version. The previous persistence boundary discarded the actual runtime/durable parse or read error, preventing the next failure stage from being identified.
-**Details:** Extended `RuntimeSnapshotResult` with an optional error detail and preserved the exact stage when runtime parsing fails, durable version reads fail, or durable snapshot parsing fails. V4 now includes that detail in the visible `Authoritative snapshot is not loadable` message instead of collapsing it to a generic code.
-**Affected:** `apps/map-editor/editor/map-persistence.ts`, `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub commits `9e5728f2ad9e1b341c821237142c0153ef3f68fb` and `98bdfe9f6523291021997332e9b176c2128d24be`. Supabase schema/data unchanged. Browser/Vercel verification remains pending.
-**Notes:** The live authoritative version 4 was independently inspected and its stored payload currently satisfies the visible serializer invariants: schema `vandrith.map-document`, payload/document version `1`, World Map identity, 20×12 dimensions, tile size 32, 3 layers, and 240 cells per layer. The new diagnostic message is therefore the next required evidence boundary before any database repair is considered.

## 2026-09-18 — Persisted snapshot identity diagnostic deepened

-**Type:** Fixed / Updated
-**Reason:** Browser testing now reports `runtime-and-durable-parse-failed` with `Map document identity is incomplete`, while a direct live Supabase audit shows the canonical runtime snapshot and version 4 payload both contain `document.id`, `document.name`, and `document.mapType`. The next evidence boundary must distinguish a malformed transported payload from a different runtime target without weakening serializer validation.
-**Details:** Extended `map-persistence.ts` to include the requested map ID and the observed persisted identity fields plus envelope/document keys whenever runtime or durable snapshot parsing fails. The parser contract remains strict; no fallback identity is synthesized and no persisted data is modified.
-**Affected:** `apps/map-editor/editor/map-persistence.ts`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Live Supabase audit confirms canonical runtime snapshot and durable version 4 currently contain complete World Map identity. GitHub source update committed as `2c37f023267216200fc21f993e34be2d0e3bcdb9`. Browser/Vercel verification of the new diagnostic remains pending.
-**Notes:** No Supabase schema/data change was made. If the next browser message reports missing identity fields despite the live payload being complete, the evidence points to the browser deployment/environment or RPC transport boundary rather than a corrupted version 4 row.

## 2026-09-18 — Serializer identity guard made explicit

-**Type:** Fixed / Added
-**Reason:** The browser now reports complete persisted `id`, `name`, and `mapType` values while still surfacing the old generic identity error. That combination is logically inconsistent with the current serializer source and required a traceable parser boundary rather than a database change.
-**Details:** Replaced the serializer's truthiness-only identity check with explicit type/non-empty checks and a unique parser marker. Added a regression fixture using the exact audited authoritative World Map identity and requested ID. No identity fallback or persisted-data rewrite was introduced.
-**Affected:** `apps/map-editor/editor/map-serialization.ts`, `apps/map-editor/tests/map-serialization.test.ts`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Source changes committed as `7b2c4de6e2cfe9a20a0ca0c8aa4d52de649202e5` and `2585b29c64f0498b20bc437db3e0da101652cfba`. Vercel/browser verification pending; Supabase unchanged.
-**Notes:** If the next browser error still lacks the `map-document-parser-v2` marker, the running deployment is not executing this serializer revision even if the UI contains the newer persistence diagnostic.

## 2026-09-18 — Serializer numeric validation boundary repaired

- **Type:** Fixed / Added
- **Reason:** Vercel build of commit `a55c3a5` compiled successfully but TypeScript rejected the serializer because `Number.isInteger()` does not narrow optional numeric properties. The previous local-constant attempt therefore remained compile-unsafe.
- **Details:** Added an explicit `requirePositiveInteger()` validation boundary for `width`, `height`, and `tileSize`, returning a concrete `number` only after checking numeric type, integer-ness, and positivity. Added regression coverage for malformed persisted numeric fields while retaining the existing authoritative World Map object/string fixtures and grid cell-count checks.
- **Affected:** `apps/map-editor/editor/map-serialization.ts`, `apps/map-editor/editor/map-foundation.test.ts`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source updates committed as `2b7b7c1a9d1172b5b67ea01c219e55e9e15cd56a` and `1847477176c44175656cd4e76bc6f18016e31c63`. Vercel rebuild verification is pending; no Supabase schema/data or asset binary changed.
-**Notes:** This is a compile-time boundary repair only. The Save/Load contract remains unchanged: invalid documents must fail before persistence, and authoritative identity must still be validated before adoption.

## 2026-09-18 — Serializer persisted-object input boundary aligned

- **Type:** Fixed / Updated
- **Reason:** The Phase 0 audit identified that the runtime path receives a canonical `{ schema, version, document }` object from Supabase, while `parseMapDocument()` only declared string or MapDocument inputs. The test had therefore required a type-suppressing cast even though the runtime parser already handled an object envelope.
- **Details:** Extended the parser input contract to accept the canonical serialized object envelope directly. Retained strict schema/version/identity validation and the explicit positive-integer boundary for `width`, `height`, and `tileSize`. Removed the test-only `never` cast so the regression test exercises the declared persisted-object contract directly.
-**Affected:** `apps/map-editor/editor/map-serialization.ts`, `apps/map-editor/editor/map-foundation.test.ts`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source updates committed as `7c847dad188d6aabf74e0016dac5aab1fb283e4c` and `02f1ed5e6e369379d1dd79ebe96c332a2c8275d3`. Vercel rebuild verification is pending. No Supabase schema/data or asset binary changed.
-**Notes:** This keeps the parser aligned with the Save/Load Contract's persisted snapshot representation rather than weakening validation to satisfy TypeScript.


## 2026-09-18 — Save rebase and Load Latest cache bypass

- **Type:** Fixed / Added
- **Reason:** Browser verification showed that the Map Editor could auto-load and load Save Slot 2 at version 3, while Quick Save and Load Latest still failed. The source audit found two concrete state/version problems: Quick Save returned a conflict solely because the authoritative remote version was newer than the loaded Save Slot, even when three-way merge had no conflicts; and Load Latest called ensureConnection() without forcing a fresh authoritative read, allowing an older Save Slot connection context to be reused.
- **Details:** Updated map-conflict-save-controller.ts so the three-way merge is evaluated first. If local and remote changes are conflict-free, the save now commits against the remote version just read, effectively rebasing an older slot onto the current authoritative version. A true conflict still returns the conflict result, and a race during commit is reloaded and surfaced as a conflict. Updated map-editor-app-v4.tsx so ensureConnection() accepts a force-reload boundary and Load Latest uses it, then atomically adopts the freshly loaded authoritative document/version and refreshes slots. Added map-conflict-save-controller.test.ts covering conflict-free rebase and same-cell conflict.
- **Affected:** apps/map-editor/editor/map-conflict-save-controller.ts, apps/map-editor/components/map-editor-app-v4.tsx, apps/map-editor/tests/map-conflict-save-controller.test.ts.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Source audit and repository writes completed. Automated/Vercel/browser verification is still pending.
- **Notes:** No Supabase schema/data change was made. This fix preserves strict identity and three-way merge semantics; it does not bypass the authoritative version guard.

## 2026-09-18 — Governance catch-up for serializer repair and temporary-file cleanup

- **Type:** Updated
- **Reason:** A serializer repair and a temporary-file cleanup were committed before the mandatory paired governance entries were added.
- **Details:** Recorded serializer commit 6b5372ae262b9ee7e79477f1ff900369a6c475ae and cleanup commit 932bc294c2c6615eb58b7878d18af6a8efecf97c without changing their historical content or behavior.
- **Affected:** apps/map-editor/editor/map-serialization.ts, temporary serializer file cleanup, governance logs.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Governance history reconciled in this update session.
- **Notes:** No Supabase schema/data or asset binaries changed.
 
## 2026-09-18 — Load Latest switched to direct durable authoritative read

- **Type:** Fixed
- **Reason:** Browser verification now shows Quick Save succeeds, but Load Latest still fails. The previous repair bypassed the React connection cache but still entered `loadMapDocumentSnapshot()`, which first consumes the runtime snapshot RPC before falling back to durable history.
- **Details:** Load Latest now reads the newest `map_versions` row directly for the audited authoritative World Map, parses that durable snapshot with the requested map ID, then atomically replaces the editor document, persistence baseline, version, and Save Slot list. This separates the explicit “Load Latest” action from the runtime cache path.
- **Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Save was observed working in browser at version 7. Direct durable Load Latest is implemented in commit `5fa15f7897728ff6f727c5628bbad85a05ca00e0`; Vercel/browser verification of this commit remains pending.
- **Notes:** No Supabase schema/data or asset binaries were changed.


## 2026-10-02 — Paint shape regression coverage expanded

- **Type:** Added
- **Reason:** The Terrain & Selection Suite already exposed Rectangle and Flood tools, but executable test coverage only verified Line behavior.
- **Details:** Added regression coverage for Rectangle normal/reverse drag ordering and Flood Fill contiguous-region boundaries without changing production paint behavior.
- **Affected:** `apps/map-editor/tests/paint-tools.test.ts`.
- **Roadmap phase:** Phase 2C — Terrain & Selection Suite.
- **Verification:** Verified with Desktop Commander: `paint-tools.test.ts` 8/8 passed; official Map Editor suite 11/11 files and 43/43 tests passed.
- **Notes:** No Supabase schema/data, RPC, asset binary, or production runtime logic changed.


## 2026-10-02 — Phase 2E Layer System foundation

- **Type:** Added
- **Reason:** Start the Layer System phase without changing the terrain or building foundations.
- **Details:** Added Layer Tree controls for active selection, visibility, lock/unlock, ordering, and per-layer opacity. Opacity is part of MapLayer document metadata and is rendered through Pixi layer alpha. Existing immutable layer-state operations continue through EditorShell history, preserving undo/redo behavior.
- **Affected:** `apps/map-editor/components/editor-shell.tsx`, `apps/map-editor/editor/layer-state.ts`, `apps/map-editor/editor/map-document.ts`, `apps/map-editor/components/pixi-map-canvas.tsx`, `apps/map-editor/tests/layer-state.test.ts`.
- **Roadmap phase:** Phase 2E — Layer System.
- **Verification:** PR #25 and #26 merged. Phase 2E preview build for the Layer Tree reached Vercel READY; click-level browser verification remains pending because `agent-browser` is unavailable in Codespace. The opacity branch did not receive a separate preview deployment through the API commit sequence.
- **Notes:** No Supabase schema/data/RPC or asset binary changes.


## 2026-10-02 — Duplicate and merge layer operations

- **Type:** Added
- **Reason:** Continue Phase 2E Layer System with safe layer composition operations.
- **Details:** Duplicate Layer creates an independent layer/cell/object copy with collision-safe identities. Merge Layer only accepts same-kind layers, overlays populated source cells, preserves objects with collision-safe IDs, and removes the source layer. Both operations use the existing EditorShell history path.
- **Affected:** `apps/map-editor/editor/layer-state.ts`, `apps/map-editor/components/editor-shell.tsx`, `apps/map-editor/tests/layer-state.test.ts`.
- **Roadmap phase:** Phase 2E — Layer System.
- **Verification:** PR #28 merged. Browser click-level verification remains pending.
- **Notes:** No Supabase schema/data/RPC or asset binary changes.
\n\n## 2026-10-02 — Layer Groups\n\n- **Type:** Added\n- **Details:** Added document-level layer groups with visibility, lock, expand/collapse, layer assignment, safe group deletion, and effective renderer visibility. Older serialized documents normalize missing group/opacity metadata safely.\n- **Roadmap phase:** Phase 2E — Layer System.\n- **Verification:** PR #30 merged. Browser click-level verification remains pending.\n- **Notes:** No Supabase schema/data/RPC or asset binary changes.\n

## 2026-10-02 — Layer Templates\n\n- **Type:** Added\n- **Details:** Added reusable layer templates capturing layer kind/presentation metadata. Applying a template creates a fresh empty layer; deleting a template does not affect existing layers.\n- **Roadmap phase:** Phase 2E — Layer System.\n- **Verification:** PR #32 merged. Browser click-level verification remains pending.\n- **Notes:** No Supabase schema/data/RPC or asset binary changes.


## 2026-10-10 — Terrain semantics v2 snapshot hardening

- **Type:** Changed / Test
- **Reason:** Ensure the opt-in v2 adapter cannot serialize a malformed MapDocument past the established v1 document invariants.
- **Details:** V2 serialization now parses the serialized document through the canonical v1 parser before wrapping it with terrain semantics. Added a regression test for inconsistent map dimensions and layer cell counts. Audited persistence paths: active Save/Load, crash recovery, and conflict-save remain v1-only, so v2 has not been wired into production.
- **Affected:** `apps/map-editor/editor/map-snapshot-v2.ts`, `apps/map-editor/editor/map-snapshot-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — opt-in persistence adapter.
- **Verification:** Source-level review only. Vitest, typecheck, and build are pending; no passing result is claimed.
- **Notes:** No production RPC, database schema/data, or asset binary changes.


## 2026-10-10 — Opt-in v2 crash-recovery journal

- **Type:** Added / Test
- **Details:** Added a separate v2 recovery journal that stores document and terrain semantics in one validated snapshot. Includes tests for round-trip recovery, map identity mismatch, malformed journal data, and clearing entries.
- **Affected:** `apps/map-editor/editor/map-crash-recovery-v2.ts`, `apps/map-editor/editor/map-crash-recovery-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — recovery adapter.
- **Verification:** Source-level review only. Vitest, typecheck, and build have not been run in this workflow; no passing result is claimed.
- **Notes:** Existing v1 recovery remains unchanged. No production RPC, database schema/data, or asset binary changes.

## 2026-10-10 — Combined v2 undo/redo regression coverage

- **Type:** Test
- **Details:** Added regression coverage proving the v2 history treats the MapDocument and terrain semantics as a single state through undo/redo, preserves no-op behavior at history boundaries, and clears redo history after a new commit following undo.
- **Affected:** `apps/map-editor/editor/map-history-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — history adapter.
- **Verification:** Source-level review only; Vitest, typecheck, and build have not been run in this workflow. No passing result is claimed.
- **Notes:** Existing v1 editor history and production persistence remain unchanged.


## 2026-10-10 — V2 history bounds and runtime validation

- **Type:** Hardened / Test
- **Reason:** The first v2 history helper allowed unbounded retained history and trusted TypeScript types at a runtime boundary.
- **Details:** Added `MAP_HISTORY_V2_MAX_ENTRIES = 100`, bounded both undo and redo retention, and validated document shape through the canonical serializer/parser plus terrain semantics against map dimensions before accepting a new state. Added tests for history caps, malformed document dimensions, and out-of-bounds terrain semantics.
- **Affected:** `apps/map-editor/editor/map-history-v2.ts`, `apps/map-editor/editor/map-history-v2.test.ts`.
- **Roadmap phase:** Terrain semantics v2 — persistence integration gate.
- **Verification:** Source-level review only. Vitest, typecheck, and build have not been executed in this workflow; no passing result is claimed.
- **Notes:** This remains separate from active v1 editor history and live persistence. No production RPC, database schema/data, or runtime water-navigation changes.


## 2026-10-10 — Active-editor Terrain v2 integration audit

- **Type:** Audit / Documentation
- **Reason:** The isolated v2 snapshot, history, and recovery helpers are not yet connected to the active editor; integration must not lose semantics through document-only pathways.
- **Details:** Audited `editor-shell.tsx`, v1 map history, v1 persistence, v1/v2 crash recovery, conflict-save controller, and save-slot parser. Recorded current boundaries, invariants, and staged integration gates in `MAP_EDITOR_TERRAIN_V2_INTEGRATION_GATE.md`.
- **Decision:** Keep v2 opt-in. Before integration, define explicit legacy/uninitialized semantics, coordinate edits and resize atomically, resolve semantic three-way merge behavior, and audit database RPC payload contracts. Run tests/typecheck/build before any activation.
- **Verification:** Source-level repository audit only; no Vitest/typecheck/build result is claimed.
- **Safety:** No production RPC/schema/data, active editor UI, or runtime navigation changes.


## 2026-10-10 — Terrain v2 Gate A state contract

- **Type:** Architecture / Test
- **Reason:** The v2 terrain model needs one explicit editor-state boundary that does not fabricate semantics for legacy v1 maps or carry semantics across map identities.
- **Details:** Added the opt-in `MapEditorState` union, explicit semantics initialization, canonical document replacement, same-map resize handling, and guarded v2 serialization. Added regression tests for legacy/v2 parse behavior, initialization validation, identity changes, resize, and malformed payloads.
- **Affected:** `apps/map-editor/editor/map-editor-state-v2.ts`, `apps/map-editor/editor/map-editor-state-v2.test.ts`, `docs/map-editor/MAP_EDITOR_TERRAIN_V2_GATE_A_STATE_CONTRACT.md`.
- **Verification:** Source-level review only. Vitest, typecheck, and build have not been executed; no passing result is claimed.
- **Safety:** Adapter remains isolated from active editor UI and persistence. No production RPC/database or runtime water-navigation changes.


## 2026-10-10 — Terrain v2 combined state history

- **Type:** Architecture / Test
- **Reason:** Document-only undo/redo is not safe for an editor state that includes independent terrain semantics.
- **Details:** Added an opt-in history adapter for the complete legacy-or-initialized state, with canonical validation, bounded history, atomic undo/redo, redo invalidation, and cross-map reset requirements. Added focused regression tests.
- **Affected:** `apps/map-editor/editor/map-editor-state-history-v2.ts`, `apps/map-editor/editor/map-editor-state-history-v2.test.ts`, `docs/map-editor/MAP_EDITOR_TERRAIN_V2_STATE_HISTORY.md`.
- **Verification:** Source-level review only. Vitest, typecheck, and build have not been executed; no passing result is claimed.
- **Safety:** Active v1 editor history and persistence remain unchanged. No production RPC/database or runtime water-navigation changes.


## 2026-10-10 — Active editor terrain v2 integration audit

- **Type:** Architecture / Audit
- **Reason:** Avoid partial integration that drops terrain semantics through document-only UI callbacks, history, persistence, recovery, save slots, or conflict merge.
- **Details:** Documented active editor mutation paths, paint gesture special handling, and the required integration sequence in `MAP_EDITOR_TERRAIN_V2_ACTIVE_EDITOR_AUDIT.md`.
- **Verification:** GitHub source inspection only; Vitest, typecheck, and build have not been executed.
- **Safety:** No live editor, production persistence/RPC/database, or runtime water-navigation changes.


## 2026-10-10 — Game Save v2 contract proposal

- **Type:** Architecture / Compatibility contract
- **Reason:** Current save-slot format is v1-only and cannot persist initialized terrain semantics.
- **Details:** Added `MAP_EDITOR_TERRAIN_V2_GAME_SAVE_CONTRACT.md` with proposed v2 envelope, validation rules, legacy behavior, and gated migration sequence.
- **Verification:** Source inspection through GitHub file reads only; tests, typecheck, and build have not been executed.
- **Safety:** Proposal only. Active save/load and production RPC/database behavior are unchanged.


## 2026-10-10 — Opt-in Game Save state v2 adapter

- **Type:** Implementation / Tests
- **Reason:** The existing v1 save envelope cannot retain initialized terrain semantics.
- **Details:** Added a separate `game-save-state-v2.ts` adapter and focused compatibility/validation tests. Legacy v1 saves load as uninitialized states; no terrain semantics are inferred. V2 parsing validates the entire world/exterior pair atomically.
- **Affected:** `apps/map-editor/editor/game-save-state-v2.ts`, `apps/map-editor/editor/game-save-state-v2.test.ts`.
- **Verification:** GitHub source inspection only. Vitest, typecheck, and build have not been executed; no passing result is claimed.
- **Safety:** Existing v1 helpers and active save/load, RPC/database, recovery, conflict-save, and runtime navigation remain unchanged. No production database changes.


## 2026-10-10 — Active Save Slot consumer audit for terrain v2

- **Type:** Audit / Compatibility
- **Reason:** Prevent the new opt-in Game Save state v2 adapter from being accidentally connected to a v1-only active Save Slot consumer.
- **Details:** Traced the active save/load callbacks, documented that the active save path uses the v1 serializer and the load path assumes nested v1 map documents. Recorded the missing atomic editor-state restoration and exterior-space guard.
- **Affected:** `docs/map-editor/MAP_EDITOR_TERRAIN_V2_ACTIVE_SAVE_SLOT_AUDIT.md`.
- **Verification:** GitHub source inspection only; no tests/typecheck/build executed.
- **Safety:** No active Save/Load, RPC, production database, or runtime behavior changed.


## 2026-10-10 — Save Slot RPC contract audit for terrain v2

- **Type:** Audit / Persistence contract
- **Details:** Inspected the repository-main Save Slot RPC migration and recorded its validation boundary and the gap between the independently stored slot envelope and referenced world version. Explicitly distinguished repository source from deployed database state.
- **Affected:** `docs/map-editor/MAP_EDITOR_TERRAIN_V2_SAVE_SLOT_RPC_AUDIT.md`.
- **Verification:** Source inspection only. No SQL or production DB changes; automated tests not run.


## 2026-10-10 — Save Slot identity guard in opt-in adapter

- **Type:** Validation hardening / Tests
- **Details:** Added an opt-in parser wrapper that enforces the authoritative world map ID, plus matching/mismatching/blank-ID tests. This complements the source-only Save Slot RPC audit.
- **Affected:** `apps/map-editor/editor/game-save-state-v2.ts`, `apps/map-editor/editor/game-save-state-v2.test.ts`, `docs/map-editor/MAP_EDITOR_TERRAIN_V2_SAVE_SLOT_RPC_AUDIT.md`.
- **Verification:** Source changes committed; tests/typecheck/build not run in this workflow.
- **Safety:** No active Save/Load wiring or database changes.
