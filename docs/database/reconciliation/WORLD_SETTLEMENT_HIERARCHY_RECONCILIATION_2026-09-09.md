# World Settlement Hierarchy Reconciliation — 2026-09-09

## Scope

Object-level runtime check for `continents → regions → locations → settlements`, compared against the historical World Blueprint terminology available to the project.

## Runtime result

The live Supabase runtime contains `continents` and `locations`, but it does **not** contain base tables named `kingdoms`, `cities`, or `villages`.

### Verified relationships

- `continents.world_id → worlds.id`
- `regions.continent_id → continents.id`
- `locations.region_id → regions.id`
- `locations.parent_location_id → locations.id`
- `settlements.location_id → locations.id`

This yields the current runtime geography chain:

`worlds → continents → regions → locations → settlements`

with `locations` supporting a self-referential hierarchy.

## Important terminology finding

The historical World Blueprint describes the conceptual hierarchy as:

`worlds → continents → regions → kingdoms → cities/villages`

The current runtime does not implement `kingdoms`, `cities`, or `villages` as separate tables under those names.

Therefore we must **not** assume that `locations` is a direct one-to-one replacement for those historical concepts. The current runtime `location_type` field may represent multiple conceptual location classes, but that interpretation requires authoritative source evidence before being promoted into architecture documentation.

## Source status

- `continents`: runtime verified; historical source/design exists; exact current parity not proven.
- `regions`: runtime verified; historical source/design exists; exact current parity not proven.
- `locations`: runtime verified; current exact migration source not recovered.
- `settlements`: runtime verified; current exact migration source not recovered.
- `kingdoms`: historical concept only in the inspected material; no current runtime table verified.
- `cities`: historical concept only; no current runtime table verified.
- `villages`: historical concept only; no current runtime table verified.

## Decision

The current runtime hierarchy is documented as runtime evidence only:

`worlds → continents → regions → locations → settlements`

The historical conceptual hierarchy remains separate:

`worlds → continents → regions → kingdoms → cities/villages`

No schema migration or architecture rewrite is performed from this discrepancy.

## Next target

Inspect `locations.location_type` values and the runtime foreign-key relationships around locations/settlements to determine whether the current system models the historical kingdom/city/village concepts through typed locations or through another domain.

## Production changes

None.
