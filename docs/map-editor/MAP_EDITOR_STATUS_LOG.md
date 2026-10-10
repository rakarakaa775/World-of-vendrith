## 2026-10-10 — Add malformed Save Slot payload regressions

- Added focused parser tests for malformed JSON, a non-playable exterior payload, and legacy World identity mismatch.
- Test source commit: `2798bdd52eedb61684dd9dd95d34cc4f0753872f`.
- GitHub Actions execution for this exact commit has not yet been confirmed; do not treat the added cases as passing until CI reports green.
- Production remains unchanged. No Supabase branch was created, no migration was applied, and no RPC/grant/slot data was modified.


## 2026-10-10 — Save Slot RPC preflight and database release gates

- Rechecked live Save Slots using schema-aware JSONB comparisons: all 3 current rows pass version tuple, canonical version envelope, authoritative World ID/type, embedded World/version equality, and owner consistency checks.
- Verified current Save/Load RPC grants and security context read-only. `anon` cannot execute; `authenticated` can. Both functions retain `SECURITY DEFINER` and pinned `search_path=public, pg_temp`; no grants or function definitions were changed.
- Identified nullable `version_id` with `ON DELETE SET NULL` as an explicit fail-closed load case.
- Expanded the Save Slot remediation contract with ordered Save/Load validation requirements, a database regression matrix, and release gates. Updated the RPC audit document.
- Production remains unchanged. No migration was created/applied; migration CLI/test database workflow and explicit production approval remain prerequisites.

## 2026-10-10 — Save Slot parser regression resolved; CI green

- Investigated the failing Map Editor CI run: TypeScript typecheck and Next.js build passed; Vitest exposed a legacy-map parsing gap in the opt-in Game Save v2 adapter and a contradictory expectation for a valid legacy World + Exterior pair.
- Added strict normalization for raw legacy MapDocument payloads nested in Game Save v2, aligned the regression expectation with supported legacy compatibility, and corrected Load Slot status text for World-only saves.
- Verified commit `b15e2b257baaf36c1240292d41046b3461256da2` with Map Editor CI: typecheck passed, build passed, 163/163 test files and 793/793 tests passed.
- Production remains read-only: no migration applied, no RPC or data changes. Server-side Save Slot/version equality hardening remains gated on a separately reviewed migration and explicit production approval.

## 2026-10-10 — Save Slot parser completeness guard

- Tightened `parseGameSaveSlotSnapshot` to require both `world` and `exterior` properties in the current Game Save v1 envelope; malformed/incomplete envelopes fail before editor adoption.
- Added a regression test for incomplete current envelopes and corrected the interior fixture to satisfy map hierarchy validation so the test targets the intended exterior-space guard.
- CI status remains unavailable for the exact commits; no tests/typecheck/build are claimed as passing.

## 2026-10-10 — Save Slot schema-aware loading and live audit

- Added `parseGameSaveSlotSnapshot` to dispatch current Game Save v1 versus legacy map-document v1, validate authoritative world identity/type and exterior type/space, and reject unsupported formats before state adoption. The active Load Slot handler now uses this boundary.
- Added regression tests for current and legacy formats, wrong world identity, unsupported versions, invalid exterior, and non-world snapshots. Tests are committed but have not been executed here.
- Inspected deployed Save/Load RPC definitions read-only. All three existing Save Slots pass schema-aware world/version equality; two are Game Save v1 and one is legacy map-document v1. The earlier schema-agnostic mismatch was a false positive caused by the legacy envelope shape.
- Added a remediation contract for future RPC hardening. No production SQL, RPC, or data changes; deployed RPC equality validation remains a pending migration gate.

## 2026-10-10 — Save Slot invariant propagated to integration gate

- Updated the editor integration contract to require the embedded world `MapDocument` to match the referenced canonical map-version snapshot's `document` member; the exterior remains independent.
- This is a future integrity target, not a claim that the current RPC enforces it. No SQL or production changes; verification remains pending.

## 2026-10-10 — Save Slot world-version integrity contract clarified

- Audited the active Save Slot caller and repository serializer: the slot embeds a raw world `MapDocument`, while the referenced durable map version stores the canonical `{ schema, version, document }` wrapper.
- Documented the recommended invariant that the embedded world must structurally match the referenced version's `document` member; the current RPC source does not enforce it.
- Audit/documentation only. No SQL or production database changes; deployed function and test execution remain unverified.

## 2026-10-10 — Game Save v2 outbound serialization validation

- Hardened `serializeGameSaveStateV2` to canonicalize both legacy and initialized map states through the parser before emitting the envelope; raw v1 serialization alone is not treated as validation.
- Added a regression test that malformed legacy layer cell counts are rejected at serialization.
- Updated the integration contract. Active Save/Load and v1 RPC remain unchanged; tests/typecheck/build are still unexecuted.

## 2026-10-10 — Terrain v2 merge gate hardening

