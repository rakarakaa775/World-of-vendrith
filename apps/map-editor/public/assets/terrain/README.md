# Bundled LPC terrain sheets

These explicit files are copied from `assets/world/world/02_TILES_AND_TERRAIN/` so the Map Editor palette can preview the basic terrain family without relying on a Supabase registry response:

- grass, alternate grass, tall grass
- sand and red sand
- dirt and alternate dirt
- water, deep water, deep-water variant and brackish water
- hole variants, lava and lava rock

The source PNGs are original LPC terrain sheets on a verified 16×16 source-cell grid; they are sprite sheets, not single-tile images. They are used here as palette previews only. Runtime terrain rendering still requires an approved binding and verified tile region; this bundle does not invent a region or promote a database record.

## License and attribution

The source LPC terrain pack is documented as dual-licensed under CC-BY-SA 3.0 and GNU GPL 3.0. Attribution is required. Preserve the original project attribution and contributor notices in `assets/_documentation/source-material/world/LPC_Terrain__Attribution.txt` and `assets/_documentation/source-material/world/terrain__Attribution.txt`. Source geometry and binary provenance are documented in `assets/_documentation/LPC_TERRAIN_SOURCE_GEOMETRY_AUDIT_2026-09-26.md` and `assets/_documentation/ASSET_LIBRARY_REGISTRY.md`.

No claim is made that these sheets are individually approved for runtime autotiling.
