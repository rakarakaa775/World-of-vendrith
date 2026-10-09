# Vendrith Terrain Canonical-State Boundary Audit v1

Status: **Confirmed editor-side contract gap; runtime mapping remains unverified.**
Target branch: `feat/vendrith-ecc-v1`
Related documents:
- `docs/architecture/VENDRITH_TERRAIN_DATA_SPEC_V1.md`
- `docs/architecture/VENDRITH_TERRAIN_RUNTIME_INTEGRATION_AUDIT_V1.md`
- `docs/map-editor/blueprint/WORLD_MAP_EDITOR_COMPLETION_BLUEPRINT.md`

## 1. Finding: water is derived, but materialized into persisted terrain cells

### Evidence

1. `apps/map-editor/editor/terrain-engine.ts` defines `applyWaterDepthGradient(document, layerId)`. It computes distance from land, then returns a new `MapDocument` whose ground-layer `cells[].tileId` values are rewritten among `water`, `brackish`, `deepwater2`, and `deepwater`.
2. `apps/map-editor/editor/terrain-paint.ts` calls `applyWaterDepthGradient(next, layerId)` after a logical terrain edit, then calculates affected terrain cells and render variants.
3. `apps/map-editor/components/vendrith-world-builder-app.tsx` also applies the gradient during normalization of older saved documents.
4. `apps/map-editor/editor/terrain-engine.test.ts` tests the deterministic output and exact depth-band tile IDs, including a 64×64 water body and the no-land World Map floor.
5. `docs/map-editor/blueprint/WORLD_MAP_EDITOR_COMPLETION_BLUEPRINT.md` states that water depth is derived and recomputed after load, while also explicitly describing writing derived terrain into the ground projection under the current contract.

### Interpretation

Water depth is **algorithmically derived**, but the current editor representation materializes that result into the ground cell `tileId` values. Since `MapDocument` is serialized and saved, the materialized depth bands can be persisted as part of the snapshot. Therefore the current model is not the same as a purely transient render-only water-depth cache.

This is not automatically a bug: materialization can be a deliberate compatibility strategy. It is, however, a contract boundary that must be explicit before future terrain features are added.

## 2. Decisions to preserve for now

Until the editor/runtime mapping and persistence contracts are verified:

- Keep `MapDocument.version = 1`; do not add required fields or change the meaning of existing `tileId` values.
- Preserve the existing deterministic gradient and the `deepwater` floor for a World Map with no land.
- Keep render masks, shoreline masks, approved asset selection, and Pixi/render output derived and rebuildable.
- Do not add a separate water-depth table or write to production runtime persistence from the editor.
- Do not reinterpret `water`, `brackish`, `deepwater2`, and `deepwater` as measured physical depths. They are current semantic/display bands driven by distance-to-land.

## 3. Questions that need explicit answers

1. Should saved `MapDocument` ground cells represent authored land/water surface only, with depth bands derived on load; or should the derived bands remain materialized for compatibility?
2. If bands remain materialized, how is authored water distinguished from engine-generated depth bands during future edits, import/export, and recovery?
3. Does production runtime consume these four tile IDs directly, or does an adapter transform them into another representation?
4. Must undo/redo record only authored input and rebuild bands, or preserve before/after materialized bands exactly?
5. What is the migration path if a future schema introduces explicit water-body IDs, elevation, or hydrology?

## 4. Safe next step

Before any code change, trace `terrain-paint.ts` through editor commands/history, save/load, and the production runtime adapter. Then add a mapping table showing which fields are authored, derived, materialized, and consumed by runtime. Any later change must include round-trip, undo/redo, deterministic rebuild, and legacy-save regression tests.

## 5. Scope and verification

- This is a source-level audit only.
- Existing terrain engine tests were inspected, not executed in this audit.
- Runtime `WorldDefinition`, adapter, mutation-batch and recovery source paths remain unconfirmed through the connected GitHub search interface.
- No application code, database schema, live data, or production runtime was changed.


## 6. Follow-up trace: history, serialization, and editor persistence

### History and undo/redo

Source: `apps/map-editor/editor/map-history.ts`.

- `MapHistory` stores full `MapDocument` objects in `past`, `present`, and `future`.
- `commitHistory` pushes the prior full document and clears redo history.
- `undoHistory` and `redoHistory` restore stored document snapshots; they do not replay semantic terrain commands or independently recalculate water bands.
- Therefore, when a terrain edit has already materialized water bands into `tileId`, undo/redo preserves the relevant before/after snapshot values exactly. This is snapshot semantics, not command/event semantics.

### Serialization and schema compatibility

Source: `apps/map-editor/editor/map-serialization.ts`.

- The serialized envelope is `{ schema: "vandrith.map-document", version: 1, document }`.
- The parser requires schema version 1 and document version 1, validates every layer's cell count against width × height, and validates each cell's `tileId` as a string or null.
- `serializeMapDocument` serializes the document as it currently exists; it does not strip or independently recompute materialized water bands.
- `cloneMapDocument` is a serialize/parse round trip, so the existing `tileId` representation is retained through cloning.
- Introducing first-class elevation, biome, hydrology, or chunk fields needs a deliberate schema/version and migration plan; the current parser does not define those as required canonical fields.

### Editor persistence

Source: `apps/map-editor/editor/map-persistence.ts`.

- `saveMapDocumentSnapshot` serializes the current document and sends it to RPC `map_editor_upsert_runtime_snapshot_v1`.
- `loadMapDocumentSnapshot` first tries RPC `map_editor_get_runtime_snapshot_v1`; if the snapshot is absent or fails parsing, it falls back to the newest `map_versions` snapshot.
- The persistence helper describes runtime snapshots as a fast editor cache and `map_versions` as durable authoritative history for the editor map document. This is specifically the map-editor persistence path and must not be conflated with production game-runtime mutation/checkpoint recovery.
- Both runtime and durable editor snapshots are parsed through the same MapDocument schema contract. The current materialized `tileId` water bands therefore remain part of the serialized snapshot representation.

