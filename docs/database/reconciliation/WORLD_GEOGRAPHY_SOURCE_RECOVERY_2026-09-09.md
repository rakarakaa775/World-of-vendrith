# World / Geography / Settlements — Source Recovery Audit

Date: 2026-09-09

## Runtime inventory

The live Supabase runtime currently exposes these map/world/settlement-related tables by name pattern:

- worlds
- regions
- settlements
- settlement_history
- maps
- map_cells
- map_layers
- map_connections
- map_versions
- map_annotations
- map_building_placements
- map_objects
- map_object_geometry
- map_occupancy_cells
- map_navigation_cells
- map_navigation_obstacles
- map_coordinate_profiles
- map_terrain_rules
- map_terrain_rule_tiles
- map_terrain_transitions
- terrain_types
- terrain_type_profiles
- terrain_autotile_profiles
- terrain_transition_rules
- buildings
- building_instances
- building_instance_components
- building_assembly_specs
- building_assembly_rules
- building_assembly_constraints
- building_kit_bindings
- building_kit_roles
- plus additional map-editor tables

This inventory is runtime evidence only.

## Repository evidence

The repository contains the original Foundation migration files `0001` through `0005`, plus historical handoff/specification material. The current repository does not contain a complete exact SQL source chain for the live world/map/settlement runtime.

The historical material cannot safely be promoted to current migration source without object-level comparison.

## Result

**Coverage: PARTIAL / RUNTIME-ONLY for most current world/map objects.**

No SQL was reconstructed from table names.

## Recovery target

The next source-recovery pass should identify exact definitions for the P1 world domain in this order:

1. `worlds`, `regions`, `settlements` and settlement history.
2. `maps`, map versions/layers/cells/connections.
3. terrain types/rules/transitions.
4. buildings and building instances.
5. map navigation/occupancy objects.
6. map editor state objects.

Each recovered object must be linked to an authoritative SQL source before being placed under `supabase/migrations/`.

## Production status

No production schema or data was modified by this audit.
