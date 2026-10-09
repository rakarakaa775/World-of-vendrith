# Vendrith Terrain Data Specification v1

Status: **Design contract / proposal** — not yet an implementation claim.
Target branch: `feat/vendrith-ecc-v1`
Scope: canonical map-editor terrain data and a future-compatible path toward richer terrain simulation.

## 1. Goals

- Define a stable logical terrain contract before adding new terrain simulation fields.
- Preserve the existing `MapDocument` as the editor source of truth.
- Keep current tile-based World Map behavior working, including the `deepwater` base terrain and paint/commit/undo/redo/save/load pipeline.
- Separate canonical authored data from rebuildable render, collision, navigation, and preview caches.
- Make future elevation, biome, hydrology, and 2.5D features additive and migratable rather than silently changing current document semantics.

## 2. Existing contract (verified in current branch)

The current `apps/map-editor/editor/map-document.ts` defines:
- `MapType = 'world' | 'region' | 'playable'`
- `MapDocument.version = 1`, stable document `id`, `parentMapId`, dimensions, `tileSize`, layers, layer groups/templates, and optional playable-space fields.
- `TileCell = { tileId: string | null }`; layer cells are a row-major array whose length must equal `width * height`.
- Default World Map dimensions are 128×128, default tile size is 32, and supported map sizes are 32, 64, and 128.
- World Map ground initializes to `deepwater`; erase behavior restores that base terrain rather than null.
- The terrain engine currently uses canonical terrain keys including grass, sand, dirt, pavement, water, brackish, deepwater2, and deepwater, plus other surface types. Water depth bands are currently derived from water terrain keys.
- Terrain painting must mutate the document and pass through commit/history, not only draw directly to the renderer.

This spec does not rename or replace those fields.

## 3. Core design principles

1. **Canonical source of truth:** the validated `MapDocument` and its persisted authored mutations remain authoritative for the existing editor.
2. **Derived data is disposable:** renderer geometry, texture caches, normals, nav graphs, and previews can be rebuilt from canonical data and must not become the only copy of authored terrain.
3. **Backward compatibility:** existing version-1 documents must continue to parse and render. Do not add required fields to v1 without a migration.
4. **Determinism:** procedural output is reproducible for the same seed, generator version, configuration, and canonical input.
5. **Explicit units:** world coordinates, grid coordinates, pixel/tile size, and future elevation units must not be conflated.
6. **Chunk boundaries are contracts:** adjacent chunks must agree on shared edges and shared hydrology dependencies.
7. **Validate before commit:** invalid edits must be rejected or rolled back without leaving document/history/persistence partially updated.
8. **License governance:** terrain assets and generated/source assets must preserve license and attribution metadata where applicable.

## 4. Hierarchy

Logical hierarchy for future world-scale terrain:

- **World / MapDocument:** identity, map type, dimensions, tile size, parent relationship, document schema version.
- **Region:** a logical area or child map associated with a world map; stores regional design context and optional biome/climate rules when implemented.
- **Chunk:** an execution and streaming partition, not automatically a new persistence authority. Chunk dimensions must be configurable and versioned; do not hard-code a chunk size until performance profiling and renderer constraints justify it.
- **Cell / Tile:** current row-major cell address `index = y * width + x`; current persisted surface identity is `tileId`.
- **Derived caches:** visual variants, texture cache, height/slope products, collision and navigation indexes. These must be rebuildable and keyed by canonical document version/hash plus relevant algorithm version.

Do not introduce a new Region persistence model or replace `parentMapId` until it has been reconciled with existing map hierarchy and runtime contracts.

## 5. Coordinate and unit contract

- Grid coordinates are integer `x, y`, with origin at the top-left of the map.
- Rows are indexed by `y`; columns by `x`.
- Cell array index is `y * width + x`.
- `tileSize` is the current display/world scaling input; it is not a terrain elevation unit.
- Any future elevation layer must declare its own vertical unit and scale in its schema/config. No implicit conversion from pixels to elevation is allowed.
- Bounds are half-open for iteration: `0 <= x < width`, `0 <= y < height`.
- Out-of-bounds reads return no cell / null; writes must be rejected.
- A chunk implementation must document origin, width, height, ownership of boundary samples, and neighbor sampling policy before use.

## 6. Canonical versus derived fields

### Canonical now
- Document identity, type, parent identity, dimensions, tile size, layer metadata.
- Ground layer cell `tileId` values and object/layer data.
- Current terrain keys and compatibility mappings maintained by `terrain-engine.ts`.

### Proposed future canonical data (requires schema design and migration)
- Authored elevation samples or height values.
- Explicit biome assignment only if users can author/override it; otherwise it may be generated data.
- Explicit water-body identity or authored water level where the design requires it.
- User-authored terrain modifiers and generator configuration/version.
- Asset source/license metadata where terrain references external assets.