### Updated data-boundary table

| Concern | Current confirmed behavior | Classification |
|---|---|---|
| Authored surface edit | `applyTerrainPaint` paints a `tileId` then runs the water gradient | Authored input plus deterministic transformation |
| Water depth bands | `water`, `brackish`, `deepwater2`, `deepwater` are chosen by 8-neighbor distance from non-water terrain | Derived, then materialized into cells |
| Undo/redo | Stores and restores complete MapDocument snapshots | Snapshot history |
| Serialization | Persists current cell values in schema v1 | Materialized representation persisted |
| Editor load fallback | Runtime snapshot RPC, then newest `map_versions` snapshot | Editor persistence/recovery |
| Terrain render variants | Neighbor masks, corner masks, asset bindings/fallbacks | Derived render projection |
| Production runtime mapping | Not confirmed by available source-search results in this audit | Unverified; do not infer absent code |

## 7. Verification status and next gate

- Confirmed by source inspection: terrain paint, full-document history, schema-v1 serialization/parser, and editor snapshot fallback path.
- Not executed here: automated tests, browser/editor interaction tests, or a live Supabase round trip.
- Production runtime source mapping remains unverified. Searches for `WorldDefinition`, `recoverWorldFromSupabase`, and `SupabaseRuntimeWorldAdapter` returned no indexed matches through the connected GitHub code-search interface. This is a search limitation, **not evidence that the symbols or implementation do not exist**.
- No application code, database schema, live data, or production runtime was changed.

Next gate: identify the exact production runtime adapter and its canonical world/map representation before deciding whether water bands should remain materialized, be rebuilt at load, or be moved to a derived cache. Then add tests for serialize/parse round trip, undo/redo exactness, deterministic gradient rebuild, legacy snapshots, and editor-to-runtime field mapping.


## 8. Contract conflict found in the existing World Map blueprint

Source: `docs/map-editor/blueprint/WORLD_MAP_EDITOR_COMPLETION_BLUEPRINT.md`, sections 1, 2, 5, and 6.

The blueprint establishes several intended invariants:

- Save should persist authoring state that is the source of truth.
- Water depth is derived; users do not manually author water depth.
- Rebuilding water after load must be deterministic.
- Transition/autotile rules must not mutate semantic terrain IDs merely to satisfy rendering.
- The water engine currently writes derived classifications into the ground projection.

The current implementation serializes the same ground-cell `tileId` values directly into MapDocument v1 snapshots. That means the implementation currently persists water classifications that the blueprint describes as derived. This is a **representation/contract ambiguity** rather than proof of a user-visible bug: the blueprint also explicitly permits derived water output to be written into the ground projection under the current contract.

### Decision required (do not change implementation yet)

Choose and document one of these models before adding elevation/biome/hydrology fields:

1. **Materialized semantic bands:** water-band IDs are treated as part of the saved terrain projection. Then document that they are derived-origin but persisted, and define when/how they are rebuilt and versioned.
2. **Canonical authored terrain plus derived water cache:** persisted cells retain authored semantic terrain; water distance/bands are rebuilt deterministically on load/edit and kept in a derived projection/cache. This requires a migration-compatible representation and tests, not an in-place silent reinterpretation of existing v1 saves.
3. **Split canonical and render projections:** keep authored terrain IDs in canonical MapDocument data and produce a distinct derived projection for water bands and autotile variants. Define the projection API and invalidation rules.

The current evidence supports option 2 or 3 as cleaner long-term architecture, but neither is approved or implemented here. Do not change the existing schema or saved values until compatibility with old maps and the production runtime boundary is proven.

## 9. Additional verified source boundary

- `apps/map-editor/editor/map-crash-recovery.ts` writes the full serialized MapDocument to a local-storage recovery journal keyed by map ID; reading validates the requested map identity and parses through the same schema-v1 parser.
- `apps/map-editor/components/editor-shell.tsx` uses `MapHistory` for the editor's document history and passes terrain edits through `applyTerrainPaint`. This confirms the editor-side command/history boundary, not production game-runtime integration.
- Several plausible runtime route/type paths were checked directly and returned 404, but these were only candidate paths. This is not proof that the production runtime is absent; repository-wide runtime path discovery is still needed.

## 10. Revised next gate

1. Resolve the semantic-versus-materialized water contract explicitly.
2. Locate the production runtime via repository structure, route imports, package exports, and call sites rather than guessed filenames alone.
3. Trace editor map identity and persistence into any runtime projection or adapter.
4. Add compatibility tests before altering existing save semantics.

## 11. Architecture decision — Option B selected

**Decision status: accepted as the target architecture; implementation is not yet changed.**

The project will use **canonical authored terrain plus a deterministic derived water cache/projection**.

### Target invariants

1. Canonical MapDocument cells represent authored semantic surface. Engine-derived water-distance bands must not be written back into canonical cell tileId values.
2. The Water Engine computes coastal/depth display bands from canonical terrain input and exposes them separately from MapDocument.
3. Terrain autotile masks, asset bindings, water bands, and render variants are derived projections. Rebuilding from the same canonical map and rules version must produce the same output.
4. Save, version history, local crash recovery, and editor persistence store canonical authored state, not a render cache.
5. One paint gesture remains one undo transaction. Undo/redo restores canonical authored state; derived projections are invalidated/recomputed from restored state.
6. Schema-v1 compatibility is mandatory. Existing snapshots may contain materialized water-band IDs; they must not be silently reinterpreted or discarded without a migration/normalization rule.
7. The existing World Map no-land behavior (deepwater floor) must remain visually equivalent after migration, but must be supplied by the derived projection rather than mutating canonical cells.
8. The projection/cache must not become a second authority or be written to production runtime persistence as canonical world mutations.

