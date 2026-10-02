# Asset Library Schema v1 — 2026-09-26

## Purpose

This schema turns the existing Asset Registry into the canonical metadata layer for World of Vendrith.

It does **not** create a second asset registry and it does **not** duplicate PNG binaries for different biome roles.

## Canonical identity

The single canonical identity remains:

`public.asset_registry.id`

Existing supporting records remain authoritative for:
- `asset_sources` — source/package identity
- `asset_license_registry` — license and attribution record
- `asset_provenance_verifications` — source/provenance verification
- `asset_manifest` — editor/runtime manifest data
- `asset_seasonal_variants` — seasonal variants
- `asset_binding_candidates` — existing terrain binding candidates

## New WORLD layer

| Table | Purpose |
|---|---|
| `asset_binary_verifications` | Binary identity, SHA-256, byte size, repository path and LFS identity |
| `world_biome_compatibility` | Many-to-many biome compatibility |
| `world_water_bindings` | Water state + water feature + flow metadata |
| `world_landform_bindings` | Orthogonal mountain/hill/cliff/rock/cave/volcanic roles |
| `world_vegetation_bindings` | Ecological vegetation families and seasonal roles |
| `world_transition_bindings` | Material/state transition relationships and tile-region evidence |

## Verification states

### Binary

- `pending` — not individually verified.
- `verified` — binary identity and repository evidence are verified.
- `mismatch` — supplied/source binary does not match the recorded identity.
- `unavailable` — the binary cannot currently be materialized for verification.
- `rejected` — binary must not be used.

### World binding

- `candidate` — classification candidate; not an approval.
- `verified` — semantic binding has sufficient evidence.
- `blocked` — binding must not be used.

Biome compatibility additionally supports `compatible` and `preferred`.

## WORLD composition model

World Builder should resolve an asset through:

`ASSET → SOURCE/LICENSE → BINARY VERIFICATION → ROLE BINDINGS → BIOME COMPATIBILITY`

For terrain:

`BIOME → GROUND → WATER → LANDFORM → VEGETATION → TRANSITIONS → SPECIAL FEATURES`

For water, state and feature are independent:

- `coastal_shallow`
- `open`
- `deep`
- `brackish`
- `cold`
- `frozen`

Features:

- shoreline
- river
- lake
- waterfall
- ocean/sea
- generic

Example: a deep lake is `water_feature=lake` + `water_state=deep`; a deep sea is `ocean_sea` + `deep`.

## Provenance rule

A source-family match never proves binary identity.

An asset should only become repository-approved after the repository path, binary identity/checksum, provenance/license and attribution evidence are reconciled. OpenGameArt's FAQ likewise places responsibility on the project to follow the asset's specific license and attribution requirements; automatic credits are not guaranteed to be accurate.

Source: https://opengameart.org/node/5571

## Security

All new WORLD tables have RLS enabled.

They are intentionally not given broad client-facing policies in this migration. Runtime/editor read access should be added only through explicit, reviewed policies or a controlled read model after the World Builder query contract is defined.

This is consistent with current Supabase Data API behavior: new public tables require explicit exposure/grants rather than being assumed reachable through the Data API.
