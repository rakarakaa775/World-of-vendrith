# Canonical terrain textures

Place the official terrain PNGs in this directory:
- tile_grass.png
- tile_sand.png
- tile_dirt.png
- tile_pavement.png
- tile_water.png

The map editor should resolve these textures from `/assets/terrain/<filename>` and load them through Pixi's texture cache.

Sand and water base tiles are derived from the audited LPC terrain source pack and are intentionally kept as bundled base textures. Transition/autotile masks remain a separate registry concern.