### Compatibility and implementation sequence

**B0 — Freeze semantics:** keep current code/schema unchanged while defining the target contract.

**B1 — Define projection API:** add a pure function/module accepting canonical terrain input and returning water-band values keyed by grid index (or equivalent immutable grid). It must not mutate its input or return a modified MapDocument. Use an explicit result type so canonical cells cannot be confused with display bands.

**B2 — Legacy snapshot normalization:** detect existing water-band IDs in schema-v1 snapshots and normalize them to authored surface semantics using a documented deterministic rule. Earlier gradient passes may have erased the distinction between authored and generated values, so do not claim perfect recovery where the saved data cannot prove original intent. Define a conservative compatibility policy and fixtures before enabling automatic conversion.

**B3 — Separate editor projections:** make terrain neighborhood/autotile rendering consume canonical terrain plus derived water projection, without persisting the projection into MapDocument. Update normalization in vendrith-world-builder-app.tsx only after compatibility tests pass.

**B4 — History and persistence tests:** prove paint, erase, undo/redo, serialize/parse, local crash recovery, and Supabase editor snapshot round trips preserve canonical authored cells; prove water projection rebuild is deterministic after each operation.

**B5 — Runtime boundary audit:** locate and trace the production runtime map/world adapter before changing runtime representation. Runtime integration must explicitly choose whether it derives its own projection from canonical terrain or consumes a read-only shared projection.

**B6 — Rollout gate:** only after legacy fixtures and runtime mapping are verified should the editor switch to the new projection API. This decision does not authorize a database migration or production runtime write.

### Acceptance tests required before switching the editor

- Pure derivation: input document remains structurally unchanged.
- Determinism: same canonical input and algorithm version yield identical water-band grids.
- Separation: paint/erase and normalization do not write derived water bands into canonical ground tileId values.
- Undo/redo: canonical snapshots are exact; derived projection is recomputed and matches expected output.
- Round trip: serialization, persistence fallback, and crash recovery preserve canonical values.
- Legacy compatibility: fixtures containing water, brackish, deepwater2, and deepwater follow an explicit migration policy; ambiguous cases are not silently guessed.
- Boundary behavior: no-land World Maps still display the deepwater floor; coastline and map-edge cases are deterministic.
- Runtime: adapter mapping and authority are documented and tested before production integration.

### Current status after decision

- Architecture choice B is approved by the project owner.
- Existing engine still materializes water bands in MapDocument; this is a known implementation gap, not yet fixed.
- Production runtime adapter remains unverified via available indexed code search.
- No application code, schema, database, or live data has been changed in this decision commit.

## 12. B1 implementation status — not yet implemented

The earlier text in this document incorrectly stated that `apps/map-editor/editor/water-projection.ts` and its tests had been committed. That statement was inaccurate and is superseded here: the repository-edit tool rejected the attempted source writes, and the files have not been verified in the branch. No B1 implementation, automated test run, or typecheck is claimed.

The intended B1 API and test contract remain proposals below. Existing `applyWaterDepthGradient()` call sites still materialize water bands into MapDocument and must not be described as migrated until code changes are committed and verified.

## 12. B1/B2 implementation contract draft

### Water projection API

Proposed module: `apps/map-editor/editor/water-projection.ts`.

- `WATER_PROJECTION_ALGORITHM_VERSION = 1` versions visual derivation independently of `MapDocument.version`.
- `WaterBandTerrain = 'water' | 'brackish' | 'deepwater2' | 'deepwater`.
- `WaterProjection` contains algorithm version, width, height, source layer ID, and a row-major read-only band array.
- `deriveWaterProjection(document, layerId)` is pure: it returns a projection or `null` for a missing/non-ground layer; it never mutates or returns a changed document. Malformed cell count is rejected explicitly.
- The current eight-neighbor BFS and distance thresholds remain 1 / 2 / 4 to preserve visual behavior. A World Map with no recognized land produces a derived all-`deepwater` projection without rewriting the canonical cells. Non-world maps with no land return `null` until their policy is separately specified.

### Schema-v1 compatibility policy

Existing schema-v1 saves do not record whether `water`, `brackish`, `deepwater2`, or `deepwater` was authored or produced by the old gradient. Therefore provenance cannot be reconstructed reliably.

The implemented explicit compatibility helper `normalizeLegacyWaterBands(document)` collapses recognized legacy water-band IDs to semantic `water`, returns a new document only when a cell changes, and is not automatically invoked on load. The original saved version must remain recoverable through normal version history before any user-visible migration is enabled.

This is a lossy but explicit normalization: it preserves the semantic fact “this cell is water,” not a claim about original authored depth. `deriveWaterProjection` derives visual bands from canonical terrain and applies the no-land World Map floor as a projection.

### Test contract for B1/B2

- Input document remains structurally identical after projection.
- Repeated calls return identical metadata and band arrays.
- Expected distance thresholds are verified on a small fixture, including diagonal neighbors.
- No-land World Map returns all `deepwater` bands without mutating saved cells.
- No-land non-world map returns `null` under the initial policy.
- Wrong ground cell count throws a clear error.
- Legacy normalization handles all four water IDs, is immutable, and is a no-op when no conversion is needed.
- No automatic load/save integration occurs as part of B1/B2.

### Execution status