- Hardened the combined merge preflight so map identity and dimensions are checked before validating layer arrays. This ensures resize mismatches are rejected by the explicit no-concurrent-resize policy rather than by an incidental serialization error.
- Added a document-only conflict test; the suite now covers document-only, terrain-only, and simultaneous conflicts, plus clean merge, identity/dimension guards, invalid semantics, and snapshot round-trip.
- Changes remain opt-in and disconnected from active v1 persistence. Execution of tests/typecheck/build remains pending.

## 2026-10-10 — Combined Terrain v2 merge gate

- Added an opt-in composition helper that runs document and terrain-semantics three-way merges as a single v2 result.
- It rejects mismatched map identity/dimensions and invalid state, and returns an adoptable `merged` state only when both conflict collections are empty. Conflict results expose a preview but no `state` field.
- Added regression tests for independent edits, semantic-only conflicts, simultaneous document+semantic conflicts, identity/dimension mismatch, invalid semantics, and a v2 snapshot serialize/parse round-trip.
- The helper remains disconnected from active v1 save/UI/RPC. Tests, typecheck, and build are not executed in this GitHub-only workflow.

## 2026-10-10 — Terrain v2 merge serialization regression

- Extended the pure merge suite with a conflict-free v2 snapshot serialize/parse round-trip assertion to verify merged semantics and MapDocument remain paired.
- This is authored test coverage only; no test runner is available in this GitHub-only workflow, so execution remains pending. Active editor and production persistence remain unchanged.

## 2026-10-10 — Terrain v2 semantic three-way merge helper

- Added an opt-in pure merge helper for sparse terrain semantic records, including explicit same-coordinate conflict reporting, deletion semantics, input validation, and deterministic row-major output.
- Added focused tests for independent edits, identical edits, divergent edits, deletion-vs-edit, one-sided deletion, invalid bounds, and stable ordering.
- Added `MAP_EDITOR_TERRAIN_V2_CONFLICT_MERGE_CONTRACT.md` with caller preconditions and no-persist-on-conflict rules.
- Active v1 conflict-save/UI/RPC and production database remain unchanged. Tests/typecheck/build have not been executed; integration gate remains closed.

## 2026-10-10 — Terrain v2 recovery and conflict-save audit

- Added `MAP_EDITOR_TERRAIN_V2_RECOVERY_CONFLICT_SAVE_AUDIT.md` documenting the current v2 journal and the active v1 recovery/conflict-save limitations.
- Confirmed the active conflict-save controller merges and persists `MapDocument` only; it does not merge the separate v2 terrain semantics section. It must remain isolated from initialized v2 state until a semantics-aware conflict contract exists.
- Hardened v2 recovery reads to fail closed when local storage access throws, with a regression test for `read() === null` and `has() === false`.
- Tests were authored but not executed. No active UI, RPC, database/schema/data, or production runtime changes.

## 2026-10-10 — Terrain v2 recovery availability validation

- Fixed `MapV2CrashRecoveryJournal.has(mapId)` so it reports a valid, readable v2 recovery rather than mere existence of a storage key.
- Recovery envelope validation now rejects array-shaped envelopes and invalid timestamps before parsing the embedded snapshot.
- Added regression tests for malformed data and invalid timestamps, including the expectation that `has()` returns false.
- Tests were authored but not executed; typecheck/build remain unverified. No active editor integration or database/RPC/schema/data changes.

## 2026-10-10 — Terrain v2 recovery identity regression coverage

- Extended `map-crash-recovery-v2.test.ts` with adversarial entries: mismatched envelope map ID, mismatched embedded snapshot ID, and a v1 snapshot presented to the v2 recovery journal.
- Expected behavior is fail-closed: each invalid or legacy entry returns `null`; the v2 journal does not infer terrain semantics from v1 data.
- Tests were authored but not executed. No recovery implementation or active editor behavior was changed in this step.
- No database/RPC/schema/data or production runtime changes.

## 2026-10-10 — Terrain v2 history map-identity guard

- Audit found the lower-level `MapHistoryV2` helper accepted a commit whose document ID differed from the current map, unlike the newer `MapEditorStateHistory` helper. Such a commit could allow undo to cross map identity.
- Added a guard in `commitHistoryV2` and a regression test proving cross-map commits are rejected without mutating history; a new map must start a fresh history via `createHistoryV2`.
- Active roadmap phase: Terrain semantics v2 — editor-state and persistence integration gate.
- Tests were authored but not executed. No active UI, Save/Load, RPC, database/schema/data, or production runtime changes.

## 2026-10-10 — Terrain v2 pair-validation regression coverage

- Added tests confirming an interior playable map cannot be accepted as the exterior and a world-only save remains valid with `exterior: null`.
- Active roadmap phase: Terrain semantics v2 — editor-state and persistence integration gate.
- Tests were added but not executed; typecheck/build remain pending. No live UI or database/RPC/schema/data changes.

## 2026-10-10 — Terrain v2 editor-state integration contract

- Added `MAP_EDITOR_TERRAIN_V2_EDITOR_STATE_INTEGRATION_CONTRACT.md` defining atomic world/exterior adoption, authoritative world identity, strict map types, legacy semantics, history/recovery/conflict-save boundaries, and Save Slot/RPC migration gates.
- Active roadmap phase: Terrain semantics v2 — editor-state and persistence integration gate.
- Design/documentation only. No live editor wiring, tests, database/RPC/schema/data changes, or production runtime changes. Automated tests/typecheck/build remain unverified.

