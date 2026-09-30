# Map Editor Open-Source Reference Matrix

Status: reference-only research. This document does not change the map/terrain foundation.

## Purpose

Capture useful patterns from active open-source map editors that can inform World of Vendrith without copying their architecture.

## References

### Tiled
Repository: https://github.com/mapeditor/tiled

Relevant patterns:
- Terrain Brush for corner/edge terrain transitions.
- Terrain Fill Mode that chooses matching terrain tiles while painting.
- Tile probability for weighted variation.
- Tile stamps and random stamp placement.
- AutoMapping for rule-based transformations.
- Tile properties and collision/object editing.
- Terrain data is associated with tiles/terrain sets.

Current repository evidence:
- Tiled v1.12.2 is a current release.
- Recent changelog work includes terrain editing fixes and AutoMapping improvements.

Vendrith relevance:
1. Terrain Brush should operate from terrain semantics, not raw tile IDs.
2. Terrain transitions should be resolved from neighboring cells.
3. Variation can use weighted tile selection.
4. AutoMapping can remain a later rule layer above the existing terrain model.

### LDtk
Repository: https://github.com/deepnight/ldtk

Relevant patterns:
- Auto-layer rules driven by IntGrid values.
- Rule groups that can be duplicated/remapped.
- Optional rules and biome-driven rule groups.
- Randomized tile output for decorative variation.
- Neighbor-aware rule patterns.
- Asynchronous rendering for complex/large maps.

Vendrith relevance:
1. Separate logical terrain state from rendered tile output.
2. Treat terrain/biome as semantic values.
3. Use rule groups for transitions and decoration.
4. Keep expensive recomputation localized to changed cells.

### blurymind/tilemap-editor
Repository: https://github.com/blurymind/tilemap-editor

Relevant patterns:
- Multiple tilesets and tilemaps.
- Layer visibility/opacity.
- Paint, pan, erase, bucket fill, random tile, and pick tile tools.
- Tile metadata/tags.
- Undo/redo.
- Responsive web-oriented editor design.

Vendrith relevance:
1. Random Tile Tool is a useful UX pattern for repetitive terrain.
2. Bucket Fill and Pick Tile are useful baseline editing tools.
3. Tile metadata can expose gameplay semantics without coupling them to rendering.
4. Keep editor interactions lightweight.

## Proposed Vendrith reference architecture

Do not replace the current foundation.

Use the existing pipeline:

Asset Library -> asset_registry -> asset_files -> canonical Storage -> Map Editor

Add future map intelligence as layers above it:

1. Semantic terrain layer
   - grass
   - dirt
   - sand
   - water
   - deep water
   - snow
   - lava
   - holes/overlays

2. Terrain rule layer
   - neighbor matching
   - edge/corner transitions
   - terrain fill
   - optional biome/rule groups

3. Variation layer
   - weighted tile selection
   - random tile/stamp variation
   - deterministic seed where reproducibility matters

4. Decoration/AutoMapping layer
   - shadows
   - vegetation
   - rocks
   - shoreline details
   - other rule-driven overlays

5. Gameplay metadata layer
   - collision
   - movement
   - surface type
   - interaction flags

## Implementation order for Vendrith

Phase A — reference model only
- Define terrain semantics without changing current asset ingestion.
- Map approved assets to terrain roles where metadata is sufficient.

Phase B — Terrain Brush
- Neighbor-aware painting.
- Edge/corner transition resolution.
- Preview before commit.
- Undo/redo integration.

Phase C — Terrain Fill
- Fill a region using terrain semantics.
- Resolve boundaries automatically.

Phase D — Variation
- Weighted random variants.
- Deterministic seed per map/edit operation if needed.

Phase E — Rule/AutoMapping
- Declarative rules for decorations and transitions.
- Recalculate only affected cells.

## Guardrails

- Do not copy Tiled/LDtk data formats into Vendrith.
- Do not replace Supabase asset_registry or asset_files.
- Do not duplicate the Asset Library.
- Do not introduce a second canonical asset storage path.
- Do not change building systems while implementing terrain references.
- Do not treat all approved assets as terrain assets.
- Keep the current map editor foundation intact unless a concrete implementation requires a minimal extension.

## Source links

- Tiled: https://github.com/mapeditor/tiled
- Tiled tile-layer editing: https://github.com/mapeditor/tiled/blob/master/docs/manual/editing-tile-layers.rst
- Tiled JSON map format: https://github.com/mapeditor/tiled/blob/master/docs/reference/json-map-format.rst
- LDtk: https://github.com/deepnight/ldtk
- LDtk changelog: https://github.com/deepnight/ldtk/blob/master/docs/CHANGELOG.md
- LDtk releases: https://github.com/deepnight/ldtk/releases
- TileMap Editor: https://github.com/blurymind/tilemap-editor
