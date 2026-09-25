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

## Optional extension: FANTASY / ISEKAI WORLD

These categories are **optional** and must only be used when the actual Vandrith setting requires fantasy/isekai phenomena. They do not replace the normal WORLD categories.

```text
01_WORLD
├── 01_GROUND
├── 02_WATER
├── 03_MOUNTAINS
├── 04_HILLS
├── 05_CLIFFS
├── 06_NATURAL_ROCK_FORMATIONS
├── 07_FOREST
├── 08_JUNGLE
├── 09_DESERT
├── 10_SWAMP
├── 11_SNOW_BIOMES
└── 12_FANTASY_NATURE                 [OPTIONAL]
    ├── 01_MAGIC_CRYSTALS
    ├── 02_ENCHANTED_FOREST
    ├── 03_MAGICAL_GROUND
    ├── 04_MAGICAL_WATER
    ├── 05_FLOATING_ISLANDS
    ├── 06_MAGICAL_CAVERNS
    ├── 07_MAGICAL_ROCK_FORMATIONS
    └── 08_FANTASY_NATURAL_PHENOMENA
```

### What belongs here

- **Magic crystals** when they are naturally occurring environmental formations.
- **Enchanted forests** when the asset changes the natural environment rather than representing a building/location.
- **Magical ground** such as corrupted, glowing, rune-like or mana-infused terrain.
- **Magical water** when the effect is part of the natural environment.
- **Floating islands** when they are terrain/island formations.
- **Magical caverns** when the asset represents natural cave/environmental formations.
- **Fantasy natural phenomena** such as unusual glowing terrain, magical vegetation or other non-constructed environmental formations.

A source such as *The Field of the Floating Islands* is a useful provenance candidate because it explicitly provides floating-island terrain and is CC0; however, it remains a **source candidate**, not a verified repository binary. citeturn1search8

OpenGameArt also has CC0 crystal assets that can be candidates for naturally occurring fantasy crystals. citeturn1search2turn1search9

### Important boundary

Do **not** put the following into WORLD merely because they look magical:

- Teleport circles
- Summoning circles
- Shrines
- Altars
- Magic gates
- Portals
- Towers
- Temples
- Fantasy houses
- Villages/cities
- Dungeon entrances built by civilization

Those are constructed/location elements and belong to REGION, PLAYABLE, INTERIOR, or another appropriate system according to their actual role.

### Isekai-specific rule

An **isekai setting does not automatically require modern-world assets**. Modern cars, roads, streetlights, power infrastructure, phones, computers, buildings and other Earth-origin objects should only be added when the setting explicitly contains them.

They should remain classified by their actual asset role rather than being placed into WORLD simply because they are "isekai".

## Fantasy/isekai provenance candidates

The following are research candidates only:

| Candidate | Possible role | Evidence | Status |
|---|---|---|---|
| The Field of the Floating Islands | WORLD/12_FANTASY_NATURE/05_FLOATING_ISLANDS | CC0; terrain includes grass, rock, water and trees | ⚠️ source candidate |
| Crystals | WORLD/12_FANTASY_NATURE/01_MAGIC_CRYSTALS | CC0 | ⚠️ source candidate |
| [LPC] Cavern and ruin tiles | Extract only natural cave/crystal/environment elements | CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0; includes crystals and magical circles | ⚠️ source candidate; mixed-role pack |
| Mythical Ruins Tileset | Natural/exterior fantasy terrain where applicable | CC0 | ⚠️ source candidate; mixed exterior/interior/ruins |
| Forest Tilemap | WORLD fantasy forest/natural environment | CC0 | ⚠️ source candidate |

The *[LPC] Cavern and ruin tiles* package is especially important to split carefully: its source contains caves, water/lava, crystals, magical circles, statues, tracks and coffins, so only the natural environmental elements can enter WORLD. citeturn0search3

**No fantasy/isekai candidate becomes repository-approved until the same provenance rules used for normal WORLD assets are satisfied: source/package match, binary identity, license/credit verification and checksum where the binary is available.**

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