Implementation has since been added on `feat/vendrith-ecc-v1`: `apps/map-editor/editor/water-projection.ts` and `water-projection.test.ts` implement the pure projection and explicit legacy normalization. Editor paint/erase no longer calls the materializing gradient; Pixi rendering uses a derived `renderDocument`; schema-v1 round-trip and undo/redo regression tests have been added. Automated tests and typecheck remain unexecuted in this workflow, so implementation is not yet considered validated.



## 13. Runtime integration trace — current evidence

A fresh GitHub code-search pass was made against `rakarakaa775/World-of-vendrith` while targeting `feat/vendrith-ecc-v1`.

### Verified editor persistence boundary

- `apps/map-editor/editor/map-persistence.ts` serializes the current `MapDocument` and sends the snapshot through `map_editor_upsert_runtime_snapshot_v1`.
- `apps/map-editor/editor/terrain-paint.ts` no longer invokes `applyWaterDepthGradient()` after paint or erase; canonical ground cells are retained.
- `apps/map-editor/editor/terrain-engine.ts` implements the gradient by returning a modified document with water-band IDs written into ground-cell `tileId` values.
- Search also found a call in `apps/map-editor/components/vendrith-world-builder-app.tsx` during saved-document normalization.

### Production runtime boundary remains unverified

Code search for `WorldDefinition`, `game-runtime`, `RuntimeWorldAdapter`, `SupabaseRuntimeWorldAdapter`, `recoverWorldFromSupabase`, and `append_world_runtime_mutation_batch_v1` returned no indexed matches. This does **not** prove those paths or symbols are absent: the connector search index may cover only the default branch or may not index these files. No production runtime route or adapter has therefore been verified from source in this pass.

### Gate before code integration

1. Obtain the repository tree or fetch exact runtime route/import files through an authorized source-reading path.
2. Trace the production route to the adapter and its canonical persistence contract; distinguish editor snapshots from runtime world state.
3. Review the implemented projection and tests, then run the focused Vitest tests and relevant typecheck. The editor call sites have been switched, but the change is not validated until these checks run.
5. Keep database migrations and production writes out of scope until a separately reviewed rollout plan exists.


## 14. Editor palette and legacy-band compatibility trace

A follow-up source search found additional constraints relevant to B2/B3:

- `apps/map-editor/editor/tile-palette.ts` includes `water`, `brackish`, `deepwater2`, and `deepwater` in its terrain type and asset definitions.
- `apps/map-editor/components/editor-shell.tsx` filters those four water terrain values out of the basic visible terrain list. This suggests the editor UI intentionally hides water-band options from the basic palette, but does not by itself prove no alternate picker or persisted document can contain them.
- `apps/map-editor/editor/terrain-brush-preview.ts` includes all four values in its terrain input mapping, so these values are recognized by brush-preview code.
- `apps/map-editor/editor/terrain-engine.test.ts` still tests the legacy materializing helper `applyWaterDepthGradient()` for compatibility. Those tests do not validate the new render-only projection path; retain them as legacy-helper coverage until the intended deprecation or compatibility policy is reviewed.

### Compatibility implication

Do not globally remove the four legacy band identifiers from `TerrainKey` or the tile resolver as part of B1. They may still be required to read old MapDocument snapshots and render assets. First introduce a distinct derived projection type, then migrate consumers explicitly. Palette visibility is not a data migration and does not establish the provenance of band IDs in old saves.

### Current verified status

- The pure projection source and focused tests are present on the target branch.
- Editor paint/erase and Pixi render/debug paths have been switched to separate canonical and derived state.
- Save/load and undo/redo regression tests are added but not executed in this workflow.
- The GitHub connector returned no PR-triggered workflow runs for the latest commits; this is not evidence that tests passed or failed.
- No database migration or production write has been performed.


## 15. Production runtime source trace — 2026-10-09

The runtime path was located by reading the target branch tree and fetching the source files directly; this supersedes the earlier statement that the production runtime source had not been verified.

### Verified runtime loading chain

1. `apps/map-editor/ai/application/supabase-runtime-world-adapter.ts` loads the map row and related clock, environment, navigation, NPC seed, and placement records from Supabase.
2. It constructs a `RuntimeWorldSnapshot` from runtime state and entities. The snapshot does not read the editor's `MapDocument` or ground-cell `tileId` values in this adapter.
3. Before returning the loaded snapshot, the adapter calls `recoverWorldFromSupabase(client, map.world_id, baseSnapshot)`.
4. `apps/map-editor/ai/application/runtime-recovery.ts` reads the latest checkpoint through `read_latest_world_runtime_checkpoint_v1` and subsequent mutation records through `read_world_runtime_mutations_v1`. It validates sequence continuity, state version, and hashes before returning the recovered runtime snapshot.
5. `apps/map-editor/ai/application/supabase-runtime-world-bridge.ts` wraps the recovered snapshot for runtime observation/actions and supports authoritative refresh by reloading through the adapter.
6. `apps/map-editor/app/api/vendrith-runtime-intents/route.ts` is an authenticated runtime-intent consumer endpoint. It authenticates a non-anonymous Supabase user and delegates an approved intent to `createSupabaseRuntimeIntentConsumer`; this route is not an editor-map render route.

### Terrain-specific conclusion and limits

- In the inspected adapter/recovery/bridge path, there is no visible import of `MapDocument`, `deriveWaterProjection`, or the legacy `applyWaterDepthGradient`. This path builds a runtime snapshot from world clock, environment, navigation and entity records rather than deriving the editor's water-depth bands.
- The terrain projection should therefore remain an editor/render projection and must not be inserted into runtime mutation or recovery records as part of this change.
- This source trace does not prove that no other production route or subsystem consumes map terrain. The repository contains additional API routes and database functions; any terrain-specific consumer must be traced separately before changing runtime semantics.
- The current recovery function restores stored runtime snapshots from checkpoint/mutation records; it is not a replay of editor `MapDocument` changes. Keep editor snapshot persistence and world-runtime recovery as separate contracts.
- No runtime adapter, runtime recovery behavior, database migration, or production data was changed in this trace.

