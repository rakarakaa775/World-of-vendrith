# WORLD Snow Biomes / Tundra / Frozen Landscapes Audit — 2026-09-26

## Scope

Focused audit of snow, winter, ice and cold-environment candidates in the WORLD terrain staging path.

The audit separates:
- SNOW TERRAIN;
- SNOW ↔ GRASS / GROUND TRANSITIONS;
- FROZEN WATER / ICE;
- SNOWY LANDFORMS;
- SNOWY FOREST / VEGETATION;
- COLD-WATER TRANSITIONS;
- TUNDRA-specific vegetation.

No PNG is duplicated or physically moved. Logical biome bindings belong in Asset Library metadata.

## Repository enumeration

Filename scan found **33 PNG candidates** containing snow, ice, frozen, winter or cold semantics.

### A. Snow terrain — strong

1. `LPC_Overworld__Snow.png`
2. `lpc_terrain__snow.png`

These are direct snow-ground candidates.

### B. Snow / ground transitions — strong

3. `LPC_Overworld__Snow Grass Transitions.png`
4. `lpc_terrain__icesnowgrass.png`
5. `lpc_terrain__snowwater.png`
6. `lpc_terrain__watersnowgrass.png`
7. `lpc_terrain__watersnowother.png`

These should remain transition metadata rather than being collapsed into plain snow terrain.

### C. Frozen water / ice — strong

8. `lpc_terrain__ice.png`
9. `lpc_terrain__snowice.png`
10. `lpc_terrain__snowcoldwater.png`
11. `lpc_terrain__coldwater.png`
12. `lpc_terrain__coldwatersnowgrass.png`
13. `lpc_terrain__coldwatersnowother.png`
14. `lpc_terrain__icesnowgrass.png`
15. `lpc_terrain__icesnowother.png`

The exact visual role still needs source/binary verification where filenames combine multiple materials. In particular, "cold water" is not automatically frozen water.

### D. Snowy landforms — strong

16. `LPC_Overworld__Hills Snow.png`
17. `LPC_Overworld__Rocks Snow.png`
18. `LPC_Overworld__Water Cliff Snow.png`
19. `8__mountains-v6-tmw-snow.png`
20. `8__mountains-v6-tmw-snow-overlay.png`
21. `mountains__mountains-v6-snow.png`
22. `mountains__mountains-v6-snow-overlay.png`
23. `rocks__rocks-snow.png`
24. `rocks__rocks-snow-overlay.png`

These should bind to the existing WORLD landform categories as snowy variants, not create duplicate top-level categories.

### E. Snowy forest / vegetation — strong contextual candidates

25. `LPC_Overworld__Forest Snowy.png`
26. `8__LPCsnowTrees.png`

These are snowy vegetation/forest variants.

### F. Cold / ice water transition candidates

27. `lpc_terrain__coldwatergrass.png`
28. `lpc_terrain__coldwatergrassaltother.png`
29. `lpc_terrain__coldwaterredsandother.png`
30. `lpc_terrain__coldwatersandother.png`
31. `lpc_terrain__icegrass.png`
32. `lpc_terrain__icegrassaltother.png`
33. `lpc_terrain__iceredsandother.png`
34. `lpc_terrain__icesandother.png`

**Correction to raw filename count:** the scan returned 33 paths; the grouped list above contains overlapping combined-role entries and therefore must not be treated as a 34-file enumeration. The repository scan is authoritative at 33.

## Provenance findings

### [LPC] Terrains

The official source explicitly includes snow and ice terrain, and describes a frozen-lake texture adapted into the terrain set. It is licensed CC-BY-SA 4.0 and CC-BY-SA 3.0 and requires the complete attribution list in CREDITS-terrain.txt plus a link back to OpenGameArt. citeturn0search0

The repacked version is only a repack of the same terrain collection; it retains the same attribution requirements. citeturn0search6

### [LPC] Overworld

The Overworld pack includes snow terrain, snowy forests, snowy hills, snowy rocks and snowy variants alongside other environments. Its licenses are CC-BY-SA 3.0 and GPL 3.0. The attribution identifies Benjamin K. Smith plus upstream contributors for grass/water and sand/snow. citeturn0search1

### [LPC] Mountains

The Mountains pack explicitly provides snowy overlays/variations for its mountain and hill styles. It is CC-BY-SA 4.0 and CC-BY-SA 3.0 and requires the complete CREDITS-mountains.txt attribution. Its preview/Tiled package also contains LPC Terrains content, so terrain attribution remains applicable. citeturn0search5

### 4-Season Terrain

The [LPC Revised] 4-Season Terrain source contains seasonal terrain, snow/winter variations and a frozen waterfall variant under OGA-BY 3.0. This is a useful separate provenance family; current repository filenames are not promoted into this family without exact binary/source matching. citeturn0search2

## Important distinction: snow biome vs tundra

A snow tile is not automatically a tundra tile.

For the Asset Library:
- `snow_ground` = surface material;
- `frozen_water` = water state;
- `snowy_forest` = biome/vegetation context;
- `snowy_mountain` = landform variant;
- `tundra` = biome context requiring appropriate vegetation/terrain evidence.

The current repository contains strong snow/frozen candidates but **no filename-explicit dedicated tundra vegetation family**. Therefore no tundra vegetation approval is invented.

## Canonical taxonomy

```text
WORLD
└── SNOW BIOMES / FROZEN LANDSCAPES
    ├── SNOW TERRAIN
    │   ├── SNOW GROUND
    │   ├── SNOW ↔ GRASS
    │   └── SNOW ↔ OTHER GROUND
    ├── FROZEN WATER
    │   ├── ICE
    │   ├── FROZEN LAKE
    │   ├── ICE ↔ SNOW
    │   └── ICE ↔ WATER
    ├── COLD WATER
    │   ├── COLD OPEN WATER
    │   └── COLD WATER ↔ SNOW / GRASS
    ├── SNOWY LANDFORMS
    │   ├── SNOWY MOUNTAINS
    │   ├── SNOWY HILLS
    │   ├── SNOWY CLIFFS
    │   └── SNOWY ROCKS
    ├── SNOWY VEGETATION
    │   ├── SNOWY FOREST
    │   └── SNOW-COVERED TREES
    └── TUNDRA
        ├── TUNDRA GROUND
        ├── LOW VEGETATION
        └── COLD-SURFACE TRANSITIONS
```

## Asset Library fields

Recommended metadata:
- biome = SNOW / TUNDRA / FROZEN
- surface_state = snow / ice / frozen
- water_state = normal / cold / frozen
- landform_variant = snowy
- vegetation_variant = snowy
- transition = snow-grass / snow-water / ice-snow / ice-grass
- source_family
- source_page
- license
- attribution_status
- binary_verification_status

## Approval rule

Classification is not approval.

Final binary approval remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

## Current conclusion

The repository has a substantial winter/frozen asset family, but the **tundra layer is still metadata-defined rather than binary-complete**. This is preferable to falsely labeling generic snow tiles as tundra.

## Next boundary

Proceed to **WORLD → Ground / Terrain Core**, auditing grass, dirt, stone, mud, beach, ground transitions and generic terrain sheets, while preserving the already-established water, desert, swamp and snow bindings.