## 2026-10-10 — Terrain v2 snapshot adapter hardening

- Corrected the v2 test fixture to create a real 32×32 map instead of changing dimensions without resizing layer cells.
- Routed v2 and legacy snapshot parsing through the canonical `parseMapDocument` string parser; removed `as never` casts from this adapter boundary.
- Added a dedicated regression test for duplicate terrain-semantic coordinates.
- Verification remains pending: no test/typecheck execution is available from the current GitHub-only workflow, and the latest commit has no reported status checks. Do not treat these tests as passed until CI or a local run confirms them.
- Scope unchanged: opt-in adapter only; live Save/Load, recovery, Save Slot, UI, Supabase RPC/schema/data, and production runtime remain untouched.

# Vandrith Map Editor — Status Log

**Purpose:** Short operational timeline of Map Editor updates.

**Rules:** Every repository or Supabase update must add one status entry. Keep entries brief; detailed technical history belongs in `MAP_EDITOR_CHANGELOG.md`. Record the update date/time, short status, and what changed. The status log must be updated together with the detailed changelog for every project update. Roadmap changes must identify the active phase. Asset changes must state whether storage structure changed and whether binary transfer was verified.

| Date / Time | Status | Roadmap Phase | Update |
| 2026-10-10 | Opt-in terrain v2 snapshot adapter added | Terrain semantics v2 — persistence integration gate | Added `map-snapshot-v2.ts` with explicit v2 envelope, validation, strict requested-map identity, and v1 compatibility that returns `terrainSemantics: null` rather than inventing semantics. Added adapter regression tests. Adapter is not wired into live Save/Load; tests/typecheck not executed. No DB/RPC/runtime changes. Commits `b47bd30fb27182a38b7c83a4f6f6f781c8c77ac5`, `2e77221636566ab608e8d36a554ba7391b37b02d`. |
| 2026-10-10 | Atomic terrain v2 history model added | Terrain semantics v2 — persistence integration gate | Added separate combined-state undo/redo helper and regression tests. Existing v1 editor remains unchanged; tests/typecheck not executed. No DB/RPC/runtime changes. Commit `cb8704ffcdd84644d3d2a941016896c635cc3980`. |
| 2026-10-10 | Terrain persistence integration audit recorded | Terrain semantics v2 — persistence integration gate | Added deterministic v2 round-trip and requested-ID regression cases plus a persistence boundary audit. Tests/typecheck not executed; CI status unavailable. No database/RPC/runtime navigation changes. Commit `4c656edeb9a073f9d0c30ae7fcf8f1760e298036`. |
|---|---|---|---|
| 2026-10-02 | Phase 2D diagnostic implementation merged | Phase 2D — Debug & Diagnostic Views | Added Grid, Terrain ID, Water Depth, Collision/Passability, Layer Isolation, Object Bounds, Invalid-cell Highlight, Diagnostic Legend, and Read-only Debug Mode as projection-only editor overlays. No MapDocument persistence fields or Supabase schema/RPC changes. Focused tests/typecheck/build passed locally; browser click-level verification remains pending because the connected Codespace has no browser/Chromium runner. GitHub PRs #18–#24 merged through 0cd4f96e2c3af3f5e8df9231d5558c64f7da775a. |
| 2026-09-18 | Load Latest now bypasses runtime cache and reads newest durable version directly | Phase 0 — Foundation Audit | Browser verification shows Save working at version 7 while Load Latest still fails. Replaced the Load Latest path with a direct `map_versions` newest-row read for the audited authoritative World Map, strict requested-ID parsing, atomic state adoption, and slot refresh. No Supabase schema/data or asset binaries changed. Commit `5fa15f7897728ff6f727c5628bbad85a05ca00e0`. Vercel/browser verification pending. |
| 2026-09-18 | Serializer input and numeric validation boundaries aligned with persisted-object contract | Phase 0 — Foundation Audit | Extended `parseMapDocument()` to accept the canonical serialized object envelope in addition to string/MapDocument inputs. Added an explicit positive-integer validator for `width`, `height`, and `tileSize`, and removed the test-only `never` cast. Added malformed persisted numeric-field regression coverage. No Supabase schema/data or asset binaries changed. GitHub commits `7c847dad188d6aabf74e0016dac5aab1fb283e4c` and `02f1ed5e6e369379d1dd79ebe96c332a2c8275d3`. Vercel rebuild verification pending. |
| 2026-09-18 | Serializer numeric boundary repaired after Vercel TypeScript failure | Phase 0 — Foundation Audit | Replaced non-narrowing `Number.isInteger` checks with an explicit `requirePositiveInteger()` boundary for `width`, `height`, and `tileSize`. Added malformed persisted numeric-field regression coverage. No Supabase schema/data or asset binaries changed. GitHub commits `2b7b7c1a9d1172b5b67ea01c219e55e9e15cd56a` and `1847477176c44175656cd4e76bc6f18016e31c63`. Vercel rebuild verification pending. |
| 2026-09-18 | Vercel TypeScript build failure isolated and serializer narrowing repaired | Phase 0 — Foundation Audit | Vercel build of commit `a55c3a5` compiled successfully but failed TypeScript in `apps/map-editor/editor/map-serialization.ts` because validated `width`, `height`, and `tileSize` remained possibly undefined after validation. Updated the parser to narrow these fields into local constants before arithmetic/array validation. No Supabase schema/data or asset binaries changed. GitHub commit `e9ef30530c4ce480163dcfcfda9fe19375aad9bb`. Vercel rebuild verification pending. |
| 2026-09-18 | Persisted identity parser made explicit and traceable | Phase 0 — Foundation Audit | Updated `map-serialization.ts` so persisted identity validation uses explicit string/type checks and a parser marker instead of the previous truthiness-only guard. Added a regression fixture matching the audited authoritative World Map identity (`87ba34eb-5a75-42fa-8919-63e44b700c02`, `World Map`, `world`) to the serialization test suite. No Supabase schema/data or asset binaries changed. Code commits `7b2c4de6e2cfe9a20a0ca0c8aa4d52de649202e5` and `2585b29c64f0498b20bc437db3e0da101652cfba`. Vercel/browser verification pending. |
| 2026-09-17 | Vercel build error identified and corrected | Phase 0 — Foundation Audit | Vercel reached successful compilation but TypeScript failed because `SaveSlotsPanel` requires the `open` prop. Updated `map-editor-app-v4.tsx` to pass `open={showSlots}`. No Supabase, asset, or hierarchy changes. New code commit `9be81c372a7f584a015f9e9f0fa4945b1759b53f`. Vercel rebuild verification remains pending. |
| 2026-09-17 | Authoritative Save adoption guard repaired | Phase 0 — Foundation Audit | Updated `map-save-state.ts` so a stale World seed document cannot be published against a newly resolved authoritative World Map. When identities differ, Save adopts the validated authoritative World document; invalid/non-World connections are rejected. Added regression coverage for seed-vs-authoritative identity adoption and invalid authoritative identity. No Supabase schema/RPC or asset binary changes. GitHub commits `362f7f5bee53dc06f65bd12adca997add1e3e6f9` and `5fad1f2b5c14cf9e910fca4ead9c4ec05e206128`. Automated execution/browser verification remains pending. |
| 2026-09-17 | Pixi renderer lifecycle foundation repair | Phase 0 — Foundation Audit | Changed `PixiMapCanvas` to keep one Pixi `Application`/world container alive for the component lifetime and update the existing scene instead of recreating the canvas on every editor state change. Added async render cancellation and readiness gating. Automated build/test and browser/Vercel verification remain pending. |
| 2026-09-17 | Foundation grid repair applied | Phase 0 — Foundation Audit | Replaced the hardcoded 240-cell layer allocation with the canonical `createEmptyCells(width, height)` boundary, validating positive integer dimensions and allocating exactly `width × height`. Added executable regression coverage for grid allocation and serialization. No Supabase, asset, or hierarchy changes. |
| 2026-09-17 | Asset scope contract defined | Phase 0 — Foundation Audit | Defined explicit `world`, `region`, and `playable` asset scopes as a separate eligibility layer from approval. Proposed a dedicated many-to-many scope relation; no Supabase schema, scope assignments, or asset binaries changed. |
| 2026-09-17 | Hierarchy persistence contract defined | Phase 0 — Foundation Audit | Audited the canonical World → Region → Playable → Interior model against the live `public.maps` semantics. Chose a separate Map Editor identity/hierarchy mapping layer so legacy `world`, `exterior`, and `interior` meanings remain unchanged. No Supabase schema/RPC or production map rows changed. |
| 2026-09-17 | Phase 0 hierarchy/persistence caller audit completed | Phase 0 — Foundation Audit | Re-audited V4 against the post-F-006 database invariant. V4 now resolves persistence only against the explicit authoritative World Map and no longer chooses a World Map by `created_at`. `MapBrowser`/`map-manager.ts` currently create Region, Playable, and Interior documents only in memory; no child-map persistence path exists yet. Live `public.maps` supports `world`, `exterior`, and `interior` values and has no `parent_map_id`, while the canonical MapDocument model uses `world`, `region`, `playable` plus hierarchy fields. This is a contract/schema mismatch that must be resolved before child-map persistence is implemented. No Supabase rows/schema or asset binaries changed. |
| 2026-09-17 | F-006 duplicate World Map cleanup completed | Phase 0 — Foundation Audit | Audited all 108 `world` rows for `WORLD_ID` before deletion. The authoritative `87ba34eb-5a75-42fa-8919-63e44b700c02` was the only retained World Map. Duplicate rows had no map cells, objects, building placements, occupancy, connections, annotations, dungeon content, weather overrides, or environment policies; 115 duplicate map versions and 93 duplicate runtime snapshots contained no painted tiles/objects; 12 duplicate save-slot rows only referenced those duplicate versions. Supabase migration `cleanup_duplicate_world_bootstrap_maps` removed 107 duplicate World Map rows by cascade and created `maps_one_world_per_world_uidx` as a partial unique index on `(world_id) WHERE map_type = 'world'`. Post-audit: 1 World Map, 0 Region Maps, 0 Playable Maps for the world; authoritative map retains 4 versions, 1 runtime snapshot, 2 save slots. |
| 2026-09-17 | Authoritative World Map routing pinned | Phase 0 — Foundation Audit | V4 now resolves persistence only against the audited authoritative World Map `87ba34eb-5a75-42fa-8919-63e44b700c02` for `WORLD_ID`, with an optional `NEXT_PUBLIC_VANDRITH_WORLD_MAP_ID` override. Removed the fallback that selected the newest World Map by `created_at`. No database rows were deleted or asset binaries changed. |
| 2026-09-17 | Terrain approval boundary enforced | Phase 0 — Foundation Audit | Tightened `terrain-asset-binding-loader.ts` so every runtime terrain binding requires both `candidate_status = approved` and `asset_status = approved`; legacy `verified`/`active` statuses are no longer accepted. Added regression coverage for base candidates, missing approval, pending assets, and legacy statuses. |
| 2026-09-17 | V4 terrain approval bypass removed | Phase 0 — Foundation Audit | Removed the V4 bootstrap path that synthesized base terrain bindings directly from `asset_registry`. Terrain runtime bindings now come only through the audited `vandrith_asset_binding_workbench` approval boundary. No asset binary was activated or transferred. |
| 2026-09-17 | V4 Quick Save now reports projection outcome | Phase 0 — Foundation Audit | Updated `map-editor-app-v4.tsx` to preserve bootstrap projection metadata and distinguish authoritative save success from downstream projection failure/not-run in the visible status message. Existing authoritative commit contract and merge response tests remain unchanged. GitHub commit `d64c8f8dcc62e494ec7845bb9ad78e7f1158a417`. Browser/Vercel verification remains pending. |
| 2026-09-17 | Map merge projection result contract hardened | Phase 0 — Foundation Audit | Updated `map_editor_commit_merge_v1` consumption so the frontend preserves authoritative commit/version metadata separately from projection status. Added projection status/error to the merge persistence boundary and regression tests for committed, projection-failed, conflict, and missing-metadata responses. Supabase migration `separate_authoritative_commit_from_projection_failure` was verified in the live project. GitHub Actions run `35187622874` passed on the resulting test commit. |
| 2026-09-17 | Load Slot World Map guard applied | Phase 0 — Foundation Audit | Updated `map_editor_load_save_slot_v1` so a Save Slot can only be loaded for an owned `world` map. Existing Save Slot audit found 12 slots and 0 non-world slots. Snapshot identity validation remains enforced by the frontend parser. Supabase migration applied and function definition re-verified. |
| 2026-09-17 | Map navigation persistence boundary wired | Phase 0 — Foundation Audit | Wired V4 MapBrowser navigation through `resolveMapNavigationPersistence()` so switching maps clears stale persistence context while selecting the connected map preserves it. No Supabase schema/RPC or asset binary changes. |
| 2026-09-17 | Focused invariant tests corrected | Phase 0 — Foundation Audit | Replaced the remaining foundation-test placeholder with executable grid acceptance/rejection and requested-map identity assertions against the real parser boundary. No Supabase, deployment, or asset binary changes. Test execution is still not verified in this session. |
| 2026-09-17 | Focused Vitest CI verified | Phase 0 — Foundation Audit | Corrected the grid test so it reflects the actual MapDocument dimensions, added a GitHub Actions workflow for `apps/map-editor` Vitest execution, and verified workflow run `35181010280` completed successfully. No Supabase, deployment, or asset binary changes. |
| 2026-09-17 | Save state race guarded | Phase 0 — Foundation Audit | Changed `map-editor-app-v4.tsx` so `ensureConnection()` returns an explicit `{ mapId, document, version }` connection context and Quick Save uses the local document together with that resolved authoritative baseline/version instead of immediately reading React state scheduled by the same async operation. Added `map-save-state.ts` and executable regression tests covering local-document preservation and World Map identity rejection. No Supabase schema/RPC or asset binary changes. GitHub status currently shows the Vercel check pending; the new test workflow result is not yet exposed in the commit status response. |
| 2026-09-17 | Map navigation persistence boundary added | Phase 0 — Foundation Audit | Added `resolveMapNavigationPersistence()` to explicitly clear `connectedMapId`, `baseDocument`, and `version` when navigation selects a different map, while preserving the connection when the same map remains selected. Added regression coverage for stale-context disconnect and same-map preservation. This establishes the pure state-transition seam for wiring MapBrowser navigation into the V4 app. No Supabase schema/RPC or asset binary changes. Full UI wiring and test execution remain to be verified. |
| 2026-09-17 | Authoritative bootstrap conflict guarded | Phase 0 — Foundation Audit | Browser testing showed `Save failed: bootstrap: conflict` even though the authoritative World Map already has durable versions. V4 now refuses to enter bootstrap when a discovered authoritative version is greater than zero and reports the loadability stage instead. GitHub commit `73cf73278154f8237144054db893762e17715a48`. Supabase data remains unchanged; browser/Vercel verification of the correction is pending. |
| 2026-09-17 | Save adopts authoritative document on seed identity mismatch | Phase 0 — Foundation Audit | Quick Save now uses the validated authoritative document whenever the local bootstrap seed ID differs from the resolved connection ID, while preserving local edits when IDs match. GitHub commit `2fe13486d8c6f60ce5d2303228d98301a9d828f9`. No Supabase schema/RPC or asset binary changes. Automated test/Vercel/browser verification remains pending. |
| 2026-09-17 | Authoritative snapshot diagnostics added | Phase 0 — Foundation Audit | `map-persistence.ts` now preserves the exact runtime/durable parse or read failure stage and error message instead of returning only `snapshot-parse-or-read-failure`. V4 now includes that detail in the visible loadability error. Supabase data/schema unchanged. GitHub commits `9e5728f2ad9e1b341c821237142c0153ef3f68fb` and `98bdfe9f6523291021997332e9b176c2128d24be`. Browser/Vercel verification remains pending. |
| 2026-09-18 | Persisted snapshot identity diagnostic deepened | Phase 0 — Foundation Audit | `map-persistence.ts` now reports the requested map ID plus observed persisted `id`, `name`, `mapType`, envelope keys, and document keys when runtime/durable parsing fails. The strict parser remains unchanged and no persisted identity is synthesized. Live Supabase audit confirms the canonical runtime snapshot and durable version 4 both contain complete World Map identity. GitHub commit `2c37f023267216200fc21f993e34be2d0e3bcdb9`. Browser/Vercel verification remains pending. |
| 2026-09-18 | Persisted identity parser normalized for runtime object snapshots | Phase 0 — Foundation Audit | Replaced the v2 identity assertion with explicit local primitive reads and a normalized object before validating persisted identity. Added an object-shaped Supabase snapshot regression test in `map-foundation.test.ts`, alongside the authoritative World Map string-path test. No Supabase schema/data or asset binaries changed. GitHub commits `b2e89d5d2332c350795dc98808171660805f4b2c` and `ec40b5418537ff1306dc00f5143fe5861d6565ff`. Vercel/browser verification pending. |
| 2026-09-18 | Save rebase and Load Latest cache bypass implemented | Phase 0 — Foundation Audit | Browser screenshot shows the editor can auto-load and Load Slot 2 reaches version 3, but Quick Save and Load Latest still fail. Audit identified that Quick Save treated any remote-version difference as an immediate conflict, so a valid older Save Slot could never be rebased onto a newer authoritative version. Also, Load Latest reused the cached connection and could remain anchored to an older slot. Updated the save controller to commit conflict-free three-way merges against the remote version, and V4 Load Latest now forces a fresh authoritative snapshot read. Added regression coverage for conflict-free rebase and same-cell conflict. No Supabase schema/data or asset binaries changed. GitHub commits b0c6449fa5f7634310d0441957c3ebeff7bf00ff, f29ab9590a532b75628022a9508956bb6e115eaf, and 9d4b3d4ac1575e2575cc0dbbb7895d83188f371b. Vercel/browser verification pending. |
| 2026-09-18 | Governance catch-up recorded for serializer repair and temporary-file cleanup | Phase 0 — Foundation Audit | Recorded the previously unpaired serializer type-narrowing repair (6b5372ae262b9ee7e79477f1ff900369a6c475ae) and accidental temporary serializer file cleanup (932bc294c2c6615eb58b7878d18af6a8efecf97c) so the mandatory Change Log/Status Log history remains complete. No Supabase schema/data or asset binaries changed. |
| 2026-10-02 | Paint shape regression coverage expanded | Phase 2C — Terrain & Selection Suite | Added executable Rectangle and Flood Fill regression coverage to complement the existing Line tests. Desktop Commander verification passed: 11 test files, 43 tests. No production paint logic or persistence contract changed. |

