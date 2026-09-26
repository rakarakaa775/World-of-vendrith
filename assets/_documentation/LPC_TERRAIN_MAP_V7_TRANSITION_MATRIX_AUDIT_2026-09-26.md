# LPC Terrain-map-v7 Transition Matrix Audit — 2026-09-26

## Source

`02_TILES_AND_TERRAIN/tiled__terrain-map-v7.tsx`

The source declares:
- 15,562 tiles
- 32×32 px tiles
- 16 columns
- terrain metadata with four corner values

Relevant terrain indices:
- Dirt_Brown = 0
- Dirt_Tan = 3
- Grass = 5
- Sand = 22
- Water = 28

Unlike `lpc-terrains__terrain-v7.tsx`, this derived terrain-map contains the cross-material transition matrix needed for the existing logical terrain families.

## Exact 14-pattern transition coverage

For each listed pair, the TSX contains exactly 14 non-uniform four-corner patterns. The remaining two four-corner states are the uniform source and uniform target states.

### Grass ↔ Dirt_Tan

| Tile ID | Corner tuple |
|---:|---|
| 293 | (5,5,5,3) |
| 303 | (5,5,3,5) |
| 305 | (5,5,3,3) |
| 363 | (5,3,5,5) |
| 365 | (5,3,5,3) |
| 375 | (5,3,3,5) |
| 377 | (5,3,3,3) |
| 722 | (3,5,5,5) |
| 724 | (3,5,5,3) |
| 734 | (3,5,3,5) |
| 736 | (3,5,3,3) |
| 794 | (3,3,5,5) |
| 796 | (3,3,5,3) |
| 806 | (3,3,3,5) |

### Grass ↔ Sand

| Tile ID | Corner tuple |
|---:|---|
| 295 | (5,5,5,22) |
| 315 | (5,5,22,5) |
| 319 | (5,5,22,22) |
| 435 | (5,22,5,5) |
| 439 | (5,22,5,22) |
| 459 | (5,22,22,5) |
| 463 | (5,22,22,22) |
| 1152 | (22,5,5,5) |
| 1156 | (22,5,5,22) |
| 1176 | (22,5,22,5) |
| 1180 | (22,5,22,22) |
| 1296 | (22,22,5,5) |
| 1300 | (22,22,5,22) |
| 1320 | (22,22,22,5) |

### Water ↔ Grass

| Tile ID | Corner tuple |
|---:|---|
| 34 | (28,28,28,5) |
| 39 | (28,28,5,28) |
| 40 | (28,28,5,5) |
| 69 | (28,5,28,28) |
| 70 | (28,5,28,5) |
| 75 | (28,5,5,28) |
| 76 | (28,5,5,5) |
| 249 | (5,28,28,28) |
| 250 | (5,28,28,5) |
| 255 | (5,28,5,28) |
| 256 | (5,28,5,5) |
| 285 | (5,5,28,28) |
| 286 | (5,5,28,5) |
| 291 | (5,5,5,28) |

### Water ↔ Sand

| Tile ID | Corner tuple |
|---:|---|
| 38 | (28,28,28,22) |
| 63 | (28,28,22,28) |
| 68 | (28,28,22,22) |
| 213 | (28,22,28,28) |
| 218 | (28,22,28,22) |
| 243 | (28,22,22,28) |
| 248 | (28,22,22,22) |
| 1109 | (22,28,28,28) |
| 1114 | (22,28,28,22) |
| 1139 | (22,28,22,28) |
| 1144 | (22,28,22,22) |
| 1289 | (22,22,28,28) |
| 1294 | (22,22,28,22) |
| 1319 | (22,22,22,28) |

### Water ↔ Dirt_Tan

| Tile ID | Corner tuple |
|---:|---|
| 36 | (28,28,28,3) |
| 51 | (28,28,3,28) |
| 54 | (28,28,3,3) |
| 141 | (28,3,28,28) |
| 144 | (28,3,28,3) |
| 159 | (28,3,3,28) |
| 162 | (28,3,3,3) |
| 679 | (3,28,28,28) |
| 682 | (3,28,28,3) |
| 697 | (3,28,3,28) |
| 700 | (3,28,3,3) |
| 787 | (3,3,28,28) |
| 790 | (3,3,28,3) |
| 805 | (3,3,3,28) |

## Runtime-mask interpretation

The existing runtime exposes all eight neighboring cells. A four-corner transition pattern can be derived without inventing a new terrain engine by evaluating each corner from its three adjacent runtime neighbors:

- NW = N ∧ W ∧ NW
- NE = N ∧ E ∧ NE
- SW = S ∧ W ∧ SW
- SE = S ∧ E ∧ SE

This produces 16 possible corner states from the 256 runtime masks. The TSX transition matrix supplies 14 non-uniform states; the two uniform states correspond to the base/full cases.

This is a mapping proposal derived from the existing runtime mask semantics plus the TSX four-corner data. It is not yet an approved runtime binding.

## Important limitation

The runtime currently has no `tile_region`/crop field and loads an entire `asset_path` texture. Therefore these tile IDs cannot be activated merely by inserting them into `asset_binding_candidates`.

A runtime-safe binding needs either:
1. an exact single-tile 32×32 asset representation for each selected tile ID, or
2. an additive region/crop field and renderer support for the derived terrain-map tileset.

No renderer change, binding candidate, asset approval, or building-system change was made by this audit.

## Current status

- LPC binary provenance: 59/59 exact.
- LPC source geometry: 59/59 verified.
- terrain-v7 transition metadata: verified.
- terrain-map-v7 cross-material matrix: verified for the audited pairs.
- runtime mask reduction: derived, not yet promoted.
- runtime tile-region binding: not yet implemented.
