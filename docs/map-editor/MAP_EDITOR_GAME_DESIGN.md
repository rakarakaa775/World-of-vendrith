# Vandrith Map Editor — Game Design & Data Schema

**Document status:** Design baseline / living schema  
**Scope:** Gameplay-facing design model for maps authored by the editor.

## 1. Design goal

The editor must represent a map as a structured world artifact rather than a flat image. Every authored element should have a clear role: terrain, object, collision, navigation, environment context, or metadata.

The Map Editor is designed to author **three distinct map scales** that share one canonical MapDocument/persistence foundation:

1. **World Map** — macro-scale world geography and strategic context.
2. **Kingdom/Region Map** — regional-scale geography, political territory, settlements, routes, and regional points of interest.
3. **Playable Map** — gameplay-scale spaces directly traversed by the player, including terrain, collision, objects, navigation, interactables, and encounter context.

These are different authoring scopes, not three unrelated editors. A World Map may reference or contain regions; a Region Map may reference playable locations; a Playable Map is the highest-detail authored space. Each remains an explicit map identity with its own versions and recovery slots.

## 2. Map hierarchy and scale

```text
World
├── World Map
│   └── Region / Kingdom references
│       └── Kingdom / Region Map
│           └── Settlement / Location references
│               └── Playable Map
│
└── Map persistence
    ├── MapDocument
    ├── Authoritative Versions
    ├── Save Slots (1..12)
    └── Derived Gameplay Projections
```

### 2.1 World Map

Purpose: represent the broad world and its spatial relationships.

Typical authored information:

- continents / large landmasses;
- oceans, seas, major rivers, mountain ranges;
- major political or geographic boundaries;
- kingdom/region anchors;
- major settlements and points of interest;
- world routes and high-level connections;
- labels/metadata and coordinate references.

The World Map should not be forced to carry playable collision or fine object footprints unless a future approved contract explicitly requires it.

### 2.2 Kingdom / Region Map

Purpose: represent a regional portion of the world at a scale where political, settlement, route, and terrain relationships are meaningful.

Typical authored information:

- kingdom/region boundaries;
- terrain and biome areas;
- roads, rivers, passes, bridges, and regional routes;
- settlements, cities, villages, castles, ruins, and other POIs;
- regional resource or activity anchors;
- connections to playable locations;
- regional environment/coordinate metadata.

A Region Map is still a map document and does not become a second-class projection of the World Map.

### 2.3 Playable Map

Purpose: represent a directly playable space.

Typical authored information:

- fine-grained terrain tiles;
- terrain variants and seasonal variants;
- objects/buildings;
- collision and walkability;
- navigation data;
- object geometry and footprints;
- spawn points, interactables, triggers, and other approved gameplay anchors;
- local environment context.

Playable Maps require the highest authoring fidelity and the strongest validation of collision/navigation consistency.

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
| `map_type` | `world`, `region`, or `playable` |
| `coordinate_mode` | Coordinate system/profile mode |
| `width` / `height` | Map dimensions |
| `tile_size` | Tile sizing |
| `metadata` | Extensible map metadata |
| `created_by` | Creator/owner identity where present |
| `coordinate_profile_id` | Optional coordinate profile |

`map_type` is a semantic contract. It must not be inferred from canvas dimensions alone.

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

## 5. Scale-specific authoring rules

| Concern | World Map | Kingdom/Region Map | Playable Map |
|---|---|---|---|
| Primary purpose | World geography/context | Regional geography/context | Direct gameplay space |
| Detail level | Macro | Medium | Fine |
| Fine collision | Optional/not primary | Limited/optional | Required where traversable |
| Navigation | High-level connections | Regional connections | Gameplay navigation |
| Buildings | POI/anchor representation | Settlement/POI representation | Full object/footprint authoring |
| Terrain | Broad terrain identity | Regional terrain identity | Tile-level terrain |
| Weather/season context | World context | Regional context | Local gameplay context |
| Player traversal | Not direct | Usually indirect | Direct |
| Links | Regions | Playable locations | Runtime/gameplay systems |

The same canonical persistence model must serve all three scales; scale-specific fields and tools must be explicit rather than encoded through ad-hoc frontend behavior.

## 6. Ground design

A ground cell represents terrain identity and its visual/gameplay state. The design must support:

- base terrain;
- terrain variant;
- seasonal variant;
- terrain asset binding;
- topology/mask information when needed;
- walkability/collision projection;
- environment-driven visual variants.

The current editor terrain palette includes Grass, Sand, Dirt, Pavement, and Water.

## 7. Object design

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

## 8. Collision and navigation

Collision is authored as an editor concern but must become deterministic gameplay data.

The gameplay model distinguishes:

- collision blocked/unblocked;
- walkable/unwalkable;
- line-of-sight blocking where applicable;
- object geometry used for spatial calculations;
- navigation projection rebuilt from the authoritative map state.

For World Maps, high-level route/link data is preferred over tile-level player navigation. Region Maps may contain regional route graphs. Playable Maps must support detailed navigation where required by gameplay.

## 9. Environment integration

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

## 10. Version model

Every authoritative map state is associated with a version.

```text
Map
 ├── Version 1 → Snapshot
 ├── Version 2 → Snapshot
 ├── Version 3 → Snapshot
 └── ...
```

A version is immutable historical state. The latest version is the current authoritative state.

## 11. Save-slot model

Save slots are named recovery points into map history.

```text
Map 123
├── Slot 1 → Version 12 / Snapshot A
├── Slot 2 → Version 8  / Snapshot B
├── Slot 3 → Version 12 / Snapshot C
└── ...
```

The slot contains its own snapshot so that later map edits do not mutate the saved state.

## 12. Projection model

The editor document is high fidelity. Gameplay tables are projections.

```text
                 ┌── map_cells
                 ├── map_objects
MapDocument ─────┼── map_object_geometry
                 ├── navigation projection
                 └── runtime snapshot
```

A projection may be regenerated. The editor must never reconstruct the full document from a lossy projection if the authoritative snapshot is available.

## 13. Current relational schema facts

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

## 14. Design invariants

1. One `map_id` identifies one map.
2. One map has exactly one semantic `map_type`: world, region, or playable.
3. One version belongs to one map.
4. One save slot belongs to one map.
5. A slot snapshot is isolated from later edits.
6. Gameplay projections are derived from authoritative state.
7. Object identity is stable across saves unless an explicit delete/create occurs.
8. Coordinates must remain deterministic between editor and runtime.
9. Terrain identity must remain stable even when its seasonal/weather visual changes.
10. Loading a snapshot restores authoring state, not merely a rendered image.
11. Links between World → Region → Playable maps are explicit references/metadata, not implicit assumptions based on dimensions or screen position.
12. A map scale may constrain available tools and validation requirements, but must not create a second persistence model.

## 15. Future extensions

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