| 2026-10-02 | Phase 2E Layer System foundation implemented | Phase 2E — Layer System | Layer Tree now supports active-layer selection, visibility toggle, lock/unlock, deterministic ordering, and per-layer opacity. Existing immutable layer-state helpers feed the EditorShell history/undo-redo path. Layer opacity is persisted in MapDocument and applied by the Pixi renderer. PR #25 and #26 merged to main. Browser click-level verification remains pending because Codespace has no agent-browser/Chromium runner. No Supabase schema/data/RPC changes. |

| 2026-10-02 | Duplicate and merge layer operations implemented | Phase 2E — Layer System | Added immutable Duplicate Layer and Merge Layer operations with collision-safe object IDs and same-kind merge guards. EditorShell exposes both operations through the existing history commit path. PR #28 merged to main. Browser click-level verification remains pending. No Supabase schema/data/RPC changes. |
\n| 2026-10-02 | Layer Groups implemented | Phase 2E — Layer System | Added group metadata, create/update/delete, layer assignment, group visibility/lock/expand controls, effective renderer visibility, and backward-compatible serialization normalization. PR #30 merged to main. Browser click-level verification remains pending. No Supabase schema/data/RPC changes. |\n

| 2026-10-02 | Layer Templates implemented | Phase 2E — Layer System | Added reusable layer templates, apply/delete operations, serialization normalization, and history-safe UI controls. PR #32 merged to main. Browser click-level verification remains pending. No Supabase schema/data/RPC changes. |


