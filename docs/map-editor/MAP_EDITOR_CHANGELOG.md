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
**Notes:** The three map types share one canonical MapDocument and persistence architecture.

## 2026-09-16 — Asset library staging structure created

- **Type:** Added
- **Reason:** Separate asset storage from application use and establish dedicated system categories.
- **Details:** Added `assets/` with categories for Map Editor, Life Build, Inventory, Characters, Environment, Weapons, Objects, UI, Effects, Vehicles, Animations, Animals, Shared, Source, and Documentation. Added storage/approval rules and asset registry.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Folder structure and registry committed. Binary asset transfer not yet verified through GitHub.
-**Notes:** Supplied audited source packages remain the provenance baseline; no asset has been activated in application code.

## 2026-09-16 — Asset binary transfer boundary documented

- **Type:** Added / Changed
- **Reason:** Prevent a false claim that large supplied ZIP libraries were copied into GitHub when the available connector does not provide a suitable verified binary transfer path.
- **Details:** Recorded the supplied master/LPC packages as source-library inputs and explicitly separated repository storage structure from binary transfer status.
-**Affected:** `assets/_source/README.md`, `assets/_documentation/ASSET_LIBRARY_REGISTRY.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Source package presence verified in project-uploaded files; repository binary transfer remains pending.
-**Notes:** Individual assets must not be declared repository-present until a verified transfer occurs.

## 2026-09-16 — Supabase terrain whitelist audited

- **Type:** Added / Changed
- **Reason:** Prevent unapproved or partially reviewed terrain assets from entering the Map Editor staging library.
- **Details:** Queried Supabase terrain types, binding candidates, and asset registry records. Established a two-source approval rule requiring both `asset_registry.status = approved` and `asset_binding_candidates.candidate_status = approved`, with `category = terrain` for terrain staging.
- **Affected:** `docs/map-editor/MAP_EDITOR_ASSET_APPROVAL.md`, `assets/map-editor/terrain/README.md`, Supabase asset approval boundary.
-**Verification:** Supabase audit completed. Current final approved terrain staging set is empty because the discovered records contain status mismatches.
-**Notes:** Examples include `Mountains v6 Snow` (binding approved, registry pending) and `tile_grass.png`, `tile_dirt.png`, `tile_pavement.png` (registry approved, binding needs_review). No binary terrain asset was activated or promoted.

## 2026-09-16 — Save/Load contract created

- **Type:** Added
- **Reason:** Establish an implementation-independent contract before repairing Save/Load behavior.
-**Details:** Defined identity, MapDocument, serialization, Quick Save, Save Slot, Load Latest, Load Slot, error boundaries, atomicity, concurrency, projection separation, and verification requirements.
-**Affected:** `docs/map-editor/MAP_EDITOR_SAVE_LOAD_CONTRACT.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Documentation committed to GitHub.
-**Notes:** No runtime Save/Load code was changed. The contract requires explicit error stages rather than collapsing failures into a generic save error.

## 2026-09-17 — Construction Blueprint and Requirements Matrix established

