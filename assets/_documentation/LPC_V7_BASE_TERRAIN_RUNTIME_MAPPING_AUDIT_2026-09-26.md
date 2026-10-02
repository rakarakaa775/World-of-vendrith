# LPC v7 Base Terrain Runtime Mapping Audit — 2026-09-26

Source:
`Asset-library-LPC_Finalized_Review.zip` → `02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.tsx`

Derived runtime image:
`lpc-terrains__terrain-v7.png`

The TSX declares a 32×32 tile grid with 32 columns. The following full-tile entries are source-derived:

| Runtime terrain | TSX terrain type | Tile ID | Region |
|---|---|---:|---|
| dirt | Dirt_Tan | 97 | x=32, y=96, 32×32 |
| grass | Grass | 321 | x=32, y=320, 32×32 |
| sand | Sand | 336 | x=512, y=320, 32×32 |
| water | Water | 548 | x=128, y=544, 32×32 |

All four have uniform four-corner terrain tuples in the source TSX:

- Dirt_Tan: `3,3,3,3`
- Grass: `5,5,5,5`
- Sand: `22,22,22,22`
- Water: `28,28,28,28`

These four mappings have been inserted into `asset_binding_candidates` as **pending** candidates with source evidence and exact 32×32 regions.

## Approval boundary

These candidates are intentionally not approved.

Runtime acceptance still requires:

1. asset registry status = approved;
2. candidate status = approved;
3. license registry id present;
4. semantic/runtime review complete.

Therefore the existing editor runtime is unchanged by this candidate registration.

## Transition boundary

The source `tiled__terrain-map-v7.tsx` contains exact transition patterns for Grass, Dirt_Tan, Sand and Water. Those patterns are documented separately.

The 8-neighbor runtime mask → four-corner reduction must be source/visual verified before transition candidates are promoted.

No transition candidate is approved by this audit.