| 2026-10-10 | V2 snapshot serializer hardening and persistence-boundary audit | Terrain semantics v2 — opt-in persistence adapter | V2 serialization now runs the document through the canonical v1 parser before creating the v2 envelope; a regression test rejects invalid MapDocument dimensions/cell counts. Source audit confirms live `map-persistence.ts`, crash-recovery journal, and conflict-save flow still serialize/read v1 MapDocument only. V2 remains deliberately unwired; integrating it now would risk dropping terrain semantics on save/recovery/conflict merges. No production RPC, database schema/data, or asset binaries changed. Commit beaec3506f25fa6614bcc58459474559717bf84a and 0b023c5c8e68fcaa451bdaeebfd71c3ca0ddb09a. Test/typecheck/build execution and CI result are still pending; do not treat this adapter as production-ready. |


| 2026-10-10 | Opt-in v2 crash-recovery journal added | Terrain semantics v2 — recovery adapter | Added a separate Storage-compatible journal that persists the combined v2 document + terrain semantics, validates map identity and the v2 envelope on recovery, and safely returns null for malformed entries. Existing v1 journal and active recovery path are untouched. Commits dc34dc102352430b2df21566dbeb4bcf9678d601 and edd05efbd9605f7e254767bdc276a4fe00b1986b. Tests/typecheck/build and CI remain unverified; no production RPC/database changes. |