### Validation gate

- Runtime source tracing: completed for the adapter → recovery → bridge chain and the runtime-intent API route listed above.
- Automated tests/typecheck: not executed in this workflow. Do not mark the terrain implementation validated until the focused water-projection, terrain-paint, serialization/history tests and relevant typecheck run successfully.
- Next safe step: inspect remaining consumers of terrain/map snapshots, then run focused tests in a repository execution environment before considering rollout.


## 16. Consumer audit and CI validation — 2026-10-09

### Additional consumers inspected

- `apps/map-editor/components/pixi-map-canvas.tsx` calls `deriveWaterProjection(document, "ground")` and constructs a temporary `renderDocument`; the source `document` is not rewritten by the projection call. Grid fallback, terrain resolution, debug overlay, texture collection, and layer drawing use the render document in the inspected code paths.
- `apps/map-editor/editor/terrain-resolver.ts` resolves masks and approved asset bindings from the document it receives. The Pixi render path supplies the projected render document, while authoring tools can continue to resolve canonical semantic terrain.
- `apps/map-editor/editor/terrain-brush-preview.ts` operates on a prospective copy made by `paintCell` and resolves the preview from that copy. It does not call `deriveWaterProjection`; previewing a water/land brush may therefore not display the final derived depth bands exactly as the canvas does. This is a visual consistency item to verify, not a reason to write derived bands into canonical state.
- `apps/map-editor/editor/map-persistence.ts` serializes the supplied document directly before the snapshot RPC; `map-serialization.ts` preserves its document payload and `map-history.ts` stores full-document snapshots. The inspected merge and identity persistence helpers likewise serialize or parse the supplied document without applying water projection.
- `apps/map-editor/tests/water-depth.test.ts` tests stable depth-band mapping and checks that the tested view operation does not mutate the map document. The dedicated projection tests remain the primary coverage for the projection algorithm.

### CI status

GitHub Actions reports the `Map Editor CI` run for commit `84fc4998b697b84fd861440519d32a96dd7a5cc0` as completed with conclusion `success`:
https://github.com/rakarakaa775/World-of-vendrith/actions/runs/37899215168

The workflow definition runs, in order, dependency installation, `npm run typecheck`, `npm run build`, and `npm test` in `apps/map-editor`. Therefore this run validates those steps for the referenced commit. The audit documentation update itself is a later commit and is not the tested source revision; rerun CI after any subsequent source-code change.

### Remaining risks / next safe actions

1. Compare the latest branch tip with the successful CI head SHA before treating the latest state as validated.
2. Decide whether brush preview should use the same derived projection as the canvas for accurate depth-band previews; if changed, preserve canonical state and add focused preview tests.
3. Check any database-side projection consumers separately. The editor RPC projects map snapshots into related map cells/navigation records; this audit did not modify or migrate those database functions.
4. No runtime source code, database schema, or production data was changed during this audit.


## 17. Brush preview alignment and latest CI — 2026-10-09

This section supersedes the brush-preview statements in Sections 14 and 16 where they describe the preview as not using the derived water projection.

### Implemented follow-up

- `apps/map-editor/editor/terrain-brush-preview.ts` now derives water bands on a temporary prospective document via `deriveWaterProjection`; it does not write those bands into the source/canonical MapDocument.
- The preview resolves terrain through `resolveTerrainRenderCell`, matching the Pixi canvas's render-time shoreline-mask and approved-binding policy rather than using only the semantic `resolveTerrainCell` path.
- `apps/map-editor/editor/terrain-paint.test.ts` includes a regression test that checks the preview shows projected shoreline bands around a prospective land paint while the original canonical ground cells remain `deepwater`.
- These changes preserve the separation between authored canonical cells and derived render projection. No runtime adapter, database schema, migration, or production data was changed.

### Latest validation

GitHub Actions run for commit `1324d7d023aab1056c2c53ca58b2db639cfc67fd` completed successfully:
https://github.com/rakarakaa775/World-of-vendrith/actions/runs/37917785905

The `Map Editor tests` job reports success for dependency installation, TypeScript typecheck, Next.js build, and Vitest. This is the latest verified CI run for the brush-preview resolver alignment.

### Remaining focused coverage

The terrain resolver tests already cover exact shoreline bindings and safe fallback to the verified base mask. A useful next regression is to assert the brush preview's reported mask/asset binding matches the render resolver for a shoreline fixture. Keep this as a test-only follow-up unless that test reveals an actual behavior mismatch. Do not expand this work into runtime persistence or database changes without a separate source trace and rollout review.


## 18. Brush-preview mask and asset-binding regression — 2026-10-09

A focused regression test was added to `apps/map-editor/editor/terrain-paint.test.ts` in commit `93c81bad7b673345a8c7532084c3520b626f6747`.

The test builds a World Map shoreline fixture, paints a prospective grass cell, derives a temporary water projection, and compares the brush preview's center-cell mask, resolved asset ID, tile ID, and binding status with `resolveTerrainRenderCell` applied to the equivalent render-only document. It also asserts the authored base document remains canonical deepwater and the prospective painted ground cell remains grass.

This is a test-only follow-up; no runtime, persistence, database, or production data behavior was changed. The commit has been pushed to `feat/vendrith-ecc-v1`. CI for this exact commit still needs to be checked before recording the regression as passing.


## 19. Database projection consumer audit — 2026-10-09

### Source inspected

