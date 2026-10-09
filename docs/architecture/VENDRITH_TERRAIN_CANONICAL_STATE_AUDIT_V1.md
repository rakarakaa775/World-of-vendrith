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

## 12. B1 implementation — pure water projection API

Added `apps/map-editor/editor/water-projection.ts` and focused tests in `apps/map-editor/editor/water-projection.test.ts`.

The new `deriveWaterProjection(document, layerId)` API returns a separate row-major grid of `water | brackish | deepwater2 | deepwater | null`, tagged with algorithm version 1 and map/layer identity. It does not return a MapDocument and does not write into input cells. The no-land World Map deepwater floor is represented only in the projection. Distance rules currently retain the existing thresholds (shore 1, brackish 2, mid 4; eight-neighbor distance).

### B2 legacy snapshot policy — conservative, no silent migration

Schema-v1 water-band IDs cannot reliably reveal whether the author deliberately painted that ID or whether a previous gradient pass wrote it. Therefore:

- Do not auto-rewrite existing v1 snapshots during load, save, or recovery.
- Preserve legacy cell values exactly until a separately designed migration or user-reviewed normalization can identify intended semantics.
- The projection API can render from legacy input deterministically, but this is a compatibility bridge, not proof that the old snapshot has become canonical authored data.
- New canonical authoring semantics must use a single semantic water input (`water`) for water surface; the four band IDs are projection output, not intended authoring choices. Before enforcing this in UI, audit tile palette/brushes and add explicit compatibility behavior for existing projects.
- Never claim that original authored intent can be reconstructed from an old snapshot where that distinction was already lost.

### B1 status and verification boundary

- API and test source files were committed to `feat/vendrith-ecc-v1`.
- Tests cover input immutability, deterministic output, no-land World Map floor, layer validation, and row-major grid shape.
- Automated tests and TypeScript typecheck have **not** been run in this environment. The expected test output must be verified on the branch before claiming the test suite passes.
- Existing `applyWaterDepthGradient()` call sites still materialize bands into MapDocument. They have not been switched to the new API yet; this is intentionally deferred until editor consumers and legacy handling are traced and tested.

## 12. B1/B2 implementation contract draft

### Water projection API

Proposed module: `apps/map-editor/editor/water-projection.ts`.

- `WATER_PROJECTION_ALGORITHM_VERSION = 1` versions visual derivation independently of `MapDocument.version`.
- `WaterBandTerrain = 'water' | 'brackish' | 'deepwater2' | 'deepwater`.
- `WaterProjection` contains algorithm version, width, height, source layer ID, and a row-major read-only band array.
- `projectWaterDepth(document, layerId = 'ground')` is pure: it returns a projection or `null` for a missing/non-ground layer; it never mutates or returns a changed document. Malformed cell count is rejected explicitly.
- The current eight-neighbor BFS and distance thresholds remain 1 / 2 / 4 to preserve visual behavior. A World Map with no recognized land produces a derived all-`deepwater` projection without rewriting the canonical cells. Non-world maps with no land return `null` until their policy is separately specified.

### Schema-v1 compatibility policy

Existing schema-v1 saves do not record whether `water`, `brackish`, `deepwater2`, or `deepwater` was authored or produced by the old gradient. Therefore provenance cannot be reconstructed reliably.

The proposed explicit compatibility helper `normalizeLegacyWaterBands(document, layerId = 'ground')` collapses all four recognized water-band IDs to semantic `water`, returns a new document only when a cell changes, and never runs automatically on load until fixture review and rollout approval. The original saved version must remain recoverable through normal version history before any user-visible migration is enabled.

This is a lossy but explicit normalization: it preserves the semantic fact “this cell is water,” not a claim about original authored depth. `projectWaterDepth` then derives the visual bands from the normalized terrain and applies the no-land World Map floor as a projection.

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

This section records the implementation contract only. A direct GitHub file-write attempt for the new module was blocked by the tool's safety checks, so the new source/test files were **not created** and no implementation or test execution is claimed. Continue by applying the small module and tests through an available authorized repository-edit path, then run the focused Vitest suite before wiring the projection into terrain paint/rendering.