| 2026-10-10 | Combined v2 undo/redo regression coverage | Terrain semantics v2 — history adapter | Added tests for atomic document+terrain undo/redo, no-op boundaries, redo invalidation after a new commit, and combined history entries. Existing v1 editor history remains untouched. Commit 54e4148c55870a3407591ba68c21b15fe673349c. Source reviewed; test/typecheck/build execution and CI remain unverified. No production RPC/database changes. |


## 2026-10-10 — V2 history safety audit

- Bounded retained undo/redo entries to 100 per direction to prevent unbounded history growth.
- Added runtime validation for MapDocument invariants and terrain-semantic bounds before creating/committing v2 history states.
- Added regression cases for history cap, invalid dimensions, and out-of-bounds terrain cells.
- V2 history remains an isolated helper: no active editor UI/history, Save/Load, recovery, conflict-save, RPC, production database, or runtime water-navigation integration.
- Verification is source-level only; Vitest/typecheck/build still need CI or local execution.


## 2026-10-10 — Terrain v2 active-editor integration audit

- Audited `editor-shell.tsx`, v1 history, snapshot adapter, runtime persistence, v1/v2 recovery journals, conflict-save controller, and save-slot parsing.
- Confirmed active EditorShell history and callbacks still carry MapDocument only; v2 history/recovery are not wired into the active UI.
- Added `MAP_EDITOR_TERRAIN_V2_INTEGRATION_GATE.md` with the integration invariants and staged gates for state, UI lifecycle, recovery/conflict policy, and persistence.
- No active editor integration, production RPC/schema/data changes, or runtime navigation changes were made. Test/typecheck/build execution remains pending.