### Derived / rebuildable
- Auto-tile masks and selected visual variants.
- Render meshes, Pixi Graphics, texture caches and preview thumbnails.
- Slope/normal products if computed from elevation.
- Pathfinding graph, collision acceleration structures, and AI traversal caches.
- Procedural detail that is fully reproducible from a canonical seed and version.

A derived field may be cached on disk for performance only if it can be invalidated and rebuilt safely.

## 7. Cell surface contract (logical model)

The current persisted type remains `TileCell = { tileId: string | null }` in schema v1.

Conceptual future cell projection, **not yet a TypeScript type to add directly**:

```ts
type TerrainCellProjection = {
  x: number;
  y: number;
  surfaceId: string | null;     // maps from current tileId until migration
  elevation?: number;            // explicit vertical unit required
  biomeId?: string | null;
  waterBodyId?: string | null;
  traversal?: {
    walkable?: boolean;
    swimmable?: boolean;
    climbable?: boolean;
    movementCost?: number;
  };
};
```

Rules:
- Do not persist redundant fields such as `slope` if it can be derived reliably from authoritative elevation and the chosen algorithm.
- Do not persist collision/navigation flags as truth if they are generated from authored layer data and can be rebuilt; preserve manual overrides separately if the game design needs them.
- Unknown terrain IDs must fail validation or use an explicit safe fallback; never silently reinterpret a label as a stable ID.
- Material IDs and asset IDs are separate concepts. A logical surface can render with a fallback color when an approved texture is unavailable.

## 8. Water and biome contract

- Existing World Map water bands (`water`, `brackish`, `deepwater2`, `deepwater`) are current logical terrain conventions; do not assume they are physically accurate depth measurements.
- The current water-depth gradient is a derived distance-to-land visual classification. It is not a hydrology simulation and must not be described as one.
- Future hydrology must separately model drainage/flow, water-body connectivity, outlets, and sea-level/coastal depth where required.
- Climate-driven biome assignment should declare its inputs and generator version. Candidate inputs include elevation, latitude/season, temperature, precipitation, moisture, soil/drainage, and coastal context.
- Biome-to-surface mapping must allow authored overrides and transitions; no biome should silently overwrite manual paint.
- Coastal/shallow water and deep ocean must remain visually and logically distinguishable.

## 9. Mutation, history, and persistence

Terrain edit flow:
1. Receive a requested edit (paint, erase, raise/lower, smooth, water edit, or future biome operation).
2. Validate bounds, layer kind, lock/visibility, edit permission, and operation-specific constraints.
3. Calculate affected cells and neighboring dependencies.
4. Produce a new immutable document or mutation result.
5. Validate document invariants, including cell count and valid IDs.
6. Commit once through the existing editor commit/history pipeline.
7. Invalidate/rebuild affected derived caches.
8. Persist through the existing approved save path; do not add direct writes that bypass authoritative persistence.

Undo/redo must restore canonical authored state and then rebuild derived caches. A failed validation or failed persistence operation must not leave half-applied in-memory document/history state.

## 10. Determinism and versioning

Procedural terrain output identity should include:
- world/map seed,
- generator algorithm ID and version,
- canonical generator configuration,
- source document version/hash,
- relevant asset/catalog version where it affects generation.

Randomness must use a seeded generator rather than ambient time or unseeded randomness. Stable iteration order is required. Hashing must use canonical serialization with stable key and array ordering.

Schema versioning is separate from generator versioning. Any future canonical field requires:
- migration rules from existing v1 documents,
- defaults that preserve current appearance and behavior,
- round-trip tests,
- explicit unknown-version behavior,
- regression coverage for World Map deepwater base and paint undo/redo/save/load.

## 11. Validation requirements

### Structural
- Positive integer width and height.
- `cells.length === width * height` for every cell-backed layer.
- Valid layer kinds and unique stable IDs.
- All persisted cell indices remain in bounds.
- Terrain IDs resolve to a known canonical key or explicit safe fallback.

### Terrain and geography (when those features exist)
- No unintended chunk seams or missing cells.
- Surface transitions resolve deterministically.
- Water gradients and hydrology outputs respect documented rules.
- Biome assignment is deterministic and does not overwrite authored overrides.
- Elevation units and slope thresholds are explicit.

### Gameplay
- Traversal and collision projections match authored data and object layers.
- Building rules respect map type and region constraints.
- Pathfinding reachability tests cover required spawn points and destinations.

### Persistence and performance
- Save/load round-trip preserves canonical terrain.
- Undo/redo and replay produce identical canonical hashes.
- Same seed + generator version + config produces identical output.
- Cache invalidation covers edited cells and required neighbors/chunks.
- Generation and rebuild work stays within measured budgets; do not run unbounded terrain generation in the runtime tick.

## 12. Implementation plan

### T0 — Audit and contract (current)
- Compare this proposal with `MapDocument`, terrain engine, paint pipeline, map hierarchy, and persistence.
- Confirm current invariants; no schema mutation.

