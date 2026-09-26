# WORLD Shorelines, Rivers, Lakes & Water Features Audit — 2026-09-26

## Scope

This audit separates **water state** from **water feature**.

Water state remains:
- COASTAL / SHALLOW
- OPEN
- DEEP
- BRACKISH
- COLD
- FROZEN

Water feature is a contextual role:
- SHORELINE
- RIVER
- LAKE
- WATERFALL
- OCEAN / SEA

A river can therefore be OPEN, COLD or BRACKISH depending on its context. A lake can be shallow, open, deep, cold or frozen. This prevents unnecessary binary duplication.

## Repository scan

A filename-focused search returned **40 matches**, but several were false positives because filenames such as tree/flower/rock assets contain water-related words. The conservative water-feature candidates are:

### River

- `LPC_Overworld__River.png`

Status: **strong semantic candidate** for WORLD / WATER FEATURES / RIVER.

This is not promoted to a new water state. It uses the existing water-state taxonomy as metadata.

### General water

- `LPC_Overworld__Water.png`
- `lpc-tileset-16x16__tileset_water.png`
- `lpc-tileset-16x16__tileset_water_animated.png`
- `lpc_terrain__water.png`

These are general water candidates. Exact feature role remains tilesheet/visual dependent.

### Depth

- `lpc_terrain__deepwater.png`
- `lpc_terrain__deepwater2.png`

Status: **DEEP WATER**.

These remain part of the water-state system rather than being assigned to ocean/lake/river solely from filename.

### Coastal / shoreline

- `LPC_Overworld__Beach.png`
- `tilesets_edit__9_beach.png`
- sand/water transition families already audited

Beach is treated as the **shore/land transition context**. It does not replace COASTAL / SHALLOW water.

### Brackish

- `lpc_terrain__brackish.png`

Status: **BRACKISH WATER**.

This remains especially useful for estuary, marsh and other transitional wetland contexts.

### Cold water

- `lpc_terrain__coldwater.png`
- associated coldwater↔ground/snow transition families

Status: **COLD WATER**.

### Waterfall

- `tilesets_edit__5_waterfall.png`

Already audited under Natural Hazards / Special Terrain.

Status: **WATERFALL feature**, not a new water state.

## Lakes

No filename-explicit `lake.png` binary was promoted in this audit.

This is intentional.

A lake is a **geographic feature**, while the water surface itself may use:
- open water;
- deep water;
- shallow/coastal water;
- cold water;
- frozen water.

Therefore the Asset Library should allow:

`water_feature = LAKE`

without requiring a separate `lake_water.png` binary.

## Ocean / sea

Likewise, no separate ocean/sea state is required.

Use:

`water_feature = OCEAN` or `SEA`

plus:

`water_state = COASTAL | OPEN | DEEP | COLD | FROZEN`

This supports the desired distinction between near-shore water and deep sea without duplicating binaries.

## Rivers

River should be modeled as a feature with flow metadata:

- flow_direction;
- flow_strength;
- width_class;
- bank_type;
- source_type;
- mouth_type;
- rapids;
- waterfall_connection.

Example:

```text
RIVER
├── SHALLOW RIVER
├── NORMAL RIVER
├── DEEP RIVER
├── COLD RIVER
└── RAPIDS / WATERFALL
```

These are metadata compositions, not necessarily separate image families.

## Shoreline

Shoreline should be modeled as an edge/transition:

```text
LAND
  ↕
SHORELINE
  ↕
COASTAL / SHALLOW WATER
  ↕
OPEN WATER
  ↕
DEEP WATER
```

The existing transition library should remain the implementation layer for these boundaries.

## Visual behavior

OpenGameArt's LPC water resources distinguish animated water and waterfalls, while discussion around LPC water explicitly distinguishes still pond behavior, flowing river behavior, depth/transparency, and shore-edge movement. citeturn0search1turn0search11

The implication for Vendrith is that water should not be represented by a single generic animated texture.

## Asset Library schema

Recommended fields:

- `water_state`
- `water_feature`
- `depth_class`
- `flow_class`
- `flow_direction`
- `shore_type`
- `bank_material`
- `transition_id`
- `animation_state`
- `season_state`
- `source_family`
- `source_page`
- `license`
- `attribution_status`
- `binary_verification_status`

Example:

```text
asset = LPC_Overworld__River.png
water_feature = RIVER
water_state = UNKNOWN
flow_class = FLOWING
binary_verification = PENDING
```

This deliberately avoids inventing whether the source binary represents shallow, normal or deep river water.

## Important provenance rule

A filename establishes a candidate semantic role, not final source provenance.

Final provenance remains:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

## Final taxonomy

```text
WORLD
└── WATER
    ├── STATES
    │   ├── COASTAL / SHALLOW
    │   ├── OPEN
    │   ├── DEEP
    │   ├── BRACKISH
    │   ├── COLD
    │   └── FROZEN
    │
    ├── FEATURES
    │   ├── SHORELINE
    │   ├── RIVER
    │   ├── LAKE
    │   ├── WATERFALL
    │   └── OCEAN / SEA
    │
    └── TRANSITIONS
        ├── LAND ↔ WATER
        ├── SHALLOW ↔ OPEN
        ├── OPEN ↔ DEEP
        ├── WATER ↔ SNOW
        ├── WATER ↔ ICE
        └── WET GROUND ↔ WATER
```

## Conclusion

The water architecture is now **state + feature + transition**, rather than a flat folder list.

This preserves the user's required visual distinction between near-shore and deep sea while allowing the same verified water binaries to serve rivers, lakes and ocean contexts without duplication.
