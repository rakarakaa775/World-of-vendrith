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