## 2026-10-10 — Terrain v2 Gate A state contract

- Added the opt-in `MapEditorState` discriminated union: legacy v1 state keeps `terrainSemantics: null`; initialized state carries validated semantics.
- Added explicit initialization, v1/v2 parsing, guarded v2 serialization, and document replacement rules. Switching map IDs clears semantics; same-map resize clips removed cells and invents no new semantic records.
- Added focused Vitest regression coverage for legacy/v2 parsing, initialization, invalid semantics, map identity changes, resize, and version/identity rejection.
- Documented the contract in `MAP_EDITOR_TERRAIN_V2_GATE_A_STATE_CONTRACT.md`.
- The adapter remains opt-in and is not wired into active EditorShell, Save/Load, recovery, conflict merge, Supabase RPC, production database, or runtime navigation. Tests/typecheck/build have not been executed in this workflow.


## 2026-10-10 — Terrain v2 combined state history

- Added an opt-in history adapter whose entries hold the complete legacy-or-initialized `MapEditorState`, so undo/redo restores document and semantics atomically.
- Added canonical state validation, 100-entry history bounds, redo invalidation, cross-map commit rejection, and explicit history reset for map switches.
- Added regression tests for atomic undo/redo, legacy state support, invalid state rejection, map-switch behavior, bounds, and resize semantics.
- Active `EditorShell` still uses the v1 document-only history; this adapter is not integrated into active UI, persistence, recovery, conflict-save, RPC, or runtime navigation. Test/typecheck/build execution remains pending.


## 2026-10-10 — Active editor terrain v2 integration audit

