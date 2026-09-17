# Vandrith Map Editor — Hierarchy Persistence Contract

**Status:** Phase 0 contract decision / pre-migration
**Date:** 2026-09-17
**Scope:** Persistence representation for World → Region → Playable Exterior → Playable Interior

## 1. Decision

Use a **separate Map Editor identity/hierarchy mapping layer** rather than changing the existing `public.maps.map_type` semantics.

Decision: **Option B — Map Editor identity/hierarchy table mapped to legacy `maps`.**

The existing `maps` table remains compatible with current game-engine semantics (`world`, `exterior`, `interior`). The Map Editor introduces an explicit semantic layer that represents the editor contract (`world`, `region`, `playable`) and hierarchy relationships without silently redefining legacy map types.

## 2. Why this decision is required

The current live database has `maps.map_type` constrained to:

- `world`
- `exterior`
- `interior`

The canonical editor contract requires:

- `world`
- `region`
- `playable`

The current `maps` table also has no `parent_map_id` relationship. Existing `interior` semantics are tied to `building_id`, so replacing or renaming the existing `map_type` values would risk changing established gameplay meaning.

The editor therefore must not infer Region/Playable hierarchy from `location_id`, `settlement_id`, `building_id`, dimensions, or UI position.

## 3. Canonical editor hierarchy

```text
World
└── Region
    └── Playable Exterior
        └── Playable Interior
```

Each node has its own stable editor map identity and authoritative versions.

## 4. Proposed identity mapping

A future migration will add a dedicated Map Editor hierarchy/identity table. Exact table and column names are intentionally deferred to the migration design, but the logical contract is fixed:

```text
editor_map_identity
├── editor_map_id          -- stable MapDocument identity
├── legacy_map_id          -- optional/current public.maps identity
├── world_id               -- world/container identity
├── map_type               -- world | region | playable
├── parent_editor_map_id   -- explicit hierarchy parent
├── playable_parent_id     -- explicit playable parent where needed
├── legacy_map_kind        -- world | exterior | interior mapping
└── ownership / timestamps
```

The final physical schema may normalize the playable-interior relation into a dedicated relation table if that better preserves legacy building/interior semantics. The invariant is more important than the provisional table name: **editor semantics and legacy engine semantics must be explicitly mapped, never inferred.**

## 5. Mapping rules

### World

- Editor type: `world`
- Legacy map kind: `world`
- Parent: none
- The audited authoritative World Map remains the existing map identity.

### Region

- Editor type: `region`
- Parent: one `world` editor map
- Legacy representation: must be explicitly mapped; no existing `maps.map_type` value is reinterpreted as `region`.

### Playable Exterior

- Editor type: `playable`
- Parent: one `region` editor map
- Legacy map kind: `exterior` where a legacy `maps` row is required.

### Playable Interior

- Editor semantic role: interior child of one `playable` map
- Parent: one owning playable editor map
- Legacy map kind: `interior` where applicable
- Existing `building_id` semantics remain intact.

## 6. Identity invariants

1. Every editor map has exactly one stable `editor_map_id`.
2. Every persisted MapDocument `id` equals its `editor_map_id`.
3. A Region has exactly one World parent.
4. A Playable map has exactly one Region parent unless an explicitly approved future exception is added.
5. A Playable Interior has exactly one owning Playable parent.
6. Parent and child must belong to the same `world_id`.
7. Cycles are forbidden.
8. A map cannot be its own parent.
9. A legacy `maps.id` may be mapped to at most one editor identity in the applicable scope.
10. Legacy `world`, `exterior`, and `interior` meanings are not silently renamed or repurposed.
11. Versions and save slots continue to key from the stable editor map identity used by persistence.
12. Renderer and projections continue to consume the authoritative MapDocument rather than hierarchy rows as document content.

## 7. Persistence behavior

The hierarchy layer is an identity/relationship boundary, not a second MapDocument storage model.

```text
MapBrowser intent
  → resolve editor_map_id
  → resolve mapped legacy maps.id when required
  → load authoritative MapDocument by editor_map_id
  → validate id/type/parent relationship
  → edit
  → save authoritative version
```

Child creation must persist the identity/relationship before the UI presents the child as a durable map.

## 8. Backward compatibility

No existing `maps.map_type` value is changed by this contract.

No existing World Map is duplicated or remapped.

Existing `world`, `exterior`, and `interior` consumers continue to see their established values. The Map Editor layer provides the semantic translation required by the editor.

## 9. Migration requirements

Before implementation, the migration design must define:

1. physical table name and columns;
2. primary key and foreign keys;
3. ownership policy/RLS;
4. uniqueness constraints;
5. cycle prevention;
6. world-scope validation;
7. mapping rules for legacy `maps` rows;
8. handling of Region maps that have no legacy row yet;
9. handling of Playable Interior/building relationships;
10. rollback strategy;
11. RPC surface for create/open/update hierarchy nodes;
12. serializer compatibility and MapDocument ID mapping.

## 10. Explicit non-actions

This contract does **not**:

- alter `public.maps`;
- add `parent_map_id` to `public.maps`;
- rename `exterior` or `interior` to `region` or `playable`;
- create Region or Playable rows in production;
- modify the authoritative World Map;
- change existing Save/Load RPC behavior.

Those actions require a subsequent migration design and verification gate.

## 11. Required tests before child persistence is enabled

- World identity maps to the existing authoritative World Map.
- Region identity round-trips with `map_type = region`.
- Region parent must resolve to a World editor identity.
- Playable identity round-trips with `map_type = playable`.
- Playable parent must resolve to a Region editor identity.
- Interior parent must resolve to its owning Playable editor identity.
- Cross-world parent assignment is rejected.
- Cyclic parent assignment is rejected.
- Legacy `maps.map_type` remains unchanged.
- Existing World Save/Load behavior remains unchanged.
- MapDocument serializer preserves editor identity and semantic type.

## 12. Rollback

Because this is a pre-migration contract, rollback is documentation-level: reject the proposed schema migration and retain the current database unchanged.

Once implemented, rollback must remove only the new hierarchy layer and its mappings after dependent editor code is disabled; it must not rewrite or delete legacy `maps` rows as part of rollback.

## 13. Gate

**Phase 0 gate:** This contract is accepted as the design boundary for the next hierarchy-persistence implementation. No schema/RPC migration is authorized by this document alone. The next step is a migration-level audit and concrete SQL/RLS design against this contract.
