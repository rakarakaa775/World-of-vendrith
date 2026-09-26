# Vendrith WORLD Asset Audit

**Status:** WORLD classification and provenance audit complete; binary repository transfer remains pending where the binary blob has not been individually verified.

## Scope
WORLD contains natural environment and macro-terrain only: ground and terrain materials, water, mountains, hills, cliffs, natural rock formations, forests, jungle, desert environment, swamp environment, and snow/ice biomes.

Man-made structures such as bridges, docks, ships, houses, villages, towns, cities, castles and ruins belong to REGION, not WORLD.

Living entities are handled by the separate Life Generation system and are not classified as ordinary WORLD assets.

## Canonical WORLD structure
```text
01_WORLD
├── 01_GROUND
│   ├── 01_GRASS
│   ├── 02_DIRT
│   ├── 03_SAND
│   ├── 04_STONE
│   ├── 05_MUD
│   ├── 06_BEACH
│   └── 07_GROUND_TRANSITIONS
├── 02_WATER
│   ├── 01_COASTAL_WATER
│   ├── 02_NORMAL_WATER
│   ├── 03_DEEP_WATER
│   ├── 04_WATER_TRANSITIONS
│   ├── 05_FLOWING_WATER
│   └── 06_FROZEN_WATER
├── 03_MOUNTAINS
├── 04_HILLS
├── 05_CLIFFS
├── 06_NATURAL_ROCK_FORMATIONS
├── 07_FOREST
├── 08_JUNGLE
├── 09_DESERT
├── 10_SWAMP
└── 11_SNOW_BIOMES
```


## World style rule: MEDIEVAL FANTASY ONLY

Vandrith World uses a **medieval-fantasy visual and technological baseline**. Fantasy elements may be added when they fit the setting, but modern/industrial-world assets are excluded unless the project explicitly changes this rule.

### Allowed

- Medieval natural environments and terrain
- Fantasy natural environments
- Magical natural phenomena
- Medieval/fantasy materials and scenery
- Floating islands, magical crystals, enchanted forests and similar fantasy nature when appropriate

### Excluded from WORLD

- Modern city terrain
- Asphalt highways and modern road surfaces
- Modern urban landscaping
- Industrial/sci-fi terrain
- Airport/runway environments
- Modern infrastructure
- Contemporary urban props
- Modern vehicles and machines
- Modern/industrial watercraft

Fantasy does **not** mean "anything unusual is allowed". The asset must still fit the medieval-fantasy world and the WORLD natural-environment role.

## Provenance register

| WORLD area | Source evidence | License / attribution | Audit state |
|---|---|---|---|
| Ground: grass/dirt/stone/mud/bog/sand/beach | [LPC] Terrains | CC-BY-SA 4.0 + CC-BY-SA 3.0; retain source attribution | Source verified; exact binary mapping pending unless separately recorded |
| Sand + deep water | [LPC] Colorful Sand + Deep Water! | CC-BY-SA 3.0 + GPL 3.0; attribution required | Source verified; exact binary mapping pending |
| Water animation / waterfalls | [LPC] Animated Water and waterfalls | CC-BY-SA 3.0; retain LPC attribution | Source verified; exact binary mapping pending |
| Water transitions / deep-water transitions | [LPC] More Water Transitions | GPL 3.0 + CC-BY-SA 3.0; original author attribution required | Source verified; exact binary mapping pending |
| Mountains / hills / cliffs / rocks | [LPC] Mountains | CC-BY-SA 4.0 + CC-BY-SA 3.0; retain CREDITS-mountains.txt attribution | Source verified; exact binary mapping pending |
| LPC mountains/cliffs alternate source | LPC cliffs/mountains with grass top and more! | CC-BY-SA 3.0 / GPL 3.0; retain component attribution | Source verified; exact binary mapping pending |
| Forest | [LPC] Forest tiles | Multi-license LPC source; retain credits.txt | Source verified; exact binary mapping pending |
| Jungle | [LPC] Jungle | Current source: CC-BY 4.0; use the applicable version's attribution | Source verified; exact binary mapping pending |
| Desert environment | [LPC] Beach / Desert and LPC terrain sources | CC-BY-SA 3.0 for Beach / Desert; sand source must be credited separately | Source verified; exact binary mapping pending |
| Swamp terrain | [LPC] Terrains | CC-BY-SA 4.0 + CC-BY-SA 3.0 | Terrain source verified; swamp-specific vegetation remains review pending |
| Snow / seasonal terrain | [LPC] Overworld; [LPC Revised] 4-Season Terrain | Source-specific attribution; 4-Season Terrain uses OGA-BY 3.0 | Source verified; exact binary mapping pending |
| Frozen water | Frozen Lake [LPC]; LPC Terrains adaptation | CC-BY 3.0 for Frozen Lake source; preserve attribution | Source verified; exact binary mapping pending |

