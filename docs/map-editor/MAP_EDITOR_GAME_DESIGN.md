# Vandrith Map Editor — Game Design & Data Schema

**Document status:** Design baseline / living schema  
**Scope:** Gameplay-facing design model for maps authored by the editor.

## 1. Design goal

The editor must represent a map as a structured world artifact rather than a flat image. Every authored element should have a clear role: terrain, object, collision, navigation, environment context, or metadata.

## 2. Map hierarchy

```text
World
└── Map
    ├── MapDocument
    │   ├── Ground layer
    │   ├── Objects layer
    │   └── Collision layer
    ├── Authoritative Versions
    ├── Save Slots (1..12)
    ├── Gameplay Cell Projection
    ├── Object Projection
    ├── Geometry Projection
    └── Navigation Projection
```

## 3. Map schema

### Map

| Field | Meaning |
|---|---|
| `id` | Stable map identity |
| `world_id` | Parent world |
| `location_id` | Optional location context |
| `settlement_id` | Optional settlement context |
| `building_id` | Optional building context |
| `name` | Designer-facing map name |
| `map_type` | Map category |
| `coordinate_mode` | Coordinate system/profile mode |
| `width` / `height` | Map dimensions |
| `tile_size` | Tile sizing |
| `metadata` | Extensible map metadata |
| `created_by` | Creator/owner identity where present |
| `coordinate_profile_id` | Optional coordinate profile |

## 4. MapDocument schema

The editor document is the high-fidelity authoring representation.

```text
MapDocument
├── version
├── id
├── name
├── mapType
├── width
├── height
├── tileSize
└── layers[]
    ├── id
    ├── name
    ├── kind
    ├── active
    ├── visible
    ├── locked
    ├── cells[]
    └── objects[] (where applicable)
```

The serialized envelope is:

```json
{
  "schema": "vandrith.map-document",
  "version": 1,
  "document": { "...": "MapDocument" }
}
```

## 5. Ground design

A ground cell represents terrain identity and its visual/gameplay state. The design must support:

- base terrain;
- terrain variant;
- seasonal variant;
- terrain asset binding;
- topology/mask information when needed;
- walkability/collision projection;
- environment-driven visual variants.

The current editor terrain palette includes Grass, Sand, Dirt, Pavement, and Water.

## 6. Object design

Objects are independent entities placed over the terrain grid.

Examples include:

- Cottage
- Shop
- Workshop
- Farm
- Warehouse
- Tower
- Wall
- Gate

An object has an identity, type/category, asset reference, transform, dimensions/footprint, collision/interactivity flags, and extensible properties.

## 7. Collision and navigation

Collision is authored as an editor concern but must become deterministic gameplay data.

The gameplay model distinguishes:

- collision blocked/unblocked;
- walkable/unwalkable;
- line-of-sight blocking where applicable;
- object geometry used for spatial calculations;
- navigation projection rebuilt from the authoritative map state.

## 8. Environment integration

The map design must remain compatible with the Vandrith environment system.

Relevant concepts:

```text
Season definitions
Weather definitions
Season rules
Season cycle rules
Season-weather rules
Weather transition policies
Terrain seasonal bindings
```

A map does not own the global weather simulation. It provides stable terrain/map context consumed by the environment runtime.

## 9. Version model

Every authoritative map state is associated with a version.

```text
Map
 ├── Version 1 → Snapshot
 ├── Version 2 → Snapshot
 ├── Version 3 → Snapshot
 └── ...
```

A version is immutable historical state. The latest version is the current authoritative state.

## 10. Save-slot model

Save slots are named recovery points into map history.

```text
Map 123
├── Slot 1 → Version 12 / Snapshot A
├── Slot 2 → Version 8  / Snapshot B
├── Slot 3 → Version 12 / Snapshot C
└── ...
```

The slot contains its own snapshot so that later map edits do not mutate the saved state.

## 11. Projection model

The editor document is high fidelity. Gameplay tables are projections.

```text
                 ┌── map_cells
                 ├── map_objects
MapDocument ─────┼── map_object_geometry
                 ├── navigation projection
                 └── runtime snapshot
```

A projection may be regenerated. The editor must never reconstruct the full document from a lossy projection if the authoritative snapshot is available.

## 12. Current relational schema facts

The connected Supabase database currently contains these relevant structures:

### `maps`

The current table includes UUID identity, world/location/settlement/building references, name, map type, coordinate mode, dimensions, tile size, metadata, creator, timestamps, and optional coordinate profile.

### `map_versions`

The current table includes:

- `id`
- `map_id`
- `version_number`
- `label`
- `snapshot` (`jsonb`)
- `created_by`
- `created_at`

### `map_editor_save_slots`

The current table includes:

- `id`
- `map_id`
- `slot_number`
- `label`
- `version_id`
- `version_number`
- `snapshot` (`jsonb`)
- `created_by`
- `created_at`
- `updated_at`

The current design supports twelve numbered slots.

### `map_cells`

The current table includes grid coordinates, elevation, biome, terrain/structural/decoration asset IDs, terrain variant, season variant, collision, walkable state, metadata, and timestamps.

### `map_objects`

The current table includes map/layer/asset/entity references, transform, z-index, collision/interactivity flags, footprint, properties, object type, width/height, line-of-sight blocking, and timestamps.

### `map_object_geometry`

The current table stores geometry type, center coordinates, half extents, rotation, object identity, and update timestamp.

## 13. Design invariants

1. One `map_id` identifies one map.
2. One version belongs to one map.
3. One save slot belongs to one map.
4. A slot snapshot is isolated from later edits.
5. Gameplay projections are derived from authoritative state.
6. Object identity is stable across saves unless an explicit delete/create occurs.
7. Coordinates must remain deterministic between editor and runtime.
8. Terrain identity must remain stable even when its seasonal/weather visual changes.
9. Loading a snapshot restores authoring state, not merely a rendered image.

## 14. Future extensions

The design leaves room for:

- biomes and climate zones;
- elevation/height maps;
- roads and rivers;
- portals and region links;
- spawn points;
- resource nodes;
- scripted triggers;
- points of interest;
- multi-region world composition.

These are extensions, not reasons to break the current persistence model.
