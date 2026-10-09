# Vendrith Terrain Runtime Integration Audit v1

Status: **Audit in progress — editor-side contracts verified; runtime authority not yet fully reconciled.**
Target branch: `feat/vendrith-ecc-v1`
Related contract: `docs/architecture/VENDRITH_TERRAIN_DATA_SPEC_V1.md`

## 1. Purpose

Record what is verified about the current terrain editor and persistence boundaries before choosing where future elevation, biome, hydrology, chunking, and traversal data should live. This audit is not a claim that runtime integration is complete.

## 2. Verified editor-side findings

### 2.1 Canonical map document

Source: `apps/map-editor/editor/map-document.ts`

- The persisted editor model is `MapDocument` version 1.
- Map types are `world`, `region`, and `playable`.
- A cell is currently `{ tileId: string | null }`; no first-class elevation, biome, water-body, or chunk fields are defined on the cell.
- Cell arrays are row-major: `index = y * width + x`.
- The default world dimensions are 128×128, tile size 32; supported size constants are 32, 64, and 128.
- A world map's ground cells initialize to `deepwater`.
- Map type capabilities differ: world maps disallow buildings/collision/terrain detail; region and playable maps have their own capability flags.

### 2.2 Terrain semantics versus rendering

Sources: `apps/map-editor/editor/terrain-engine.ts`, `terrain-resolver.ts`, and `terrain-autotile-apply.ts`.

- Terrain keys are resolved from cell `tileId` values, with a small explicit legacy mapping for starter/stone/water tile IDs.
- Neighbor and corner masks are derived from the current document.
- Autotile application returns derived variants; the resolver selects approved asset bindings and fallback tile IDs.
- Render variants and masks should remain rebuildable derived state, not a second authored source of truth.
- Water bands `water`, `brackish`, `deepwater2`, and `deepwater` are used by the current visual gradient. `applyWaterDepthGradient` calculates distance from non-water cells; it is not a physical hydrology model.
- When a world map has no land cells, the current gradient logic restores water-band cells to the `deepwater` floor.

### 2.3 Serialization and validation

Source: `apps/map-editor/editor/map-serialization.ts`.

- The serializer declares schema `vandrith.map-document`, version 1.
- Parsing validates document identity, positive integer dimensions and tile size, layer/cell structure, `width * height` cell counts, layer kinds, object semantics, and map hierarchy constraints.
- The parser currently rejects unsupported schema/document versions. New canonical terrain fields therefore need an explicit versioning/migration decision rather than being added silently to v1.

### 2.4 Editor persistence boundary

Source: `apps/map-editor/editor/map-persistence.ts`.

- Editor runtime snapshots are saved and loaded through the `map_editor_upsert_runtime_snapshot_v1` and `map_editor_get_runtime_snapshot_v1` RPCs.
- If the runtime snapshot is absent or fails parsing, loading attempts the newest `map_versions` row for that map.
- The autosaver also writes a local crash-recovery journal.
- This is the map-editor persistence path. Do not assume it is identical to the production game-runtime's durable mutation/checkpoint/recovery path.

## 3. Runtime integration status

The terrain data spec requires reconciliation with the production runtime's authoritative world definition and durable mutation/recovery contract before choosing final storage for new terrain fields.

**Not yet confirmed in this audit:** the exact source paths and types for the production runtime's authoritative `WorldDefinition`, runtime world adapter, durable mutation batch, checkpoint/replay recovery, and the mapping from editor `MapDocument` to runtime world state. Repository search through the connected GitHub interface did not return those symbols reliably; that search result is not evidence that the implementation does not exist.

Therefore:
- Do not add elevation/biome/hydrology fields to `MapDocument v1` yet.
- Do not create a competing terrain database table or persistence route.
- Do not route editor writes directly into production runtime mutation storage without a documented adapter.
- Do not claim runtime/editor round-trip compatibility until verified by code and tests.

## 4. Integration decisions required

Before implementation, verify these contracts directly in the repository:

1. **Identity:** how editor map IDs, world IDs, region IDs, and runtime world IDs map to each other.
2. **Authority:** which representation is authoritative for authored terrain versus live mutable game state.
3. **Projection:** whether runtime `WorldDefinition` consumes a `MapDocument` snapshot, a normalized projection, or another canonical schema.
4. **Mutation boundary:** how a terrain edit becomes a validated, versioned durable mutation; whether editing is a content mutation or a live simulation mutation.
5. **Recovery:** how checkpoints, ordered mutation replay, sequence/hash validation, and migrations interact with terrain changes.
6. **Derived caches:** where autotile masks, terrain variants, collision, navigation, biome outputs, and hydrology products are rebuilt and invalidated.
7. **Versioning:** independent versions for document schema, runtime world schema, terrain algorithms, and procedural generator configuration.
8. **Performance:** how chunking/streaming will be introduced without changing canonical cell ownership or creating seams.
9. **Tests:** fixed fixtures covering world identity, terrain edit → save → recovery, undo/redo, and deterministic derived outputs.

## 5. Recommended safe sequence

- **R1 — Runtime source audit:** locate and read the authoritative runtime world definition, adapter, mutation and recovery code.
- **R2 — Mapping contract:** document field-by-field conversion and identify any lossy mappings; no code change yet.
- **R3 — Regression tests:** add tests around the existing v1 editor contract and the verified mapping boundary.
- **R4 — Versioned proposal:** decide where future elevation/biome/hydrology fields belong and define migrations.
- **R5 — Incremental implementation:** implement one capability at a time, through existing authority/persistence boundaries.
- **R6 — UI design:** begin Figma World Building UI after data and interaction contracts are approved.

## 6. Acceptance criteria

- [x] Existing MapDocument v1 structure and validation inspected.
- [x] Current terrain rendering/autotile and water-gradient behavior inspected.
- [x] Editor snapshot/durable-version fallback inspected.
- [ ] Production runtime world definition and adapter located and read.
- [ ] Editor-to-runtime mapping is explicit and lossless where required.
- [ ] Durable mutation and recovery behavior is verified for terrain changes.
- [ ] Round-trip and determinism tests pass.
- [ ] Storage for future canonical terrain fields is approved before schema changes.

## 7. Explicit non-claims

This document does not claim that runtime integration is complete, that tests were run, that the connected GitHub search proved runtime symbols absent, or that any production data/schema was changed.
