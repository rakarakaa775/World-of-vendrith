# World Root Reconciliation — 2026-09-09

## Scope

Object-level comparison of `worlds`, `regions`, and `settlements` between the live Supabase runtime and the available historical World Blueprint/source material.

## Runtime facts

### `worlds`

Current runtime columns:

- `id` uuid, NOT NULL, default `gen_random_uuid()`
- `name` text, NOT NULL
- `description` text, nullable
- `status` text, NOT NULL, default `active`
- `created_at` timestamptz, NOT NULL, default `now()`
- `updated_at` timestamptz, NOT NULL, default `now()`

### `regions`

Current runtime columns:

- `id` uuid, NOT NULL, default `gen_random_uuid()`
- `continent_id` uuid, NOT NULL
- `name` text, NOT NULL
- `description` text, nullable
- `created_at` timestamptz, NOT NULL, default `now()`
- `updated_at` timestamptz, NOT NULL, default `now()`

Runtime FK: `regions.continent_id → continents.id`.

### `settlements`

Current runtime contains a separate `settlements` table with:

- `id` uuid
- `location_id` uuid, NOT NULL
- `name` text, NOT NULL
- `settlement_type` text, NOT NULL
- `population_limit` integer, nullable
- `description` text, nullable
- `status` text, NOT NULL, default `active`
- `created_at` timestamptz
- `updated_at` timestamptz

Runtime FK: `settlements.location_id → locations.id`.

## Historical World Blueprint

The preserved World Blueprint defines a 16-domain world layer. Its hierarchy explicitly states:

`worlds → continents → regions → kingdoms → cities/villages`

It defines `worlds` as the root and `regions` as subdivisions of continents. It also states that `regions.world_id` would be an invalid shortcut because regions should reference continents.

The blueprint's 16-domain list does **not** include a `settlements` table. It models cities and villages as the settlement domains and treats locations as the atomic geography unit.

## Reconciliation result

### Confirmed alignment

- `worlds` exists as the runtime root.
- `continents.world_id → worlds.id` exists in runtime.
- `regions.continent_id → continents.id` exists in runtime.
- The runtime region hierarchy therefore matches the historical Blueprint's parent-child rule.

### Current-runtime extension / divergence

`settlements` exists in the current runtime and is attached to `locations`. This is not one of the 16 tables listed in the locked historical World Blueprint.

This must be treated as a **later runtime extension or schema evolution** until authoritative source proving its origin is recovered. It must not be inserted into the historical migration sequence merely because it exists at runtime.

### Source status

- `worlds`: historical source/design exists; exact current runtime parity not proven.
- `regions`: historical source/design exists; exact current runtime parity not proven.
- `settlements`: current runtime verified; exact authoritative migration source not recovered.

## Decision

No migration SQL is created from this comparison.

The historical World Blueprint remains historical evidence. The live Supabase definitions remain authoritative for current runtime state.

## Next recovery target

Recover and compare exact source for `continents`, then `kingdoms`, `cities`, `villages`, and `locations`. `settlements` should be tracked separately as a runtime extension until its authoritative source is found.

## Production changes

None.
