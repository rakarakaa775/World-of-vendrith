# WORLD Vegetation Ecology Audit — 2026-09-26

## Scope

This audit separates **vegetation assets** from ground materials and biome transitions.

Grass terrain remains under WORLD/GROUND. Vegetation records represent plants, trees, fungi, shrubs, dead vegetation and biome-specific plant life.

A single binary may be compatible with multiple biomes through metadata; it must not be copied merely to create biome folders.

## Repository enumeration

Filename-focused scan returned **52 candidates**. After filtering terrain transitions and generic grass materials, the vegetation candidates fall into these logical families.

### Forest / woodland

Strong candidates include:

- `LPC_forest__forest_tiles.png`
- `LPC_Overworld__Forest.png`
- `LPC_Overworld__Forest Snowy.png`
- `lpc-trees__trees-green.png`
- `lpc-trees__trees-brown.png`
- `lpc-trees__trees-orange.png`
- `lpc-trees__trees-pale.png`
- `lpc-trees__trees-dead.png`

The exact distinction between woodland and conifer is not inferred from generic filenames. A tree is only promoted to CONIFER when source/binary evidence establishes it.

### Seasonal / snow vegetation

- `8__LPCSeasonedTrees.png`
- `8__LPCsnowTrees.png`
- `LPC_Overworld__Forest Snowy.png`

These receive seasonal/snow metadata rather than being duplicated into a separate forest binary family.

### Orchard / fruit trees

- `AppleTree_allSeasons.png__AppleTree_allSeasons.png`
- `lpc-fruit-trees__fruit-trees.png`
- `10__orangetrees.png`

These are agricultural/orchard vegetation, but remain WORLD vegetation when representing natural or environmental plant scenery. If later used as actively cultivated farm content, the semantic layer can additionally tag them as AGRICULTURAL.

### Jungle

- `lpc-jungle__jungle.png`
- `lpc-jungle-v2__giant-fungi.png`
- `lpc-jungle-v2__giant-plants.png`
- `lpc-jungle-v2__giant-trees.png`
- `lpc-jungle-v2__viney-trees.png`

The official [LPC] Jungle page describes giant plants, giant fungi and edited jungle content and requires the source credits file plus a link to the source page. citeturn0search5

### Plants / understory / fungi / wood

- `lpc-flowers-plants-fungi-wood__plants.png`
- `LPC_Submissions_Merged_2.0__plants.png`
- `LPC_Submissions_Merged_2.0__cherry_blossom_trees.png`
- `LPC_Submissions_Merged_2.0__whitheredtree by Barbara Rivera.png`
- `tilesets_edit__3_plants.png`
- `9__plant repack.png`
- `3__flower.png`
- `3__flower_only.png`
- `assets__man_eater_flower.png`

The official [LPC] Flowers / Plants / Fungi / Wood collection includes flowers, bushes, small trees, mushrooms/fungi, leaves, stumps and logs. It is CC-BY-SA 3.0 and requires the credits file and source link. citeturn0search18

Repacked/submission sheets remain provenance-pending unless their exact source/binary identity is established.

### Desert vegetation

No current staging binary was promoted solely by filename to a dedicated CACTUS/SUCCULENT family.

The official [LPC] Beach / Desert source explicitly contains cacti, desert plants and dry-looking trees, but source availability alone is not evidence that a specific repository PNG came from that pack. citeturn0search0turn0search1

Therefore:

`DESERT / VEGETATION = source-supported family, repository binary pending`

### Swamp / wetland vegetation

No filename-only candidate is strong enough to create a dedicated swamp vegetation family.

Existing plant/fungi families can later receive:

`compatible_biome = SWAMP`

when visual/source verification supports it.

### Aquatic / shoreline vegetation

No dedicated aquatic plant binary was promoted from the filename scan. Water-related transition sheets remain WATER transitions, not vegetation.

## Canonical ecology taxonomy

```text
WORLD
└── VEGETATION
    ├── FOREST
    │   ├── WOODLAND / DECIDUOUS
    │   ├── CONIFER
    │   ├── SEASONAL
    │   └── DEAD TREES
    │
    ├── JUNGLE
    │   ├── GIANT TREES
    │   ├── VINEY TREES
    │   ├── GIANT PLANTS
    │   └── GIANT FUNGI
    │
    ├── UNDERSTORY
    │   ├── FLOWERS
    │   ├── BUSHES
    │   ├── FERNS / LOW PLANTS
    │   └── FUNGI
    │
    ├── ORCHARD / FRUIT
    │   ├── APPLE
    │   ├── ORANGE
    │   └── OTHER FRUIT
    │
    ├── DESERT
    │   ├── CACTUS
    │   ├── SUCCULENTS
    │   ├── DRY SHRUBS
    │   └── DESERT TREES
    │
    ├── WETLAND
    │   ├── REEDS / MARSH PLANTS
    │   ├── WATER PLANTS
    │   └── WATERLOGGED VEGETATION
    │
    └── SPECIAL
        ├── MAGICAL PLANTS
        ├── GIANT PLANTS
        └── MAN-EATING / HAZARDOUS PLANTS
```

## Biome compatibility model

Vegetation should use compatibility metadata instead of binary duplication.

Example:

```text
asset = lpc-flowers-plants-fungi-wood__plants.png

vegetation_family = UNDERSTORY
compatible_biome =
  FOREST
  JUNGLE
  SWAMP
  MEADOW

source_family = LPC Flowers / Plants / Fungi / Wood
binary_verification = PENDING
```

The same verified binary can therefore appear in multiple World Builder biome palettes without being copied.

## Provenance model

Source family and semantic classification do not equal binary provenance.

The final approval chain remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

The LPC outdoor collections themselves combine Trees, Flowers/Plants/Fungi/Wood, Jungle, Conifers, Beach/Desert and terrain packs, but OpenGameArt warns that generated collection credits should still be checked against the actual distributed assets. citeturn0search9turn0search3

## Important exclusions

These remain outside VEGETATION:

- grass tiles → GROUND;
- grass/water transitions → WATER transition layer;
- sand/grass transitions → GROUND transition layer;
- cliff grass tops → CLIFF / transition;
- water plants not visually verified → pending;
- modern/industrial plants → excluded by WORLD medieval-fantasy scope.

## Conclusion

The vegetation system should be implemented as:

`VEGETATION FAMILY + BIOME COMPATIBILITY + SEASON + ECOLOGY ROLE + PROVENANCE`

rather than physically duplicated folders.

The repository has strong evidence for forest, seasonal trees, orchard/fruit trees, jungle, plants, flowers, fungi and dead vegetation. Dedicated desert and wetland vegetation remain source-supported but binary-pending where filename evidence is insufficient.
