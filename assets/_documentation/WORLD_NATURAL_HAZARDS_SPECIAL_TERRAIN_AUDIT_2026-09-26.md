# WORLD Natural Hazards & Special Terrain Audit — 2026-09-26

## Scope

Focused audit of natural terrain mechanics and hazards:
- lava;
- volcanic rock;
- waterfalls;
- natural holes / pits / depressions;
- cave tiles / cave terrain.

These remain WORLD because they describe natural environment mechanics. Buildings, docks, mines as structures, and other constructed regional assets remain REGION.

## Repository enumeration

A focused filename scan found **14 PNG candidates**.

### 1. Lava / volcanic terrain — strong

- `lpc_terrain__lava.png`
- `lpc_terrain__lavagrassaltother.png`
- `lpc_terrain__lavarock.png`

Classification:
- lava = natural hazardous surface/state;
- lava ↔ grass = specialized natural transition;
- lava rock = volcanic ground/rock.

These should remain connected to the Ground Transition graph but have a dedicated VOLCANIC / LAVA semantic family.

The official [LPC] Terrains source explicitly includes lava among its terrain materials and is designed for combinations/overlaps between terrain families. citeturn0search0

### 2. Waterfall — strong

- `tilesets_edit__5_waterfall.png`

This is a natural water feature, distinct from ordinary flowing-water tiles.

The [LPC Revised] 4-Season Terrain source explicitly contains an original 4-direction tiling waterfall and a frozen variant, under OGA-BY 3.0. citeturn0search1

A dedicated waterfall source also exists in the LPC ecosystem, but exact repository provenance remains pending until binary/source identity is reconciled.

### 3. Cave terrain — strong candidate

- `lpc-tileset-16x16__tileset_cave.png`
- `tilesets_edit__8_cave.png`

These are cave-sheet candidates.

They should be treated as natural cave terrain rather than REGION structures.

However, a cave **tile sheet** is not automatically a cave entrance/portal. The Asset Library should distinguish:
- cave interior terrain;
- cave wall;
- cave floor;
- cave opening / entrance;
- cave transition to surface.

The official [LPC] Caves source is CC0 and is explicitly based on LPC cave modifications, with original attribution directed to Lanea Zimmerman (Sharm). citeturn0search5

The separate [LPC] Cavern and ruin tiles pack includes cave-related tiles, animated water/lava, stone arcs, crystals, mine tracks and other material. It is CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0 and requires credits.txt. citeturn0search2

### 4. Natural holes / pits — terrain mechanics

- `lpc_terrain__hole.png`
- `lpc_terrain__holegrassaltother.png`
- `lpc_terrain__holek.png`
- `lpc_terrain__holekgrassaltother.png`
- `lpc_terrain__holelikegrassaltotheroverlay.png`
- `lpc_terrain__holelikegrassoverlay.png`
- `lpc_terrain__holemid.png`
- `lpc_terrain__holemidgrassaltother.png`

These are **not automatically caves**.

They should be modeled as:
- natural depression;
- pit/hole;
- hole ↔ grass transition;
- overlay/edge variant.

The older [LPC] Terrain Repack also explicitly includes hole and lava material and uses CC-BY-SA 3.0 / GPL 3.0, reinforcing that these are part of the terrain-mechanic layer rather than necessarily standalone biome assets. citeturn0search3

## Canonical taxonomy

```text
WORLD
└── SPECIAL TERRAIN / NATURAL HAZARDS
    ├── VOLCANIC
    │   ├── LAVA
    │   ├── LAVA ↔ GRASS
    │   └── LAVA ROCK
    ├── WATER FEATURES
    │   └── WATERFALLS
    │       ├── FLOWING
    │       └── FROZEN
    ├── NATURAL DEPRESSIONS
    │   ├── HOLES
    │   ├── PITS
    │   └── GRASS ↔ DEPRESSION
    └── CAVES
        ├── CAVE FLOOR
        ├── CAVE WALL
        ├── CAVE OPENING
        └── SURFACE ↔ CAVE
```

## Asset Library requirements

Special terrain records should support:
- feature_type;
- hazard_state;
- terrain_material;
- transition_from;
- transition_to;
- animation_state;
- frozen_variant;
- cave_role;
- surface_access;
- source_family;
- source_page;
- license;
- attribution_status;
- binary_verification_status.

Examples:

```text
lava
  feature_type = VOLCANIC_SURFACE
  hazard_state = HAZARDOUS

waterfall
  feature_type = WATER_FEATURE
  animation_state = FLOWING

hole
  feature_type = NATURAL_DEPRESSION
  surface_access = OPEN

cave_sheet
  feature_type = CAVE_TERRAIN
  cave_role = UNKNOWN_UNTIL_VISUAL_VERIFICATION
```

## Important boundary

Do not automatically classify:
- a hole as a cave entrance;
- a cave sheet as a mine;
- lava rock as a generic rock;
- a waterfall as ordinary flowing water;
- a cavern/ruin pack as a REGION building set.

Natural function and constructed context must remain separate.

## Provenance rule

Classification is not binary provenance approval.

Final approval remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

## Current conclusion

The repository has explicit candidates for volcanic terrain, waterfalls, natural depressions and cave sheets. The strongest exact semantic matches are the three lava files and the waterfall file. Cave role remains intentionally conservative until visual verification identifies whether the sheets contain floor, walls, openings or mixed cave elements.

## Next boundary

Proceed to **WORLD → Shorelines / Rivers / Lakes / Water Features**, consolidating flowing water, rivers, lakes, waterfalls, coastlines and deep/open/coastal water while preserving the existing water-state taxonomy.
