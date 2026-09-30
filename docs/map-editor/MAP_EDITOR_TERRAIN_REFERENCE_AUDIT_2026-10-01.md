# Map Editor Terrain Foundation Readiness Audit

Date: 2026-10-01

## Scope

Audit the current Map Editor foundation against the open-source reference patterns documented in `docs/MAP_EDITOR_REFERENCE_MATRIX.md`.

This is an audit only. No Map Editor foundation, Supabase schema, or asset ingestion system is changed by this document.

## Current foundation

The repository already contains:

- `MapDocument` with grid dimensions and logical layers.
- Ground/object/collision layer separation.
- Local deterministic map history with undo/redo.
- Paint, erase, line, rectangle, and flood tools.
- 8-neighbor terrain masks (0-255).
- Affected-cell perimeter recalculation.
- Terrain junction detection and render planning.
- Terrain brush preview analysis.
- Terrain autotile application/resolution hooks.
- Runtime terrain asset binding loader with approval checks.
- Pixi rendering that resolves terrain bindings by neighbor mask.
- Persistent Pixi application lifecycle rather than recreating the renderer per editor change.

## Readiness against reference patterns

### 1. Semantic terrain model — READY WITH LIMITED VOCABULARY

The engine has explicit terrain semantics:

`grass`, `sand`, `dirt`, `pavement`, `water`, `deepwater`.

Painting operates through terrain-aware functions rather than requiring the UI to manipulate raw rendering details.

Reference alignment:
- Tiled: terrain-oriented editing.
- LDtk: logical values separated from rendered tile output.

Constraint:
- The current terrain vocabulary does not yet include other approved terrain concepts such as snow or lava.

Recommendation:
- Do not expand the vocabulary merely because assets exist.
- First define which terrain concepts are gameplay/map semantics, then add them deliberately.

### 2. Neighbor-aware Terrain Brush — ENGINE READY

The engine computes all eight neighboring directions and produces a deterministic 8-bit mask.

Painting recalculates the edited cells plus their surrounding perimeter.

This is the correct foundation for a Tiled/LDtk-style neighbor-aware brush.

No new brush architecture is required.

### 3. Terrain Fill — EXISTING TOOL PATH, NEEDS RUNTIME VALIDATION

Flood fill already exists in the editor input path and terrain brush preview can analyze flood-fill results.

The logical path is therefore already compatible with terrain-aware fill.

Remaining work is runtime verification of:
- large-region fill,
- boundary recomputation,
- history behavior,
- rendering cost.

### 4. Autotile transitions — NOT YET PRODUCTION-COMPLETE

This is the main current gap.

The code can calculate masks from 0 through 255 and resolve a binding for a mask.

However, the live binding workbench currently has only approved base bindings at mask 255 for the six recognized terrain keys.

Current live audit:
- approved binding rows: 17
- recognized terrain keys: 6
- base mask rows: 10
- approved rows marked autotile-capable: 1, but that row has no terrain key/mask and therefore cannot form a terrain mask binding.

Therefore the renderer currently has the correct resolution mechanism but does not yet have a complete transition asset catalog.

Important:
- Do not manufacture 256 bindings.
- Do not infer transition regions from unverified sprites.
- Do not bypass candidate/asset approval.

### 5. Terrain Asset Binding — SAFE FOUNDATION

The loader requires:
- approved candidate status,
- approved asset status,
- valid terrain key,
- valid neighbor mask,
- asset ID,
- license registry ID.

It also keeps missing transition bindings as safe fallback states.

This matches the project's existing asset approval/security boundary.

### 6. Weighted variation — NOT YET IMPLEMENTED IN THE CURRENT TERRAIN RESOLUTION PATH

The open-source reference matrix identified weighted variation as a useful future feature.

The current resolver selects by terrain + mask and does not expose a weighted variant set.

Recommendation:
- Add variation only after deterministic terrain transition resolution is stable.
- Prefer deterministic seeds if map reproducibility matters.

### 7. Rule/AutoMapping layer — FOUNDATION EXISTS, FULL RULE SYSTEM NOT YET PRESENT

The repository already has:
- terrain rule keys,
- junction resolution,
- terrain blend helpers,
- terrain mask topology,
- environment/season bridges.

The current rule catalog is intentionally small:
- grass → world_grass
- dirt → road_dirt
- water → world_water

This is a useful seam for a future declarative rule layer without replacing the current document model.

### 8. UI readiness — CURRENT BOTTLENECK

The editor shell currently loads only one terrain palette entry:

- Deepwater

Even though the terrain engine recognizes six terrain keys.

Therefore the code foundation can support more terrain choices, but the current authoring UI does not expose the complete recognized terrain vocabulary.

This is separate from Asset Library ingestion: the approved binaries being present does not automatically make them selectable terrain tools.

## Recommended implementation sequence

1. Keep current MapDocument/history/persistence foundation unchanged.
2. Expand the terrain palette from hardcoded Deepwater to the approved terrain vocabulary.
3. Verify the six existing base terrain bindings visually.
4. Establish and approve actual transition bindings before enabling visual autotiling.
5. Add a small deterministic Terrain Brush preview test suite.
6. Validate Flood + perimeter recomputation on real runtime maps.
7. Only then introduce weighted terrain variation.
8. After that, consider declarative AutoMapping-style rules for decoration and advanced transitions.

## Explicit non-goals

This audit does not recommend:

- replacing the MapDocument model,
- replacing Pixi,
- importing Tiled/LDtk formats,
- replacing Supabase asset_registry,
- replacing asset_files/canonical storage,
- creating a second Asset Library,
- changing building foundations,
- automatically assigning every approved asset to terrain.

## Conclusion

The current foundation is structurally suitable for the next Terrain Brush phase.

The next implementation should focus on **data completeness and UI exposure**, not rebuilding the editor engine:

`Approved terrain assets -> semantic terrain palette -> neighbor mask -> approved transition binding -> Pixi render`

The most important missing production piece is the approved transition-binding catalog. The most visible UI gap is that only Deepwater is currently exposed despite six recognized terrain keys.
