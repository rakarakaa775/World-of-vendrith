# Map Editor Asset Approval List

Status: Phase 0 Foundation Audit

## Purpose

This document is the whitelist boundary for assets that may be staged for the Map Editor. Asset availability in Supabase does not mean the asset is approved for use.

## Approval rule

An asset may enter the Map Editor staging library only when both conditions are true:

- `asset_registry.status = approved`
- `asset_binding_candidates.candidate_status = approved`

For terrain staging, `asset_registry.category` must also be `terrain`.

## Current Supabase audit

The current audit found status mismatches between the asset registry and binding candidates. Therefore no terrain asset is promoted to the final approved staging set yet.

### Examples found

- `Mountains v6 Snow`: binding candidate is `approved`, but asset registry status is `pending`.
- `tile_grass.png`: asset registry is `approved`, but binding candidate is `needs_review`.
- `tile_dirt.png`: asset registry is `approved`, but binding candidate is `needs_review`.
- `tile_pavement.png`: asset registry is `approved`, but binding candidate is `needs_review`.
- `LPC Overworld — Mountains`: candidate is `pending`.
- `Mountains v6`: candidate is `pending`.
- `Mountains TMW`: candidate is `pending`.

## Current approved terrain staging set

**None yet.**

This is intentional. We will not copy or activate a terrain asset until the two-source approval rule is satisfied.

## Terrain types requiring asset review

The Supabase terrain model currently includes at least:

- Grass
- Dirt
- Sand
- Pavement
- Water

The existence of a terrain type does not imply that its visual asset has been approved.

## Map-scale usage

When an asset is eventually approved, its permitted map scale must also be recorded:

- World Map
- Kingdom/Region Map
- Playable Map

An asset approved for one scale is not automatically approved for every scale.

### Scale-scope audit — 2026-09-17

The live Supabase asset model was inspected for a first-class allowed-scope field.

Current relevant structures include:

- `asset_registry` — identity, category, status, asset path and visual/runtime capabilities;
- `asset_manifest` — semantic role, category path, terrain/autotile/collision/interaction configuration and runtime properties;
- `asset_binding_candidates` — terrain binding candidate status and review evidence;
- `asset_license_registry` / `asset_provenance_verifications` — provenance, license and verification state;
- `asset_seasonal_variants` — seasonal variants tied to a licensed asset.

The current `asset_registry` schema does **not** contain a dedicated `allowed_scopes` field, and no separate Map Editor asset-scope relation is currently present in the audited public schema. `metadata` JSON fields exist on several tables, but they are not treated as a contractual substitute for an explicit scope model.

Therefore the current database can express approval/provenance and several asset capabilities, but it cannot yet enforce the distinction:

```text
approved + world
approved + region
approved + playable
approved + world + region
approved + region + playable
approved + world + region + playable
```

without adding a future contract/schema layer.

**Decision:** Do not infer map-scale eligibility from filename, folder, category, or free-form metadata. Do not alter the existing asset tables in this audit step. Define the asset-scope contract first, then design the migration/RPC boundary around that contract.

## Asset Scope Contract — 2026-09-17

The dedicated scale-eligibility contract is now defined in:

`MAP_EDITOR_ASSET_SCOPE_CONTRACT.md`

The contract establishes three explicit scopes — `world`, `region`, and `playable` — and requires both approval eligibility and an explicit scope assignment before an asset can be used. It proposes a separate many-to-many scope relation rather than changing `asset_registry` or treating JSON metadata as authorization.

No existing asset has been automatically assigned a scope. No Supabase scope table or scope assignments have been created by this contract step.

## Storage policy

Approved assets are staged under:

```text
assets/map-editor/terrain/
```

Staging is separate from runtime usage. Adding an asset to this library must not automatically import, register, or activate it in the editor.

## Audit rule

Whenever the Supabase asset registry, binding candidates, licensing status, approved terrain set, or Map Editor asset-scope contract changes, update:

- `MAP_EDITOR_ASSET_APPROVAL.md`
- `MAP_EDITOR_CHANGELOG.md`
- `MAP_EDITOR_STATUS_LOG.md`
