# LPC v7 Transition Matrix Visual Audit — 2026-09-26

Source: Asset-library-LPC_Finalized_Review.zip, 02_TILES_AND_TERRAIN/tiled__terrain-map-v7.tsx and tiled__terrain-map-v7.png.

The four-value TSX terrain tuple is visually verified as top-left, top-right, bottom-left, bottom-right. Tile 293 is 5,5,5,3 and visually places Dirt_Tan in the bottom-right corner.

Audited transition families: Grass/Dirt_Tan, Grass/Dirt_Brown, Grass/Sand, Water/Grass, Water/Sand, Water/Dirt_Tan. Each has 14 non-uniform corner patterns.

Vendrith runtime currently uses an 8-neighbor mask: N=1, E=2, S=4, W=8, NE=16, SE=32, SW=64, NW=128. The source representation uses four corner materials. A direct all-three-neighbors interpretation cannot reproduce every source corner pattern because adjacent corners share cardinal neighbors.

Therefore no unverified runtime mask table is promoted. Source transition matrices and tuple orientation are verified; semantic transition bindings remain candidate; runtime transition adapter remains unapproved.

Transition implementation remains a WORLD Map Editor terrain/autotile gate. No building-system code was changed.