- **Type:** Added
- **Reason:** Create a single construction guide so future implementation follows the documented architecture rather than improvising from legacy code or symptoms.
- **Details:** Added `BLUEPRINT.md` as the Map Editor construction guide and `REQUIREMENTS.md` as a testable foundation requirements matrix. The blueprint consolidates the existing Bible, roadmap, contracts, game-design and technical boundaries and explicitly maps the current foundation defects to implementation requirements.
- **Affected:** `docs/map-editor/BLUEPRINT.md`, `docs/map-editor/REQUIREMENTS.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Documentation committed to GitHub. No runtime code, Supabase schema, RPC, or asset binary was changed.
-**Notes:** Immediate foundation focus is editor-state identity, failed-load safety, renderer lifecycle stability, and deterministic MapDocument grid sizing. Existing Save/Load and Database contracts remain authoritative.

## 2026-09-17 — Map Editor documentation consolidated under Blueprint

- **Type:** Changed / Moved
- **Reason:** Make the Blueprint the single navigational root for the Map Editor construction documentation while preserving the Change Log and Status Log at the documented governance path.
- **Details:** Moved the existing Bible, Requirements, Database Contract, Save/Load Contract, Technical Architecture, Game Design, Roadmap, Phase Goals, Asset Approval, and Foundation/Load audits into `docs/map-editor/blueprint/`. No document contents were rewritten as part of the move.
-**Affected:** `docs/map-editor/blueprint/` documentation tree; root Change Log and Status Log remain at `docs/map-editor/`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository tree move prepared; runtime code, Supabase schema/RPCs, deployment, and asset binaries unchanged.
-**Notes:** The Change Log and Status Log remain at their original paths because the Bible explicitly defines those paths as mandatory governance records.

## 2026-09-17 — Blueprint documentation move verified

- **Type:** Verified / Updated
- **Reason:** The previous entry described the move as prepared; the repository tree has now been checked after the actual create/delete operations.
- **Details:** Confirmed the Blueprint directory contains the moved construction documents and the root `docs/map-editor/` directory retains only the governance logs. The moved files preserve their original blob SHAs/content identity.
-**Affected:** `docs/map-editor/blueprint/`, `MAP_EDITOR_CHANGELOG.md`, `MAP_EDITOR_STATUS_LOG.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Verified against the GitHub repository tree on 2026-09-17. No runtime code, Supabase schema/RPCs, deployment, or binary asset was changed.
-**Notes:** The governance logs remain at root by design. Future documentation references should use the new `blueprint/` paths.

## 2026-09-17 — State / identity foundation audit recorded