- `apps/map-editor/editor/map-persistence.ts` serializes the supplied `MapDocument` directly for `map_editor_upsert_runtime_snapshot_v1`; it does not call `deriveWaterProjection`.
- `apps/map-editor/editor/map-merge-persistence-supabase.ts` passes the serialized snapshot to `map_editor_commit_merge_v1`; it does not add render-only water bands.
- `apps/map-editor/editor/map-serialization.ts` serializes the document payload unchanged under schema/version 1.
- The database migration `20260912033000_map_editor_project_snapshot_to_map_cells_v1.sql` was inspected on the repository's default branch. Its `map_editor_reconcile_after_merge_v1` function reads the ground layer's `cells[].tileId` from `p_snapshot` and projects each non-null value directly to both `map_cells.biome` and `map_cells.terrain_variant`. It then rebuilds navigation and updates the runtime snapshot.

### Finding and boundary

The database projection currently mirrors canonical ground tile IDs; it does not calculate the editor's render-only water-depth bands. Therefore a World Map's derived shoreline/depth display should not be assumed to exist in `map_cells` merely because it appears in the Pixi canvas.

This is not, by itself, proof of a production bug: the editor's water bands are presently documented as distance-to-land display semantics, and `map_cells` is a gameplay-oriented projection. Whether gameplay needs those bands is a product/runtime contract question. Do not change the SQL function, migration history, canonical snapshot, or live database as part of this audit.

### Branch visibility limitation

The migration file was found through the default-branch code index but returned 404 when requested at `feat/vendrith-ecc-v1`. Consequently, this audit records the default-branch migration's behavior as a reference, not as proof that the same migration file is present in the target branch or currently deployed in the connected Supabase project. Confirm branch migration inventory and deployed function definition before any change.

### Safe next gate

1. Decide whether `map_cells` should contain authored canonical terrain only, or a separately defined gameplay water-depth projection.
2. If gameplay requires derived water bands, design a deterministic server-side projection contract with explicit map-type behavior and tests; do not persist render-only values back into `MapDocument`.
3. Verify migration presence and deployed RPC definition in the intended environment before proposing implementation.
4. Keep runtime snapshots and editor snapshots as separate contracts; no runtime/database changes were made during this audit.


## 20. Target-branch migration inventory check — 2026-10-09

### What was verified on `feat/vendrith-ecc-v1`

- The GitHub Contents API listing for `supabase/migrations` on this exact branch returned one file: `20261003170000_remote_schema_baseline_reconstructed.sql`.
- The separately named migration `20260912033000_map_editor_project_snapshot_to_map_cells_v1.sql` is **not present as a standalone migration in the target branch directory listing**. The earlier direct path request also returned 404 on this branch.
- The default branch's indexed copy of that standalone migration contains `map_editor_reconcile_after_merge_v1`, which copies ground `tileId` values into `map_cells.biome` and `map_cells.terrain_variant`; that remains reference evidence only, not proof of the target branch or deployed database definition.
- The reconstructed baseline is approximately 1.07 MB. The connected GitHub fetch path rejected reading the whole file because it was too large, so this audit has **not** independently extracted the reconciliation function definition from that baseline.
- The latest visible branch commit at this check is `260131edf91b1ad585819c8b506158742bafd131`; this confirms the audit note is committed to the target branch, not that a migration has been applied to Supabase.

### Interpretation

The standalone migration's absence from the branch listing does not establish that the function is absent from the baseline, absent from the live database, or broken in production. A reconstructed schema baseline may contain the function definition. The exact SQL definition and migration/deployment history must be verified before proposing a corrective migration.

### Safe next gate

1. Read the relevant function definition from the reconstructed baseline using a range-capable source path or local repository checkout.
2. If a connected Supabase project is available, inspect the deployed `pg_proc` definition and migration history read-only; compare the deployed function with the branch baseline.
3. Only after comparison, decide whether to restore a missing standalone migration, update the baseline, or make no change. Do not create a speculative migration or apply database changes before this comparison.
4. No SQL, migration, application code, or live database was changed in this follow-up.


## 21. Live Supabase function + CI confirmation — 2026-10-09

### Read-only database inspection

The connected Supabase project `The world Vendrith` (ref `ojtmfokjcirvjvhnbnos`) reported status `ACTIVE_HEALTHY`. The remote migration history contains version `20260912083151`, named `map_editor_project_snapshot_to_map_cells_v1`, even though the current target branch's `supabase/migrations` directory listing exposes only `20261003170000_remote_schema_baseline_reconstructed.sql`.

Read-only inspection of `pg_proc` confirmed these live functions:
- `public.map_editor_commit_merge_v1(uuid, integer, jsonb, text)`
- `public.map_editor_reconcile_after_merge_v1(uuid, uuid, jsonb)`
- `public.map_editor_upsert_runtime_snapshot_v1(uuid, jsonb, uuid)`

The live `map_editor_reconcile_after_merge_v1` definition reads the first ground layer's `cells`, copies non-empty `tileId` values into `map_cells.biome` and `map_cells.terrain_variant`, and rebuilds geometry/navigation/runtime snapshot projections. It does not calculate water-depth bands. The merge function stores the authoritative version snapshot, invokes reconciliation, and reports projection failure separately from commit status.

### CI confirmation

GitHub Actions shows Map Editor CI run `37919433844` completed with conclusion `success` for code SHA `93c81bad7b673345a8c7532084c3520b626f6747`:
https://github.com/rakarakaa775/World-of-vendrith/actions/runs/37919433844

That run's code SHA predates the later documentation-only commits; it is evidence for the brush-preview regression-test commit, not a CI run specifically on the newest documentation commit.

### Conclusion and remaining boundary

The live database has the migration recorded and the expected projection function installed. The target branch's standalone migration file is missing from its directory listing, so repository migration reproducibility/drift remains a documentation and repository-history issue. It does not by itself prove the deployed database is broken.