- Audited active EditorShell mutation/history paths and the current persistence, crash-recovery, save-slot, and conflict-save boundaries.
- Confirmed EditorShell callbacks and active history carry MapDocument only. Paint gesture continuation updates the v1 history present directly, so combined-state integration must preserve gesture coalescing atomically.
- Recorded blockers and required integration order in `MAP_EDITOR_TERRAIN_V2_ACTIVE_EDITOR_AUDIT.md`.
- No active UI, persistence, RPC/database, or runtime water-navigation code was changed. Source inspection only; tests, typecheck, and build remain unexecuted.


## 2026-10-10 — Game Save v2 contract proposal

- Follow-up audit confirmed `GameSaveSnapshot` and save-slot parsing are v1-only and store `MapDocument` for world/exterior; terrain semantics cannot survive that envelope.
- Added `MAP_EDITOR_TERRAIN_V2_GAME_SAVE_CONTRACT.md` specifying an opt-in versioned envelope, legacy compatibility, atomic validation, and migration gates.
- Contract only: no implementation, active save/load wiring, RPC, production database, or runtime changes. Tests/typecheck/build remain unexecuted.


## 2026-10-10 — Opt-in Game Save state v2 adapter

- Added `game-save-state-v2.ts` as a separate adapter; the existing v1 `game-save.ts` API is unchanged.
- The adapter supports legacy v1 envelopes without inferring terrain semantics, v2 envelopes containing legacy or initialized map snapshots, and atomic validation of world/exterior map types.
- Added focused tests for initialized round-trip, legacy compatibility, malformed semantics, unsupported versions, invalid map types, and incomplete/atomic rejection.
- The adapter remains opt-in: active Save/Load, save-slot callers, Supabase RPC, production database, recovery, conflict-save, and runtime navigation are unchanged. Tests/typecheck/build have not been executed in this workflow.


## 2026-10-10 — Active Save Slot consumer audit for terrain v2

- Traced the active `VendrithWorldBuilderApp` Save Slot callbacks. Save still calls the v1 `serializeGameSaveSnapshot`; Load still parses nested map documents through the v1 parser.
- Confirmed the new opt-in Game Save state v2 adapter is not integrated. A v2 envelope must not be sent to the v1 RPC until the payload contract is reviewed; current active editor state/history also cannot yet restore terrain semantics atomically.
- Documented the consumer path, exterior validation gap, and safe integration sequence in `MAP_EDITOR_TERRAIN_V2_ACTIVE_SAVE_SLOT_AUDIT.md`.
- Source inspection only. No active behavior, RPC, production database, or runtime navigation changes. Tests/typecheck/build remain unexecuted.


## 2026-10-10 — Save Slot RPC contract audit for terrain v2

- Reviewed the repository `main` migration source for `map_editor_save_slot_v1` / `map_editor_load_save_slot_v1` and compared it with the active frontend consumer.
- RPC validation covers authentication, owner scope, slot range, JSON object shape, and world version reference; it does not validate nested Game Save schema/map semantics or prove embedded snapshot equality with the referenced version.
- The migration source was not present at the same path on `feat/vendrith-ecc-v1` during this audit, so this is not evidence of the currently deployed SQL definition.
- Added `MAP_EDITOR_TERRAIN_V2_SAVE_SLOT_RPC_AUDIT.md`. No SQL/RPC invocation, migration, production database mutation, or active UI change. No tests/typecheck/build run.


## 2026-10-10 — Save Slot identity guard in opt-in adapter

- Added `parseGameSaveStateV2ForWorld` to enforce the caller-supplied authoritative world map ID after the entire envelope has parsed successfully.
- Added a focused unit test for matching ID, mismatched ID, and blank expected ID. The active Save Slot consumer remains unchanged and does not call this adapter.
- Added the Save Slot RPC source audit. No SQL, RPC, or production database changes. Automated tests/typecheck/build still not executed.

## 2026-10-10 — Save Slot RPC production preflight refresh

- Re-read the deployed `map_editor_save_slot_v1` and `map_editor_load_save_slot_v1` definitions using read-only SQL. Both remain `SECURITY DEFINER` with pinned `search_path = public, pg_temp`; `anon` has no EXECUTE privilege and `authenticated` retains EXECUTE.
- Confirmed the current Save RPC still validates the version tuple but does not validate Game Save schema/world/exterior semantics or compare the embedded World to the canonical version document. The current Load RPC returns the stored snapshot without validating its version reference or matching the embedded World to the canonical version document.
- Re-ran schema-aware integrity checks on the three live slots. Slots 1 and 2 are Game Save v1; slot 3 is the legacy map-document v1 World-only slot. All three have a matching map/version tuple, canonical map-document v1 version envelope, object-valued document, matching embedded World/version document, correct World ID/type, and matching map/slot creator.
- Read the Supabase security advisor output. It reports broad existing `rls_enabled_no_policy` informational findings; this is a project-wide baseline and was not changed as part of this Save Slot audit.
- All database queries were read-only. No Save Slot rows, RPC definitions, grants, or migration history were changed.
- Migration implementation and isolated RPC regression tests remain blocked on a repository workspace with Supabase CLI and a safe isolated database workflow. Do not bypass the CLI migration workflow, create a replacement branch, or apply a production migration before review and explicit approval.