- **Type:** Added
- **Reason:** Verify the next foundation invariants before touching Save/Load implementation.
- **Details:** Audited `activeMapId`, `connectedMapId`, EditorShell history boundaries, MapBrowser navigation, Load Slot identity handling, and local child-map persistence scope. Identified that map selection does not atomically synchronize persistence metadata, and Load Slot does not explicitly verify `document.id === requested mapId` before adoption.
-**Affected:** `map-editor-app-v4.tsx`, `editor-shell.tsx`, `map-browser.tsx`, `map-document.ts`, `map-manager.ts`, `playable-hierarchy.ts`, `MAP_EDITOR_STATE_IDENTITY_AUDIT_2026-09-17.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Source audit completed; no runtime or Supabase change made.
-**Notes:** This is an audit finding, not yet a code fix. The next implementation must preserve the anti-flicker history rule while introducing an explicit map-open boundary.

## 2026-09-17 — Layer/grid dimension foundation audit recorded

- **Type:** Added
- **Reason:** Verify the deterministic MapDocument grid invariant before terrain, object, persistence, or renderer implementation proceeds.
-**Details:** Audited `map-document.ts` and searched the repository for additional `cells.length` producers. Confirmed that the shared `layer()` constructor hardcodes 240 cells while the document separately declares width/height. The current default 20×12 map masks the defect because 20×12 equals 240, but the data model is not dimension-safe.
-**Affected:** `apps/map-editor/editor/map-document.ts`, `MAP_EDITOR_FOUNDATION_AUDIT_2026-09-16.md`, grid/serialization requirements.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Source audit completed; no runtime or Supabase change made. Repository code search found no additional matching `cells.length` producer in the available index.
-**Notes:** Implementation should centralize grid allocation around `width * height` and add an explicit validation/test boundary for imported or persisted documents. This is a foundation correction, not yet applied.

## 2026-09-17 — Persistence failure boundary audit recorded

- **Type:** Added
- **Reason:** Trace Quick Save from the V4 UI through remote snapshot loading, three-way merge, commit RPC, reconciliation, and runtime snapshot update before changing persistence code.
-**Details:** Confirmed a concrete frontend state race: `ensureConnection()` can schedule adoption of a persisted World Map, while `save()` immediately continues using its pre-adoption React state. This can reach the `Active map is not the connected World Map` guard before the merge RPC. Also confirmed that Quick Save has pre-commit failure stages in remote snapshot retrieval/parsing/merge, and that the runtime snapshot read path does not compare a valid runtime cache against the newest durable version before accepting it.
-**Affected:** `map-editor-app-v4.tsx`, `map-persistence.ts`, `map-conflict-save-controller.ts`, `map-merge-persistence.ts`, `map-merge-persistence-supabase.ts`, Supabase `map_editor_commit_merge_v1`, `map_editor_reconcile_after_merge_v1`, `map_editor_get_runtime_snapshot_v1`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository source and current Supabase function definitions audited. No runtime or database change made; exact historical browser error cannot be reconstructed from source alone.
-**Notes:** The next implementation should separate connection/adoption from Save execution and make the authoritative load/version boundary explicit. Do not rewrite the merge RPC until a focused reproduction demonstrates an RPC-side failure.

## 2026-09-17 — Terrain approval enforcement audit recorded

- **Type:** Added
- **Reason:** Verify that runtime terrain loading obeys the documented two-source asset whitelist before terrain implementation proceeds.
-**Details:** Audited `MAP_EDITOR_ASSET_APPROVAL.md`, `terrain-asset-binding-loader.ts`, `terrain-asset-binding.ts`, and the V4 terrain bootstrap path. Confirmed two approval-boundary defects: the loader accepts `verified`/`active` asset statuses beyond the documented `approved` state, and its base-terrain path does not require an approved binding candidate. V4 also synthesizes base bindings directly from `asset_registry` without checking a matching approved binding candidate, creating a second approval path outside the whitelist.
-**Affected:** `MAP_EDITOR_ASSET_APPROVAL.md`, `apps/map-editor/editor/terrain-asset-binding-loader.ts`, `apps/map-editor/editor/terrain-asset-binding.ts`, `apps/map-editor/components/map-editor-app-v4.tsx`, Supabase asset approval boundary.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository source audit completed against current `main`. No runtime, Supabase, or asset binary change made.
-**Notes:** The documented final approved terrain staging set remains empty from the prior Supabase audit. The next step is focused reproduction tests and the final Phase 0 foundation gate; approval enforcement should be implemented only after that gate.

## 2026-09-17 — Focused test readiness audit recorded

-**Type:** Added
-**Reason:** Determine whether Phase 0 failure boundaries can be reproduced automatically before beginning foundation implementation.
-**Details:** Audited `apps/map-editor/package.json`, `apps/map-editor/tsconfig.json`, and repository test-search results. The Map Editor package has only `dev`, `build`, and `start` scripts and no test-runner dependency or discovered test suite. Defined deterministic test seams for grid sizing/serialization, requested map identity, terrain approval, and Save connection/adoption state.
-**Affected:** `apps/map-editor/package.json`, `apps/map-editor/tsconfig.json`, `MAP_EDITOR_FOUNDATION_AUDIT_2026-09-16.md`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
**Verification:** Repository audit completed. Focused tests themselves are not yet implemented or executed.
-**Notes:** The V4 React `ensureConnection()`/`save()` adoption race still has no direct deterministic UI seam; it remains an audit finding until an implementation seam can be tested without coupling tests to React timing.

## 2026-09-17 — Focused test harness expanded

-**Type:** Added
-**Reason:** Establish executable unit-test coverage around the audited foundation boundaries before runtime fixes.
-**Details:** Added Vitest configuration and the Map Editor `test` script, grid/serialization foundation tests, requested-map identity contract tests, terrain approval boundary tests, and persistence autosaver tests. The identity tests intentionally expose the current missing requested-map guard rather than marking the defect as passing.
-**Affected:** `apps/map-editor/package.json`, `apps/map-editor/vitest.config.ts`, `apps/map-editor/tests/map-document-grid.test.ts`, `apps/map-editor/tests/map-foundation-invariants.test.ts`, `apps/map-editor/tests/map-persistence-identity.test.ts`, `apps/map-editor/tests/terrain-asset-binding.test.ts`, `apps/map-editor/tests/map-persistence-autosaver.test.ts`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Test files and runner configuration committed to GitHub. Tests have not been executed in this session, so no pass/fail result is claimed.
-**Notes:** The V4 React `ensureConnection()`/`save()` adoption race still has no direct deterministic UI seam; it remains an audit finding until an implementation seam can be tested without coupling tests to React timing.

## 2026-09-17 — Authoritative commit separated from projection failure

-**Type:** Changed / Fixed
-**Reason:** The database commit RPC now distinguishes a durable `map_versions` commit from downstream projection/reconciliation failure. The frontend needed to preserve that distinction instead of treating the RPC result as a generic committed response.
-**Details:** Extended the merge persistence response with `projection_status` and `projection_error`; exposed those fields through `ConflictSaveResult`; added regression coverage for successful projection, failed projection after authoritative commit, optimistic conflict, and missing commit metadata. Verified the live `map_editor_commit_merge_v1` definition after migration `separate_authoritative_commit_from_projection_failure` and confirmed the Map Editor test workflow passed on commit `e75bbdcec7a111852262511fbd98d5ef7d76a137` (run `35187622874`).
-**Affected:** `apps/map-editor/editor/map-merge-persistence.ts`, `apps/map-editor/editor/map-merge-persistence-supabase.ts`, `apps/map-editor/editor/map-conflict-save-controller.ts`, `apps/map-editor/tests/map-merge-persistence.test.ts`, Supabase `map_editor_commit_merge_v1`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Verified by live Supabase function inspection and GitHub Actions run `35187622874`.
-**Notes:** The authoritative version remains committed even when projection reports `failed`; UI-level messaging/handling of `projectionStatus` is the next boundary to audit before closing F-011.

## 2026-09-17 — V4 Quick Save projection-aware status

-**Type:** Changed / Fixed
-**Reason:** The merge persistence contract now exposes projection outcome separately from authoritative commit success, so the V4 UI must not collapse a durable save with a downstream projection failure into a generic `Saved` message.
-**Details:** Updated `map-editor-app-v4.tsx` bootstrap handling to preserve `projectionStatus` and `projectionError`. Quick Save now reports three explicit states after a committed version: projection committed, projection not run, or projection failed, while still preserving the authoritative version and document in editor state.
-**Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** Repository write succeeded as commit `d64c8f8dcc62e494ec7845bb9ad78e7f1158a417`. Browser/Vercel verification is still pending.
-**Notes:** This closes the UI messaging portion of F-011 for Quick Save, but end-to-end browser verification and projection-failure recovery behavior remain open foundation work.

## 2026-09-17 — Asset scale-scope contract defined

-**Type:** Added / Changed
-**Reason:** The Phase 0 asset audit confirmed that the current database records approval/provenance and asset capabilities but has no contractual mechanism to distinguish World, Region, and Playable eligibility.
-**Details:** Added `MAP_EDITOR_ASSET_SCOPE_CONTRACT.md`, defining explicit `world`, `region`, and `playable` scopes, separating approval from scope eligibility, prohibiting inference from filenames/folders/categories/metadata, and specifying a future many-to-many scope relation. Updated `MAP_EDITOR_ASSET_APPROVAL.md` to reference the new contract. No existing asset received an automatic scope assignment.
-**Affected:** `docs/map-editor/blueprint/MAP_EDITOR_ASSET_SCOPE_CONTRACT.md`, `docs/map-editor/blueprint/MAP_EDITOR_ASSET_APPROVAL.md`.
**Roadmap phase:** Phase 0 — Foundation Audit.
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

- **Type:** Fixed
- **Reason:** Browser testing showed `Save failed: bootstrap: conflict` even though the audited authoritative World Map already contains durable versions. The frontend could enter the bootstrap branch when an existing authoritative snapshot was not adopted, masking the real load/read/parse boundary behind a misleading bootstrap conflict.
- **Details:** Updated `map-editor-app-v4.tsx` so `ensureConnection()` now treats an existing discovered authoritative version as a loadability error instead of attempting bootstrap against expected version `0`. Bootstrap remains reserved for an authoritative map with no discovered durable version. The error now reports the discovered version and loadability code, making the next failure stage explicit.
-**Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`.
-**Roadmap phase:** Phase 0 — Foundation Audit.
-**Verification:** GitHub source update committed as `73cf73278154f8237144054db893762e17715a48`. Live Supabase audit confirms the canonical World Map exists with durable versions; browser/Vercel verification of this correction is pending.
-**Notes:** No Supabase schema/RPC or asset binary was changed by this correction. The next browser result should distinguish `version > 0 but snapshot not loadable` from a true empty-map bootstrap case.
