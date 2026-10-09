# Vendrith Terrain — Authoritative Source Decision Record

**Date:** 2026-10-10  
**Status:** Phase 1 audit checkpoint; recommended design, pending implementation review  
**Branch:** `feat/vendrith-ecc-v1`  
**Production changes:** none

## 1. Decision

Use the authoritative, versioned **MapDocument snapshot** as the source of truth for authored terrain gameplay semantics. Treat `map_cells`, navigation rows, and runtime snapshots as rebuildable projections, not independent authorities for authored water meaning.

This recommendation follows the existing Map Editor database contract: MapDocument is canonical; `map_versions.snapshot` stores authoritative versions; `map_cells` is derived/projection data. The current serializer is `vandrith.map-document` version 1 and terrain cells currently contain only `tileId`.

Do **not** add water semantics directly to the existing `map_cells` projection as the only source. That would put authored meaning in a representation that the current architecture says must be reconstructible from the authoritative snapshot.

## 2. Compatibility strategy

Do not silently extend MapDocument v1 or change its meaning. Introduce a reviewed, versioned document contract for new semantics only after the following are designed:

- A versioned terrain semantic section keyed by integer cell coordinates (or an equivalent per-cell field model that remains compatible with layer/cell invariants).
- Explicit schema/document-version dispatch in the serializer/parser.
- A legacy v1 read path that preserves existing maps without fabricating semantic values.
- Deterministic v2 serialize → parse → compare tests and malformed-payload rejection.
- Explicit save/load, save-slot, merge, recovery, and projection compatibility tests.
- A policy for resize/crop that deterministically removes out-of-bounds records and does not create semantics for newly added cells.

The exact version number and serialized shape must be selected in code review; this record does not pre-approve a particular v2 payload.

## 3. Semantic boundaries

Keep these concepts orthogonal:

1. **Render terrain:** tile IDs, asset selection, and derived water-band display.
2. **Authored gameplay terrain:** surface, feature, depth, current, shallow-walk permission, bridge, and crossing-point semantics.
3. **Actor capabilities:** validated entity state such as swimming and water transport.
4. **Collision:** an independent hard blocker.
5. **Projection:** deterministic, rebuildable navigation/cell/runtime representations derived from the authoritative snapshot.

Never infer gameplay depth, current, salinity, or boat access from `water`, `brackish`, `deepwater2`, or `deepwater` render IDs.

## 4. Required runtime consistency

The shared, pure terrain projection must be consumed by both path planning and authoritative per-step movement validation. A previously planned path must not bypass a changed or newly invalid cell rule. Collision always wins. Unknown or missing water semantics cannot grant new traversal permission.

The current Supabase runtime navigation adapter loads `x`, `y`, `walkable`, and `collision`; it does not yet load canonical water semantics. The optional `NavigationGrid.waterCells` input and validator are not proof of persistence or active runtime enforcement.

## 5. Database and RPC policy

No new SQL table, `map_cells` column, RPC payload, migration, backfill, or production mutation is authorized by this decision record.

After the versioned snapshot contract is implemented and tested, derived projections may be extended to carry validated semantic fields only if consumers need them. Projection reconciliation must be idempotent and rebuildable from the authoritative snapshot. Any database change requires a separate migration review, non-production rehearsal, rollback plan, and server-side validation audit.

## 6. Gate A evidence checklist

- [x] Confirmed current MapDocument schema and document version from serializer.
- [x] Confirmed current terrain cells are `{ tileId }` and no canonical gameplay water semantics field exists.
- [x] Confirmed database contract describes `map_versions.snapshot` as authoritative and `map_cells` as derived.
- [x] Confirmed the runtime adapter's navigation row contract does not include water semantics.
- [x] Confirmed the existing persistence boundary uses version-aware `map_editor_commit_merge_v1` and that save/load/recovery must remain compatible.
- [ ] Inspect exact live SQL definitions, RLS, and RPC signatures before any schema or projection migration.
- [ ] Review this recommended source-of-truth decision before implementing a new serialized contract.

## 7. Next implementation gates

**Gate B — Canonical model:** implement the reviewed versioned semantic contract and parser/serializer tests, preserving v1 reads.

**Gate C — Shared projection:** deterministic conversion from validated snapshot semantics to navigation; test duplicate/out-of-bounds data, resize, collision precedence, and actor capabilities.

**Gate D — Runtime enforcement:** load semantics from the authoritative snapshot/projection and enforce the same decision in path planning and per-step movement.

**Gate E — Persistence/recovery:** verify save/load, slots, merge conflicts, replay/hash behavior, projection reconciliation, and legacy maps. Only then prepare a separate migration proposal if necessary.

## 8. Verification statement

This document records an architecture recommendation based on repository contracts and code inspection. It is not a claim that schema v2, runtime integration, or automated tests have been implemented. No production database, deployed migration, or production map data was changed.
