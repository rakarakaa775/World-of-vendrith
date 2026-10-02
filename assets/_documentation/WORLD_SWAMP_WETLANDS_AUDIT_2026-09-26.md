# WORLD Swamp / Wetlands Audit — 2026-09-26

## Scope

Focused audit of natural wetland candidates in the current WORLD terrain staging path.

The project taxonomy distinguishes:
- SWAMP / WETLAND TERRAIN;
- BOG / MUD / WET GROUND;
- BRACKISH WATER;
- WATER-GRASS / SHALLOW-WETLAND TRANSITIONS;
- REEDS / MARSH PLANTS;
- DEAD / WATERLOGGED VEGETATION;
- FUNGAL / HUMID UNDERSTORY.

No binary is duplicated to represent these logical roles.

## Repository enumeration

A filename-focused scan found **21 PNG candidates** whose names contain brackish, wet-grass, dirt, grass-alt, mud-like/hole, or related wetland transition semantics.

However, filename semantics alone are insufficient to call all 21 swamp assets. The audit therefore separates strong candidates from generic terrain.

### Strong wetland candidates

1. `lpc_terrain__brackish.png`
   - Binding candidate: WORLD / WETLANDS / BRACKISH WATER.
   - This is the strongest explicit wetland-related terrain filename.

2. `lpc_terrain__watergrass.png`
   - Binding candidate: WORLD / WETLANDS / WATER-GRASS TRANSITION.
   - Could also serve general shoreline/river transitions; biome binding should remain metadata-driven.

3. `lpc_terrain__watergrassaltother.png`
   - Binding candidate: WORLD / WETLANDS / WATER-GRASS TRANSITION VARIANT.

4. `lpc_terrain__coldwatergrass.png`
   - Binding candidate: WORLD / COLD WATER / WET GRASS transition.
   - Not automatically a swamp asset because cold-water environments may represent tundra, marsh or seasonal wet ground.

5. `lpc_terrain__coldwatergrassaltother.png`
   - Same conservative rule as above.

### Generic terrain candidates requiring visual verification

6. `lpc_terrain__dirt.png`
7. `lpc_terrain__dirt2.png`
8. `lpc_terrain__dirt_night.png`
9. `lpc_terrain__grassalt.png`
10. `lpc_terrain__grassgrassaltother.png`
11. `tilesets_edit__10_dirt.png`

These can participate in swamp/woodland/marsh maps but cannot be classified as swamp-specific from filenames.

### Hole / depression candidates

12. `lpc_terrain__hole.png`
13. `lpc_terrain__holegrassaltother.png`
14. `lpc_terrain__holek.png`
15. `lpc_terrain__holekgrassaltother.png`
16. `lpc_terrain__holelikegrassaltotheroverlay.png`
17. `lpc_terrain__holelikegrassoverlay.png`
18. `lpc_terrain__holemid.png`
19. `lpc_terrain__holemidgrassaltother.png`

These are terrain/depression mechanics, not automatically swamp. They may be useful for muddy pools, pits or natural depressions after visual verification.

### Non-wetland environmental variants

20. `lpc_terrain__icegrassaltother.png`
21. `lpc_terrain__lavagrassaltother.png`

These remain associated with frozen and volcanic environments respectively and are explicitly excluded from the swamp binding.

## Vegetation result

The repository does contain generic plant/dead-tree/fungi candidates from the broader WORLD set, including:

- `lpc-trees__trees-dead.png`
- `lpc-flowers-plants-fungi-wood__plants.png`
- `9__plant repack.png`
- `LPC_Submissions_Merged_2.0__plants.png`
- `tilesets_edit__3_plants.png`
- `lpc-jungle-v2__giant-fungi.png`

But none should automatically receive a SWAMP / MARSH vegetation binding solely because they could visually fit a wet biome.

The [LPC] Flowers / Plants / Fungi / Wood source contains flowers, bushes, small trees, mushrooms/fungi, leaves, stumps and logs. It is CC-BY-SA 3.0 and requires the contributors listed in CREDITS-plants.txt plus a source-page link. citeturn0search0turn0search1

## Important source finding

OpenGameArt's [LPC] Terrains ecosystem explicitly includes **bog** among its terrain tags/source contents, and the repacked Terrains release is licensed CC-BY-SA 4.0 and CC-BY-SA 3.0. citeturn0search15

However, the existence of a bog tile in the upstream pack does not prove that one of the repository binaries above is that exact tile. Therefore the repository remains provenance-pending until source path and binary identity are reconciled.

The LPC community's own biome discussion also treats wetlands (bog/swamp/marsh) as a distinct biome family, separate from grassland, forest, jungle, mountains and desert. citeturn0search14

## Canonical taxonomy

```text
WORLD
└── SWAMP / WETLANDS
    ├── TERRAIN
    │   ├── MUD / WET GROUND
    │   ├── BOG
    │   └── MARSH GRASS
    ├── WATER
    │   ├── BRACKISH
    │   └── SHALLOW WETLAND
    ├── VEGETATION
    │   ├── REEDS / MARSH PLANTS
    │   ├── WATER PLANTS
    │   ├── DEAD / WATERLOGGED TREES
    │   └── FUNGAL UNDERSTORY
    └── TRANSITIONS
        ├── WATER ↔ WET GRASS
        ├── WET GROUND ↔ GRASS
        └── WETLAND ↔ FOREST
```

## Current status

| Group | Explicit candidates | Status |
|---|---:|---|
| Brackish water | 1 | strong wetland candidate |
| Water-grass transitions | 2 | strong wetland candidate |
| Cold-water grass transitions | 2 | contextual, not swamp-specific |
| Generic dirt/grass | 6 | visual verification required |
| Holes/depressions | 8 | generic terrain mechanic |
| Frozen/volcanic variants | 2 | excluded from swamp |
| **Filename-scan total** | **21** | only a subset is swamp-specific |

## Asset Library implications

The Asset Library should expose wetland metadata separately from water:

- biome = SWAMP / WETLANDS
- terrain = mud / bog / marsh
- water type = brackish / shallow wetland
- vegetation = reeds / water plants / dead trees / fungi
- transition = wet-ground / water-grass / forest-wetland
- source family
- license
- attribution status
- binary verification status

This prevents a generic grass-water tile from being permanently labeled “swamp” while still allowing the World Builder to use it in a swamp biome.

## Approval rule

Final approval remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

Filename classification is not binary provenance proof.

## Next boundary

The next WORLD audit should be **SNOW BIOMES / TUNDRA / FROZEN LANDSCAPES**, including snow ground, frozen water, snowy forest, snow rocks and seasonal transitions, while preserving the previously established distinction between frozen water and ordinary snow terrain.