The baseline SQL was too large for the connected GitHub file fetch to return, so a byte-for-byte/source comparison between that baseline and the live function remains incomplete. No database changes, migrations, or application code changes were made during this verification.


## 22. Reconstructed baseline function inspection — 2026-10-09

The large baseline migration was successfully retrieved through its Git blob (blob SHA `8a5e296840638929dcb5cc6aa722ab3fa5fb2d99`) and inspected around the relevant function definitions. It contains definitions for:
- `public.map_editor_upsert_runtime_snapshot_v1` (baseline line 6547)
- `public.map_editor_reconcile_after_merge_v1` (baseline line 6587)
- `public.map_editor_commit_merge_v1` (baseline line 6667)

The inspected baseline definitions follow the same key behavior as the read-only live Supabase definitions: the reconciliation function projects non-empty ground `tileId` values into `map_cells.biome` and `map_cells.terrain_variant`, rebuilds geometry/navigation and writes the runtime snapshot; the merge function validates schema/document dimensions, checks the expected version, stores the snapshot, then invokes reconciliation and returns a separate projection status.

This resolves the earlier uncertainty about whether the target branch's reconstructed baseline contains these function definitions. It does **not** resolve repository migration-history drift: the remote migration history lists the standalone migration version, while the target branch's migration directory currently contains only the reconstructed baseline. No DDL, data, migrations, or application code were changed.


## 23. Gameplay water semantics and migration reproducibility — 2026-10-09

### Runtime consumer search

- The target-branch `apps/map-editor/ai/application/supabase-runtime-world-adapter.ts` loads map identity/type/dimensions plus simulation clock, environment, navigation and entity-placement records. Its map query does not select `map_cells.biome` or `map_cells.terrain_variant`; this adapter therefore does not directly translate terrain IDs into runtime snapshot terrain semantics.
- Repository code search for direct Supabase client reads of `map_cells` and for `terrain_variant` found no additional application consumer in the indexed results. The search index is not a complete proof that no consumer exists, so this remains a bounded source audit rather than a global absence claim.
- The projection migration's own comment defines `map_cells` as a relational gameplay projection, but its implementation writes each canonical ground `tileId` unchanged into both `biome` and `terrain_variant`, with `collision=false` and `walkable=true`. That mapping is generic projection behavior, not an explicit water gameplay policy.
- The terrain resolver treats `water`, `brackish`, `deepwater2`, and `deepwater` as one compatible water family for render/transition resolution. The water projection algorithm derives these bands by distance from land; it does not measure physical depth, salinity, current, or navigability.
- Asset documentation separately proposes a richer water taxonomy (`water_state` plus `water_feature`, such as river/lake/shoreline). That taxonomy is not equivalent to the current four display-band IDs and should not be silently collapsed into them.

### Decision

For now, `water`, `brackish`, `deepwater2`, and `deepwater` are **editor/render semantic bands derived from distance to land**, not verified gameplay properties. No evidence in the inspected runtime adapter establishes that runtime movement, swimming, boating, damage, or ecology consumes these strings as gameplay rules.

Therefore:
1. Keep water-depth projection render-only and deterministic in the editor.
2. Do not infer collision, walkability, physical depth, or travel rules from the four display-band IDs.
3. If gameplay needs water behavior, introduce an explicit server/gameplay contract (for example `water_state`, `water_feature`, navigability and movement policy) and map it to runtime systems deliberately.
4. Do not change the deployed RPC, map schema, or migration history merely to make the visual bands appear in `map_cells`; first define and test the gameplay semantics.

### Migration reproducibility finding

The target branch contains a reconstructed baseline that includes definitions for the snapshot projection and merge functions, while the connected database migration history still records the earlier standalone projection migration version. This is consistent with a reconstructed/current schema baseline coexisting with historical remote migration records; it does not alone indicate that the live database is missing the function. A byte-for-byte comparison between the entire baseline function source and the deployed definition has not been established, so do not claim exact equivalence.

### Verification boundary

- Read-only source inspection and indexed repository search only.
- No SQL, migration, app code, or production data changed.
- No new automated tests were run during this audit.
- Next implementation gate: decide the gameplay water-state contract with movement/navigation requirements, then add focused tests for editor projection and any separate gameplay mapping before modifying persistence.


## 24. Initial water traversal policy implementation — 2026-10-09

### Changes committed on `feat/vendrith-ecc-v1`

- Added `apps/map-editor/editor/water-traversal-policy.ts`, a pure policy function returning `walk | swim | water_transport | blocked` from explicit cell semantics and actor capabilities.
- Added `apps/map-editor/editor/water-traversal-policy.test.ts` with focused Vitest coverage for land, explicitly walkable shallow shoreline, swim capability, deep-sea transport, river bridge/crossing point, shallow ford, current safety, and unknown water data.
- The helper does not infer gameplay rules from render-band IDs and does not touch editor documents, Supabase, migrations, or production data.

### Important enforcement boundary

The source audit has not yet found/confirmed a single authoritative player/NPC movement consumer where this helper can be integrated safely. Therefore this commit establishes the tested policy primitive but does **not** claim that live movement/pathfinding enforces the policy yet. The next code step must trace the authoritative caller and adapt real runtime cell semantics without deriving physical depth or current from `water`, `brackish`, `deepwater2`, or `deepwater` visual bands.

### Verification status

- Unit-test source added; execution result is **pending** because no local test runner is available through the GitHub file-editing connection in this session.
- CI must be checked for the resulting commit before claiming tests passed.
- No production database query that mutates state, DDL, migration, or schema change was performed.


## 25. Follow-up audit: traversal policy and runtime enforcement boundary — 2026-10-09

### Existing implementation confirmed

