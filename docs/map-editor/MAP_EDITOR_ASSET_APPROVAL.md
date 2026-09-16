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

## Storage policy

Approved assets are staged under:

```text
assets/map-editor/terrain/
```

Staging is separate from runtime usage. Adding an asset to this library must not automatically import, register, or activate it in the editor.

## Audit rule

Whenever the Supabase asset registry, binding candidates, licensing status, or approved terrain set changes, update:

- `MAP_EDITOR_ASSET_APPROVAL.md`
- `MAP_EDITOR_CHANGELOG.md`
- `MAP_EDITOR_STATUS_LOG.md`

before continuing implementation.
