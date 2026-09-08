# Location / Settlement Source Recovery — 2026-09-09

## Search result

A targeted search was performed across the currently uploaded file-search corpus for exact `locations` / `settlements` migration or schema source. No matching uploaded-file result was returned.

The repository itself contains historical world documentation and the large legacy project snapshot, but the inspected world README is explicitly a placeholder and states that no world documents existed in that legacy phase.

## What is available

The repository has:

- historical foundation migrations under `database/migrations/0001`–`0005`;
- historical table specifications under `database/specifications/`;
- the legacy project snapshot under `handoff/.../LEGACY_PROJECT_SNAPSHOT/`;
- current runtime evidence from Supabase;
- current exact Inventory gateway migration under `supabase/migrations/`.

## What is NOT recovered

No authoritative exact migration SQL for the current `locations` table was recovered.

No authoritative exact migration SQL for the current `settlements` table was recovered.

No source was found that establishes the timestamp/order in which these two runtime objects were introduced.

## Consequence

`locations` and `settlements` remain classified as runtime evidence / source-recovery targets. They must not be reconstructed into `supabase/migrations/` from their current schema metadata.

## Runtime facts retained

- `locations.location_type` is required `text`.
- `locations` has hierarchical `parent_location_id`.
- `locations.region_id` references `regions.id`.
- `(region_id, name)` is unique.
- `settlements.location_id` references `locations.id`.
- Current sample data demonstrates `forest` and `village` location types.

## Next safe action

Continue source recovery through the larger checkpoint/legacy archive at object level. If no exact source is found, record the objects as runtime-only rather than manufacturing historical migrations.

## Production changes

None.