## Existing repository-approved terrain records
The repository's assets/_documentation/ASSET_LIBRARY_REGISTRY.md already records individually verified originals for assets/map-editor/terrain/tile_grass.png and assets/map-editor/terrain/tile_dirt.png.

It also records tile_sand.png and tile_water.png as approved registry records while explicitly keeping their binary repository status pending until checksum and binary transfer are verified.

## Audit rules
1. Finding an OpenGameArt source does not by itself prove that a repository binary came from that source.
2. A binary becomes repository-present only after binary content, repository path, provenance/license, registry identity and checksum are verified.
3. Original attribution/readme/license files must remain available with the relevant source record.
4. Mixed packs such as [LPC] Overworld must be split logically: natural terrain goes to WORLD; buildings, docks, ships, towns and similar structures go to REGION.
5. One canonical asset may be reused by multiple biomes without duplicating its provenance record.
6. Unknown or unverified provenance remains review-pending and is never assigned a guessed creator/license.

## Important binary-transfer limitation
The current GitHub connector can create/update UTF-8 documentation files but does not provide a verified binary upload path for the supplied large asset libraries. Therefore this audit document records classification and provenance without falsely claiming that every WORLD binary has already been transferred into GitHub.

## Next stage
WORLD is now the completed classification/audit unit. REGION can be audited as a separate unit after the WORLD documentation is accepted.

## Primary source pages
- https://opengameart.org/content/lpc-terrains
- https://opengameart.org/content/lpc-colorful-sand-deep-water
- https://opengameart.org/content/lpc-animated-water-and-waterfalls
- https://opengameart.org/content/lpc-more-water-transitions
- https://opengameart.org/content/lpc-mountains
- https://opengameart.org/content/lpc-cliffsmountains-with-grass-top-and-more
- https://opengameart.org/content/lpc-forest-tiles
- https://opengameart.org/content/lpc-jungle
- https://opengameart.org/content/lpc-beach-desert
- https://opengameart.org/content/lpc-overworld-0
- https://opengameart.org/content/lpc-revised-4-season-terrain
- https://opengameart.org/content/frozen-lake-lpc

## LPC Terrains focused audit — 2026-09-26

The repository contains exactly **59** `lpc_terrain__*.png` binaries in the WORLD terrain staging path. Their classification is locked in `LPC_TERRAINS_WORLD_AUDIT_2026-09-26.md`.

For water, the canonical taxonomy is:

- **Coastal / Shallow** — transition tiles involving sand, red sand or grass.
- **Open Water** — `lpc_terrain__water.png`.
- **Deep Water** — `lpc_terrain__deepwater.png`, `lpc_terrain__deepwater2.png`.
- **Brackish** — `lpc_terrain__brackish.png`.
- **Cold Water** — `coldwater*` and related cold-water transitions.
- **Frozen / Ice** — `ice*` and `snowice`, without assuming sea-ice origin.

The six `tileset01a-f` files remain source-tileset candidates pending visual/source verification. This prevents filename-based overclassification.

This focused audit is metadata-only: no PNG duplication or relocation is required. Provenance and checksum approval remain controlled separately.


## Natural landforms focused audit — 2026-09-26

A filename-level audit now covers **23 natural landform binaries** staged under WORLD terrain:
- 9 mountain-related
- 3 hills
- 4 cliffs
- 7 natural rocks

The detailed classification and provenance boundaries are recorded in `WORLD_MOUNTAINS_HILLS_CLIFFS_ROCKS_AUDIT_2026-09-26.md`.

Important provenance separation:
- ordinary [LPC] Mountains → CC-BY-SA 4.0 / CC-BY-SA 3.0 source family;
- Mountains from The Mana World → separate GPL 2.0 source family;
- [LPC] Overworld → separate CC-BY-SA 3.0 / GPL 3.0 source family;
- [LPC] Rocks → separate multi-author CC-BY-SA source family;
- grass-topped cliff/mountain derivatives → separate source record until binary identity is confirmed.

Filename classification is not binary provenance approval. Ambiguous assets remain pending exact source/binary verification.
