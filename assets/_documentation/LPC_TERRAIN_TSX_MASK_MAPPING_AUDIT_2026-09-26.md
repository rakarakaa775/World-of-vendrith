# LPC Terrain TSX Mask Mapping Audit — 2026-09-26

## Verified source structure

Source: `Asset-library-LPC_Finalized_Review.zip` → `02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.tsx`.

The derived LPC tileset declares 2048 tiles at 32×32 px, 32 columns. Its `terrain` field contains four corner terrain indices. It does not declare a Tiled Wang set.

Relevant terrain indices:
- 0 = Dirt_Tan
- 10 = Grass
- 15 = Sand
- 21 = Water

Canonical full-terrain tiles:
- Dirt_Tan: tile 97
- Grass: tile 321
- Sand: tile 336
- Water: tile 548

## Mask relationship

The Map Editor runtime uses an 8-neighbor mask:
- N=1, E=2, S=4, W=8
- NE=16, SE=32, SW=64, NW=128

The four TSX terrain values can represent the four tile corners. A safe bridge from the runtime 8-neighbor mask to a four-corner terrain pattern is possible by evaluating each corner from its adjacent cardinal neighbors plus its diagonal:

- NW corner: N + W + NW
- NE corner: N + E + NE
- SW corner: S + W + SW
- SE corner: S + E + SE

A corner is considered the target terrain only when all three corresponding runtime neighbors are the target terrain. This reduces the 256 runtime masks to the 16 possible four-corner patterns; the two uniform patterns are the base/full cases and the remaining 14 are transition patterns.

The TSX contains 14 distinct two-terrain corner patterns for each verified pair such as Water↔Sand, matching this reduced transition shape count.

## Important runtime limitation

The current renderer consumes an asset as a whole texture and has no crop/region field. Therefore a 16×16 LPC source sheet or a mixed 32×32 tilesheet cannot be used as a direct one-cell binding.

A runtime integration must use an exact derived 32×32 tile/region representation, or extend the binding contract to carry a crop/region. No such runtime binding was added by this audit.

## Mapping status

- Binary provenance: VERIFIED 59/59.
- Source geometry: VERIFIED 59/59.
- TSX terrain metadata: VERIFIED.
- Four-corner to 8-neighbor reduction: DERIVED from the existing runtime mask semantics and TSX corner structure.
- Exact runtime asset/region binding: NOT YET ENABLED.
- Existing five logical terrain keys remain unchanged.
- Building system untouched.

No asset approval or runtime binding candidate was created by this audit.
