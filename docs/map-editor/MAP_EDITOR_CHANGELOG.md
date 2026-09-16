# Vandrith Map Editor — Change Log

**Purpose:** Detailed historical record of what was updated, changed, added, removed, restored, reverted, or fixed in the Map Editor.

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
- **Details:** Added the database contract, detailed changelog, and short status log; updated the Bible to require both logs for every repository/database/architecture update.
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
- **Notes:** The three map types share one canonical MapDocument and persistence architecture.

## 2026-09-16 — Asset library staging structure created

- **Type:** Added
- **Reason:** Separate asset storage from application use and establish dedicated system categories.
- **Details:** Added `assets/` with categories for Map Editor, Life Build, Inventory, Characters, Environment, Weapons, Objects, UI, Effects, Vehicles, Animations, Animals, Shared, Source, and Documentation. Added storage/approval rules and asset registry.
- **Affected:** `assets/`, `assets/_documentation/ASSET_LIBRARY_REGISTRY.md`, `MAP_EDITOR_BIBLE.md`, roadmap/phase-goal documents.
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