### T1 — Tests around current v1 contract
- Add/verify structural invariant helpers and tests without changing persisted schema.
- Verify World Map deepwater base, water gradient, paint commit, undo/redo, save/load.
- Test 32×32, 64×64, and 128×128 document allocation.

### T2 — Canonical terrain schema proposal
- Decide whether elevation/biome/hydrology data belongs in versioned document layers, map metadata, or separate authoritative world definition.
- Reconcile with runtime `WorldDefinition` and existing persistence before choosing.

### T3 — Incremental feature implementation
- Implement one data capability at a time with migration, focused tests, and performance checks.
- Do not introduce full hydrology simulation, voxel terrain, or 3D elevation as a side effect of the data contract.

### T4 — UI design
- After schema and interaction rules stabilize, use Figma for World Building UI and bind UI controls to the agreed contracts.

## 13. Explicit non-goals for v1

- No forced migration away from `MapDocument`.
- No assumption that all terrain is heightmap-based.
- No mandatory voxel/3D terrain representation.
- No claim that distance-based water bands constitute a hydrology simulation.
- No new database schema or direct Supabase mutations.
- No new branch.
- No UI implementation before data/interaction contracts are agreed.

## 14. Acceptance checklist

- [ ] Existing v1 maps remain readable and visually equivalent.
- [ ] World Map defaults to deepwater and erase restores deepwater.
- [ ] Cell count matches dimensions on all map sizes.
- [ ] Paint mutation passes through commit/history.
- [ ] Undo/redo and save/load preserve terrain IDs.
- [ ] Derived caches can be rebuilt from canonical state.
- [ ] New canonical fields have migration and round-trip tests before use.
- [ ] Deterministic generation is tested against fixed seeds and versions.
- [ ] Runtime WorldDefinition and persistence are reviewed before selecting final storage authority.
- [ ] Figma UI begins only after data contracts are approved.


## 13. Water visual bands versus gameplay water semantics — 2026-10-09

### Current behavior (verified)

| Identifier / field | Current meaning | Authority | Gameplay guarantee |
|---|---|---|---|
| `water` | Near-land water display band | Derived editor projection | None established |
| `brackish` | Intermediate display band in the current distance gradient | Derived editor projection | Does not establish salinity |
| `deepwater2` | Intermediate/farther display band in the current distance gradient | Derived editor projection | Does not establish measured depth |
| `deepwater` | Far-water display band and World Map base-water floor | Existing terrain convention / derived projection | Does not establish that a cell is impassable or boat-only |
| `map_cells.biome` / `terrain_variant` | Current database projection copies the canonical ground `tileId` into both fields | Rebuildable relational projection | Not a validated water movement policy |
| `map_cells.walkable` / `collision` | Current projection function initializes these values to `true` / `false` for projected ground cells | Projection implementation | Must not be treated as a correct water traversal rule without a separate gameplay contract |

The current gradient measures grid distance from non-water cells. It does not measure elevation, bathymetry, salinity, current, water-body connectivity, or vehicle access. Visual band identifiers must not be used as a substitute for those concepts.

### Recommended future gameplay model (proposal only)

If gameplay requires distinct water traversal behavior, introduce a separately versioned semantic projection with orthogonal fields rather than expanding the visual gradient's meaning:

- `water_state`: `coastal_shallow | open | deep | brackish | cold | frozen | none`
- `water_feature`: `shoreline | river | lake | waterfall | ocean_sea | none`
- `water_body_id`: optional stable identity for connectivity where needed
- `traversal_profile`: explicit policy for foot, swimming, boat, and special movement (for example `blocked`, `allowed`, or `requires_capability`), with movement cost defined by the gameplay contract
- optional `depth_value` only when there is an authored/simulated value and an explicit unit; never infer it from the four visual band IDs

These are conceptual fields, **not approved additions to `MapDocument v1` or the current `map_cells` schema**. Asset-library binding metadata such as `world_water_bindings` describes asset semantics and must not by itself decide whether a gameplay cell is traversable.

### Projection and runtime rules

1. Keep editor render projection deterministic and disposable; never write render-only bands back into canonical `MapDocument` cells.
2. Keep authored surface identity, visual asset selection, and gameplay traversal as separate concepts.
3. Any gameplay projection must be generated by a named, versioned mapping and validated on the server before runtime use.
4. A terrain-to-navigation projection must account for map type: World Map geography is not automatically a walkable playable grid.
5. Add tests for water/land boundaries, all-water maps, each map type, legacy snapshots, traversal policy, and save/recovery determinism before enabling runtime consumption.
6. Do not change deployed SQL or migration history until the gameplay contract and migration reproducibility plan are approved.

### Acceptance status

- [x] Current visual-band behavior and database projection boundary documented.
- [x] No assumption that visual `deepwater` implies physical depth or blocked movement.
- [ ] Product decision on swimming, boats, coastal access, and water traversal.
- [ ] Versioned gameplay-water schema and adapter approved.
- [ ] Server-side projection and regression tests implemented.

