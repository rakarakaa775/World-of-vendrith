# WORLD Desert / Desert Vegetation Audit — 2026-09-26

## Scope

Focused audit of desert-related natural environment binaries in the current WORLD repository.

The canonical model separates:
- DESERT TERRAIN — sand, red sand, dunes/hills and transitions;
- DESERT ROCK FORMATIONS;
- DESERT WATER TRANSITIONS;
- DESERT VEGETATION — cactus, dry plants, desert trees, succulents and similar flora.

No binary is duplicated merely to satisfy these logical bindings.

## Repository enumeration

The current WORLD terrain staging path contains exactly **17 PNGs** whose filenames indicate desert/sand semantics.

### Desert terrain

1. `LPC_Overworld__Sand.png`
2. `lpc_terrain__sand.png`
3. `lpc_terrain__redsand.png`
4. `lpc_terrain__sandredsand.png`

**Binding:** WORLD / DESERT / TERRAIN.

### Desert terrain transitions

5. `LPC_Overworld__Sand Grass Transitions.png`
6. `lpc_terrain__sandwater.png`
7. `lpc_terrain__sandredsandwater.png`
8. `lpc_terrain__redsandwater.png`
9. `lpc_terrain__coldwatersandother.png`
10. `lpc_terrain__coldwaterredsandother.png`
11. `lpc_terrain__icesandother.png`
12. `lpc_terrain__iceredsandother.png`
13. `lpc_terrain__watersandother.png`
14. `lpc_terrain__waterredsandother.png`

These remain primarily **WATER / transition bindings** where water is part of the tile, with desert/sand as the adjacent terrain. They should not be treated as standalone desert vegetation.

### Desert landforms / rocks

15. `LPC_Overworld__Hills Desert.png`
16. `LPC_Overworld__Rocks Desert.png`
17. `LPC_Overworld__Water Cliff Sand.png`

Bindings:
- Hills Desert → WORLD / HILLS / DESERT variant.
- Rocks Desert → WORLD / NATURAL ROCK FORMATIONS / DESERT variant.
- Water Cliff Sand → WORLD / CLIFFS / WATER-SIDE DESERT-SAND variant.

These are intentionally not duplicated into a separate generic DESERT folder.

## Desert vegetation result

The current WORLD terrain staging tree contains **no filename-explicit cactus/desert-vegetation PNG**.

This does **not** mean the repository has no desert vegetation anywhere. It means the current canonical WORLD terrain staging path does not contain a binary whose filename is sufficient to identify a dedicated desert vegetation sheet.

The official [LPC] Beach / Desert source explicitly contains cacti, desert plants, dry/knarled trees, bones and sandy formations. It is CC-BY-SA 3.0 and requires all authors in `CREDITS-beach-desert.txt` plus a link to the source page. citeturn0search0turn0search1

Therefore the project should **not invent a repository desert-vegetation mapping** until a matching binary is located and reconciled.

## Source boundaries

### [LPC] Beach / Desert

OpenGameArt describes this as a sandy-place pack for beaches/deserts containing shells, cacti, desert plants, dry-looking trees, bones and sandy formations. The actual sand is not included in that pack; its preview uses separate sand and water sources. License: CC-BY-SA 3.0. Attribution must follow `CREDITS-beach-desert.txt` and include a link to the source page. citeturn0search0

This distinction matters: **Beach / Desert vegetation is a separate source family from [LPC] Terrains sand tiles.**

### [LPC] Terrains

The terrain pack covers sand, beach, bog, grass, dirt, rock, water, snow, ice and other ground materials. It is CC-BY-SA 4.0 and CC-BY-SA 3.0 with its multi-author attribution requirements. citeturn0search2

Therefore:
- sand terrain → can be bound to the Terrains family where exact source identity is verified;
- cactus/desert flora → should not inherit the Terrains license/credits merely because it is placed on sand.

### [LPC] Overworld

The Overworld source includes desert terrain, desert hills, forests, mountains, rocks and other terrain, but also contains structures, ships, docks, sea creatures and banners. It is CC-BY-SA 3.0 and GPL 3.0. citeturn0search4

Thus the repository's Overworld desert natural tiles remain WORLD, while man-made components remain outside WORLD.

## Canonical taxonomy

```text
WORLD
└── DESERT
    ├── TERRAIN
    │   ├── SAND
    │   ├── RED SAND
    │   └── SAND TRANSITIONS
    ├── LANDFORMS
    │   ├── DESERT HILLS
    │   ├── DESERT ROCKS
    │   └── SAND CLIFFS
    ├── WATER TRANSITIONS
    └── VEGETATION
        ├── CACTUS
        ├── SUCCULENTS
        ├── DRY SHRUBS
        └── DESERT TREES
```

## Provenance status

| Group | Count | Status |
|---|---:|---|
| Desert terrain | 4 | source-family candidates; exact binary verification pending |
| Desert/water transitions | 10 | mixed terrain/water bindings; exact source verification pending |
| Desert landforms | 3 | [LPC] Overworld family candidates; exact binary verification pending |
| Dedicated desert vegetation in WORLD terrain staging | 0 | no filename-explicit binary found |
| **Total desert/sand candidates** | **17** | none automatically approved |

## Approval rule

Final Asset Library approval remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

Filename semantics are useful for candidate classification but do not establish exact binary provenance.

## Asset Library implications

The World Building Asset Library should expose:
- biome = DESERT;
- role = terrain / transition / landform / vegetation;
- vegetation subtype = cactus / succulent / shrub / desert tree;
- water adjacency = coastal / oasis / none where verified;
- source family;
- license;
- attribution status;
- binary verification status.

This lets the World Builder show desert terrain and vegetation as separate filters while reusing one canonical binary.

## Next audit boundary

Because no dedicated desert vegetation binary was found in the current WORLD terrain staging path, the next step should be **WORLD → Swamp / Wetlands**, rather than inventing or importing a desert-vegetation classification from external sources.
