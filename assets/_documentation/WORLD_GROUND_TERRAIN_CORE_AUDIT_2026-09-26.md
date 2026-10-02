# WORLD Ground / Terrain Core Audit — 2026-09-26

## Scope

This audit establishes the foundational natural ground layer used by multiple WORLD biomes:
- grass;
- dirt / soil;
- stone / rocky ground;
- mud;
- beach / shoreline ground;
- ground transitions.

Previously audited biome-specific assets (desert sand, swamp wetland, snow, water, mountains, forest, etc.) are not reclassified merely because their filenames contain generic terrain words.

## Enumeration rule

A broad filename scan returned 144 PNG paths because generic terms such as `terrain`, `grass`, `dirt`, `sand`, and `rock` occur in many biome-specific and vegetation/landform sheets.

Therefore **144 is a discovery count, not a Ground Core asset count**.

The Ground Core classification below is conservative.

## Core candidates

### GRASS

Strong candidates:
- `LPC_Overworld__Grass.png`
- `lpc_terrain__grass.png`
- `lpc_terrain__grass_night.png`
- `lpc_terrain__grassalt.png`
- `lpc_terrain__grassgrassaltother.png`
- `lpc_terrain__tallgrass.png`

Notes:
- `grass_night` is a lighting/variant state, not a separate biome.
- `tallgrass` is better treated as ground vegetation/overlay metadata rather than the base ground material.
- `grassalt` and related alternatives require visual/source verification before deciding whether they are ordinary grass variants or source-specific alternatives.

### DIRT / SOIL

Strong candidates:
- `lpc_terrain__dirt.png`
- `lpc_terrain__dirt2.png`
- `lpc_terrain__dirt_night.png`
- `tilesets_edit__10_dirt.png`

These belong to the generic ground family unless later evidence proves a biome-specific role.

### BEACH / SHORE GROUND

Candidate:
- `LPC_Overworld__Beach.png`
- `tilesets_edit__9_beach.png`

Beach remains a transition-oriented ground type rather than simply another desert tile. It can occur at coastlines and should connect to the existing COASTAL / SHALLOW water taxonomy.

### STONE / ROCKY GROUND

Potential candidates exist in:
- `lpc-tileset-16x16__tileset_basic_terrain.png`
- `lpc-tileset-16x16__tileset_other.png`
- `LPC_Terrain__terrain.png`
- `lpc-terrains__terrain-v7.png`
- `terrain__terrain.png`
- `tiled__terrain-map-v7.png`
- `11__terrain2.png`
- `LPC_Modifed_Art__Tiles.png`
- `tilesets_edit__1_terrain.png`

These are **sheet-level candidates**, not automatically approved stone binaries. Their exact tile regions must be visually/source verified.

### MUD

The repository does not currently expose a filename-explicit `mud.png` binary in this staging path.

This does NOT mean the LPC terrain source lacks mud. The official [LPC] Terrains page explicitly lists mud among its terrain types and explains that the set combines grass, dirt, rock, stone, mud, water, snow, ice, lava, sand and beach materials. citeturn0search0

Therefore:
- mud remains a canonical WORLD Ground Core subtype;
- current binary binding remains pending unless a source tile can be reconciled to a repository binary;
- generic dirt is not silently relabeled as mud.

## Transition taxonomy

Ground transitions should be metadata-driven:

```text
GROUND
├── GRASS
├── DIRT / SOIL
├── STONE / ROCKY GROUND
├── MUD / WET SOIL
├── BEACH / SHORE
└── TRANSITIONS
    ├── GRASS ↔ DIRT
    ├── GRASS ↔ STONE
    ├── GRASS ↔ BEACH
    ├── DIRT ↔ BEACH
    ├── DIRT ↔ WATER
    ├── GRASS ↔ WATER
    └── GROUND ↔ BIOME-SPECIFIC SURFACE
```

Existing biome-specific transition families remain authoritative:
- sand ↔ grass / water → DESERT / COAST;
- snow ↔ grass / water → SNOW;
- water ↔ grass → wetland/shore context;
- ice ↔ snow / water → FROZEN;
- brackish ↔ wet grass → SWAMP / WETLANDS.

## Source findings

### [LPC] Terrains

The official source is a foundational terrain collection and explicitly covers grass, dirt, rock, stone, cobblestone, mud, water, snow, ice, lava, sand and beach. It also includes terrain-map tooling intended to combine multiple materials in one layer. citeturn0search0

Its attribution is multi-author and requires the authors listed in CREDITS-terrain.txt plus a link back to the OpenGameArt page. citeturn0search0

### [LPC] Terrains Repacked

The repacked 4096×4096 version is explicitly described as a repack of the LPC Terrains collection, with no new art, and carries the same attribution requirements. citeturn0search1

### [LPC] Overworld

The Overworld pack contains grass, sand/desert, snow, water, paths, rivers and other overworld components. Its grass and water are based on Lanea Zimmerman, while sand and snow have their own upstream attribution chain. citeturn0search2

### Older LPC Terrain Repack

The older [LPC] Terrain Repack contains terrain material from the LPC contest / LPC Tile Atlas and uses CC-BY-SA 3.0 and GPL 3.0. Because it is a repack with inherited credits, exact binary identity must be verified before attributing an individual current PNG to this source. citeturn0search8

## Canonical WORLD Ground Core

```text
WORLD
└── GROUND
    ├── 01_GRASS
    │   ├── BASE
    │   ├── ALTERNATIVE
    │   ├── NIGHT / LIGHTING
    │   └── TALL GRASS
    ├── 02_DIRT
    │   ├── BASE
    │   ├── VARIANT
    │   └── NIGHT / LIGHTING
    ├── 03_SAND
    │   └── handled with existing DESERT taxonomy
    ├── 04_STONE
    │   └── binary verification pending
    ├── 05_MUD
    │   └── source confirmed, binary binding pending
    ├── 06_BEACH
    │   └── coastal ground / shoreline
    └── 07_GROUND_TRANSITIONS
        ├── GRASS ↔ DIRT
        ├── GRASS ↔ STONE
        ├── GROUND ↔ BEACH
        └── GROUND ↔ WATER
```

## Asset Library requirements

Every Ground Core record should support:
- material;
- variant;
- biome compatibility;
- transition_from;
- transition_to;
- source_family;
- source_page;
- license;
- attribution_status;
- binary_verification_status.

A single binary may support multiple compatible biomes through metadata, but it should not be duplicated physically.

## Approval rule

Ground classification is not license approval.

Final binary approval remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

## Current conclusion

The repository already has a strong grass/dirt/beach foundation. Stone and mud are present at the **source-family level**, but their exact repository binary bindings should remain conservative until visual/source reconciliation is completed.

## Next boundary

Proceed to **WORLD → Ground Transitions / Edge & Blend Library**, where the actual transition sheets can be catalogued separately from base materials. This will be useful for the future World Builder Asset Library because users can browse a base tile and its compatible transition tiles as one logical family.
