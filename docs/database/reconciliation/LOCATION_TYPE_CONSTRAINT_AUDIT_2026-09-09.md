# Location Type Constraint Audit — 2026-09-09

## Finding

`public.locations.location_type` is currently a required `text` column. It is **not an enum** and the inspected table constraints contain no CHECK constraint restricting its values.

## Verified schema facts

- `id`: uuid, NOT NULL, default `gen_random_uuid()`
- `region_id`: uuid, NOT NULL
- `name`: text, NOT NULL
- `location_type`: text, NOT NULL
- `description`: text, nullable
- `parent_location_id`: uuid, nullable
- `created_at`: timestamptz, NOT NULL, default `now()`
- `updated_at`: timestamptz, NOT NULL, default `now()`

Constraints:

- primary key: `locations_pkey (id)`
- foreign key: `locations.region_id → regions.id ON DELETE CASCADE`
- foreign key: `locations.parent_location_id → locations.id ON DELETE SET NULL`
- unique: `(region_id, name)`

## Implication

There is currently no database-level allowlist proving that `kingdom`, `city`, `village`, `forest`, or any other location type is an approved exhaustive vocabulary.

The observed values `forest` and `village` are runtime data, not an authoritative enum specification.

Therefore the previous finding is refined:

> The runtime demonstrates that `village` is used as a location type, but the schema does not establish the complete supported location-type vocabulary.

## Architectural consequence

Do not add an enum/check constraint merely to make the schema look cleaner. Such a constraint would be a new production design decision and requires separate gameplay/domain approval.

## Source parity

Exact migration SQL creating the current `locations` definition is still not recovered.

## Production changes

None.
