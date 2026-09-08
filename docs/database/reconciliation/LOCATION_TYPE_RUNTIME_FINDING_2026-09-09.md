# Location Type Runtime Finding — 2026-09-09

## Verified runtime data

The live runtime currently contains **2 `locations` rows** and **1 `settlements` row**.

Observed location types:

| Location | Type | Parent | Region |
|---|---|---|---|
| Crescent Forest | `forest` | none | `e1f97203-1aa7-46e7-a826-f5972c1c4587` |
| Crescent Moon Village | `village` | Crescent Forest | `e1f97203-1aa7-46e7-a826-f5972c1c4587` |

The settlement record is:

- Name: `Crescent Moon Village`
- Type: `village`
- Location: `Crescent Moon Village`
- Status: `active`

## What this proves

The current runtime **does use `location_type='village'`**, so the historical village concept is represented through the `locations` hierarchy rather than a dedicated `villages` table, at least for the observed data.

It also demonstrates that a settlement can be attached to a typed location:

`region → forest location → village location → settlement`

## What this does NOT prove

The sample is too small to establish that every historical kingdom/city/village concept is represented by `locations.location_type`.

In particular:

- no `kingdom` location was observed;
- no `city` location was observed;
- only one village location was observed;
- the runtime may support additional location types not represented in the current two rows.

Therefore architecture documentation should not yet claim a complete type mapping.

## Source recovery status

This is runtime evidence only. Exact migration SQL for the current `locations` and `settlements` definitions remains unrecovered.

## Decision

No schema change is required from this finding.

The historical `villages` concept can be marked as **runtime-represented through a typed location in the observed data**, while `kingdom` and `city` remain unverified.

## Production changes

None.
