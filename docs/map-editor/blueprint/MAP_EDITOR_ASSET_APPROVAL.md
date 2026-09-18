# Map Editor Asset Approval List

Status: Phase 0 Foundation Audit

## Purpose

This document is the whitelist boundary for assets that may be staged for the Map Editor. Asset availability in Supabase does not mean the asset is approved for use.

## Approval rule

An asset may enter the Map Editor staging library only when both conditions are true:

- `asset_registry.status = approved`
- `asset_binding_candidates.candidate_status = approved`

For terrain staging, `asset_registry.category` must also be `terrain`.

## Current Supabase audit — 2026-09-18

The live audit now confirms the following terrain records satisfy the two-source approval rule:

- `tile_grass.png`
- `tile_dirt.png`
- `tile_pavement.png`

Other audited mountain candidates remain pending or have an approval mismatch and are not part of the approved intake.

## Current repository staging intake

The first two planned terrain originals have now been transferred individually:

- `tile_grass.png`
- `tile_dirt.png`

They are stored at:

```text
assets/map-editor/terrain/
```

This transfer does not automatically activate either asset in runtime/editor code.

`tile_pavement.png` remains approved in the live Supabase audit but is intentionally not part of this two-asset intake.

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
