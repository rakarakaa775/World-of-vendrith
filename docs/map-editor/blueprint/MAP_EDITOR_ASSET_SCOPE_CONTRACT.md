# Vandrith Map Editor — Asset Scope Contract

**Status:** Phase 0 contract decision / pre-migration  
**Date:** 2026-09-17  
**Scope:** Map Editor asset eligibility across World, Region, and Playable maps

## 1. Purpose

Define a stable contract for determining whether an asset may be used by a Map Editor document at a particular map scale.

This contract separates **asset approval** from **map-scale eligibility**. An asset being approved does not automatically make it valid for every Map Editor scale.

## 2. Canonical map scopes

The Map Editor recognizes exactly these initial asset scopes:

- `world`
- `region`
- `playable`

These correspond to the semantic MapDocument types already defined by the Map Editor. Playable Interior remains within the Playable authoring context unless a later contract explicitly introduces a separate asset scope.

## 3. Core eligibility rule

For a Map Editor asset reference to be accepted:

```text
asset approval requirements satisfied
AND
asset is explicitly allowed for the active MapDocument scope
```

Scope must never be inferred from:

- filename;
- folder path;
- asset category alone;
- source-pack name;
- dimensions;
- visual appearance;
- free-form metadata;
- legacy `maps.map_type`.

## 4. Approval and scope are independent

Approval answers:

> Is this asset permitted to enter the approved Map Editor asset set?

Scope answers:

> For which Map Editor scales is this approved asset permitted?

Therefore these are valid states:

```text
approved + world
approved + region
approved + playable
approved + world + region
approved + region + playable
approved + world + region + playable
```

This contract does not redefine the existing approval workflow. The existing terrain rule remains authoritative: terrain staging requires the documented approval boundary in `MAP_EDITOR_ASSET_APPROVAL.md`.

## 5. Proposed physical representation

Use a separate many-to-many scope relation rather than adding a JSON `allowed_scopes` field to `asset_registry`.

Logical model:

```text
asset_registry
      │
      │ 1:N
      ▼
map_editor_asset_scopes
      │
      ├── asset_id
      ├── map_scope       -- world | region | playable
      └── metadata / audit fields
```

The exact physical table name may be finalized during migration design, but the relation must provide one explicit row per `(asset_id, map_scope)` assignment.

Rationale:

- supports one asset being valid at several scales;
- avoids encoding authorization-like scope in unvalidated JSON;
- allows scope assignments to be audited independently;
- does not alter the existing asset identity table;
- keeps legacy asset consumers unaffected.

## 6. Scope assignment invariants

1. `asset_id` must reference an existing `asset_registry` row.
2. `map_scope` must be one of `world`, `region`, `playable`.
3. A `(asset_id, map_scope)` pair is unique.
4. Absence of a scope row means the asset is **not eligible** for that scope.
5. Scope rows do not themselves grant approval.
6. Rejected or archived assets remain ineligible even if an old scope row exists.
7. Scope assignment must not change provenance, licensing, or asset identity.
8. A shared asset is represented by multiple explicit scope rows.
9. Scope changes must be auditable and must not silently rewrite existing MapDocument snapshots.

## 7. Asset variants

Variants remain children of an asset identity where the existing asset model supports them.

A variant may inherit the parent asset's permitted scope only when the contract explicitly establishes that inheritance. Otherwise the variant must have its own scope assignment.

The system must not merge visually similar World/Region/Playable variants into one identity merely because they represent the same concept.

Example:

```text
Mountain_World
  → world

Mountain_Region
  → region

Mountain_Playable
  → playable
```

A separate shared asset can explicitly be assigned to more than one scope.

## 8. Runtime/editor validation

The active MapDocument provides the requested scope.

The asset selection boundary must evaluate:

```text
requestedScope = activeDocument.mapType
assetApproved = approval boundary says approved
assetAllowed = scope relation contains (asset, requestedScope)

usable = assetApproved AND assetAllowed
```

For terrain, `assetApproved` must additionally respect the existing two-source terrain binding approval contract.

An out-of-scope asset must be rejected even if its general approval status is valid.

## 9. Palette and placement behavior

The asset palette must filter by the active MapDocument scope before placement.

Placement APIs and persistence boundaries must independently validate scope. UI filtering is not an authorization boundary.

Therefore:

```text
World document
  → only explicitly world-scoped approved assets

Region document
  → only explicitly region-scoped approved assets

Playable document
  → only explicitly playable-scoped approved assets
```

Shared assets appear only where their scope rows explicitly allow them.

## 10. Existing database compatibility

The current audited database contains:

- `asset_registry` for asset identity, category, path, capabilities, and approval status;
- `asset_manifest` for semantic/runtime configuration;
- `asset_binding_candidates` for terrain binding review;
- `asset_license_registry` and `asset_provenance_verifications` for provenance/license verification;
- `asset_seasonal_variants` for seasonal variants.

The current `asset_registry` has no dedicated scope field. `metadata` JSON is not treated as a contractual substitute.

The contract therefore adds a future Map Editor scope layer rather than changing the meaning of the existing asset tables.

## 11. Security / ownership boundary

Scope assignments are authoring-governance data, not client-provided authorization claims.

The future database layer must define:

- ownership/admin write policy;
- read policy for the Map Editor;
- whether public runtime consumers may read the relation directly or through a derived view/RPC;
- protection against arbitrary client insertion of scope assignments.

The existing Supabase security-advisor findings around RLS policies and SECURITY DEFINER functions remain separate hardening work and are not resolved by this contract.

## 12. Migration requirements

Before implementation, the migration design must define:

1. final table name and columns;
2. primary/foreign keys;
3. uniqueness constraint on `(asset_id, map_scope)`;
4. allowed scope constraint;
5. ownership/admin policy;
6. read/write RLS policies;
7. approval + scope validation boundary;
8. handling of existing assets with no scope assignment;
9. whether any existing approved assets receive explicitly reviewed initial scope rows;
10. compatibility with terrain binding approval;
11. placement/runtime validation path;
12. rollback strategy;
13. test fixtures and rejection cases.

## 13. No automatic backfill

No existing asset is automatically assigned to `world`, `region`, or `playable` by this contract.

In particular, current folder names, asset categories, or archive contents are evidence for review, not proof of scope authorization.

Initial scope assignments must be explicitly reviewed and recorded.

## 14. Required tests before activation

At minimum:

- approved World-only asset accepted by World document;
- same asset rejected by Region document;
- same asset rejected by Playable document;
- approved Region-only asset accepted by Region document;
- approved Playable-only asset accepted by Playable document;
- explicitly shared asset accepted in every assigned scope;
- approved asset with no scope rejected;
- pending/rejected/archived asset rejected regardless of scope;
- terrain asset still requires the existing terrain approval boundary;
- UI palette filtering and server/persistence validation agree;
- scope assignment does not alter MapDocument identity;
- existing World Map and legacy `maps` semantics remain unchanged.

## 15. Rollback

Because this is a pre-migration contract, rollback is documentation-level: do not create the scope table until the migration design passes review.

Once implemented, rollback must remove only the Map Editor scope layer and dependent validation code. It must not delete or rewrite existing `asset_registry`, licensing, provenance, terrain bindings, or legacy map records.

## 16. Phase 0 gate

**Phase 0 result:** The Map Editor now has a defined contract boundary for scale-specific asset eligibility.

This document does **not** authorize a Supabase migration or initial scope assignments. The next step is concrete migration/RLS design followed by an implementation-level audit before activation.