- `apps/map-editor/editor/water-traversal-policy.ts` defines a pure decision helper: `walk | swim | water_transport | blocked`.
- `apps/map-editor/editor/water-traversal-policy.test.ts` covers land, explicitly designated shallow shoreline, swimming capability, deep-sea transport, bridges/crossing points, shallow river fords, river current, and unknown water semantics.
- The helper consumes explicit semantic inputs (`feature`, `depth`, `current`, `shallowWalkable`, `bridge`, `crossingPoint`) and does not infer gameplay semantics from the visual IDs `water`, `brackish`, `deepwater2`, or `deepwater`.
- The latest visible Map Editor CI run for the fail-closed traversal test commit completed successfully: run `37923703715`, commit `a9ce0fcbd4c4f7ef85701b7a6fa99dadabf66693`. This confirms that commit's workflow, not necessarily the current branch tip or any future runtime integration.

### Current product decisions mapped to policy

| Product rule | Current pure helper behavior | Status |
|---|---|---|
| Walk on beach and explicitly designated shallow water | `shoreline + shallow + shallowWalkable=true` returns `walk` | Unit-tested |
| Swimming requires capability/attribute | Non-deep water requires `canSwim=true`; unknown depth fails closed | Unit-tested |
| Deep ocean/sea requires water transport | Deep `ocean_sea` requires `hasWaterTransport=true`, including when the actor can swim | Unit-tested |
| River crossing depends on depth/current/bridge/crossing point | Bridge/crossing point permits crossing; otherwise current must be known and safe and depth/capability must qualify | Unit-tested |

### Integration audit finding

A bounded GitHub code search for navigation/pathfinding and water-policy call sites did not establish an authoritative production player/NPC movement function that consumes this helper. The known database snapshot projection still copies ground `tileId` values into `map_cells.biome` and `map_cells.terrain_variant`, and initializes `walkable=true`; that generic projection is not a safe integration point for the new policy.

This is not proof that no movement implementation exists. It means the integration target and authoritative semantic source remain unverified. Wiring the helper to editor render bands or the generic `map_cells.walkable` projection would silently invent gameplay behavior and is therefore explicitly out of scope for this step.

### Next safe implementation gate

1. Locate the real player/NPC movement and path-planning entry points by tracing runtime routes, imports, and call sites rather than guessed filenames alone.
2. Identify the authoritative runtime cell representation and where explicit water feature/depth/current/bridge/crossing data can originate.
3. Add an adapter only after that source is verified; it must fail closed on missing semantics and must not derive physical depth/current from visual bands.
4. Add integration tests proving shoreline, swimming capability, deep-sea transport, river crossings, and unknown data at the actual movement boundary.
5. Keep schema-v1 editor snapshots and production Supabase unchanged until the semantic source, migration/recovery behavior, and integration tests are reviewed.

### Safety and verification

- No new runtime movement integration was made because its authoritative call site has not been verified.
- No production database, schema, RPC, migration, or data was changed.
- Existing unit tests are present; CI success is confirmed only for the cited commit above. No claim is made that the current branch tip has completed CI.


## 26. Runtime navigation call site found; water semantics source still missing — 2026-10-09

This section supersedes the earlier bounded-search statement that the authoritative movement caller had not been located.

### Verified runtime path

- `apps/map-editor/ai/application/npc-navigation.ts` builds an A* path using `NavigationGrid.blocked`.
- `apps/map-editor/ai/application/npc-movement.ts` validates each requested next step against bounds, adjacency, and `grid.blocked`.
- `apps/map-editor/ai/application/runtime-world-adapter.ts` is the action execution boundary: it loads the entity's grid and calls `executeNpcMovementStep` before updating the entity position.
- `apps/map-editor/ai/application/supabase-runtime-world-adapter.ts` constructs the grid from `vandrith_map_navigation_grid` rows containing only `x`, `y`, `walkable`, and `collision`. It computes `blocked = collision || !walkable`; missing rows default to blocked.

### Why water policy is not yet wired

The verified runtime grid currently carries only a boolean blocked flag. The Supabase adapter does not load a verified `water_feature`, authored depth, current, shallow-walkable marker, bridge/crossing-point marker, or actor swimming/transport capability contract. The NPC seed-derived entity state currently includes identity/profile/environment-policy fields, but no validated water-movement capability contract.

Consequently, blindly calling `resolveWaterTraversal` from `npc-navigation.ts` or `npc-movement.ts` would require inventing semantic data or incorrectly deriving it from the visual water-band IDs. Neither is acceptable. The runtime execution boundary is now known, but the authoritative water-semantics source is still missing.

### Minimal next implementation plan

1. Define a versioned runtime water-cell contract and actor movement-capability contract, including provenance and validation rules.
2. Decide where authored water feature/depth/current/bridge/crossing data belongs. Do not treat existing `map_cells.biome`, `terrain_variant`, `walkable`, or `collision` values as sufficient evidence of water semantics.
3. Implement a pure adapter from validated runtime cell semantics to `resolveWaterTraversal`, then integrate its result into both path planning and per-step execution so a forged/stale path cannot bypass the rule.
4. Add tests for planning and execution: beach/shallow access, swimming capability, deep-sea transport, river bridge/ford/current, unknown semantic data, and consistency between path planning and movement validation.
5. Audit server authority and migration/recovery behavior before any production persistence change. No production database or migration is authorized by this audit.

### Verification boundary

This was a read-only source inspection. No runtime code or tests were changed in this follow-up. The last confirmed green Map Editor CI run for the fail-closed policy tests remains run `37923703715` on commit `a9ce0fcbd4c4f7ef85701b7a6fa99dadabf66693`; it is not evidence for the current documentation commit or for runtime integration.
