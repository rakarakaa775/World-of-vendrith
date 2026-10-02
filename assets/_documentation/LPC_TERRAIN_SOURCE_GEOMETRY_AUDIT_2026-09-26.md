# LPC Terrain Source Geometry Audit — 2026-09-26

## Scope

This checkpoint records geometry directly observable from the original LPC terrain PNGs in:

`Asset-library-LPC_Finalized_Review.zip` → `02_TILES_AND_TERRAIN/`

It is an additive WORLD/terrain audit. The building system is outside scope.

## Verified source geometry

The audited LPC terrain PNGs use a **16×16 pixel source tile cell**.

Across the 59 registered LPC terrain binaries:

- **22 files:** 192×192 px → **12×12** source cells
- **34 files:** 160×192 px → **10×12** source cells
- **3 files:** 160×224 px → **10×14** source cells

All 59 records now carry:

- `tile_width = 16`
- `tile_height = 16`
- `grid_width` / `grid_height` matching the source PNG dimensions
- metadata `source_grid_verified = true`

## Important boundary

The repository also contains Tiled TSX references such as `lpc-terrains__terrain-v7.tsx` and `tiled__terrain-map-v7.tsx`. Those TSX definitions use **32×32 Tiled cells** and reference derived/generated terrain sheets. They are not evidence that the original 16×16 LPC source PNGs should be assigned the same runtime `tileset_id`.

Therefore this audit does **not** assign:

- runtime `tileset_id`
- runtime `tile_region`
- water `flow_direction`
- water `flow_strength`
- binding promotion

Those remain unresolved until the Map Editor's actual runtime terrain asset mapping is traced.

## Current semantic gate

Binary provenance remains:

- 59/59 EXACT_MATCH
- 0 mismatch
- source/repository binary identity verified

Visual semantic audit remains:

- 22/22 water bindings visually consistent
- 30/30 transition bindings visually consistent

Binding status remains:

- 22 water bindings: `candidate`
- 30 transition bindings: `candidate`

This checkpoint adds source geometry evidence without converting candidate semantic bindings into runtime-approved bindings.
