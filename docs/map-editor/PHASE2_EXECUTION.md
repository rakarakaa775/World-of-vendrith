# Vandrith Map Editor — Phase 2 Execution

**Status:** IN PROGRESS — 2026-09-18

## Contract target

Phase 2 establishes one canonical MapDocument representation:

```text
MapDocument
  → serialized envelope
  → validated parser
  → canonical MapDocument
```

The contract must remain deterministic for:
- World
- Region
- Playable

## Locked compatibility constraints

- Keep schema identifier `vandrith.map-document`.
- Keep document version `1` unless a concrete incompatibility requires a new version.
- Keep the existing `MapDocument` state model.
- Do not introduce storage-specific fields solely to satisfy Supabase.
- Do not alter persistence RPCs, map_versions, save slots, or ownership rules as part of ordinary Phase 2 work.
- Map-scale identity remains a document concern; asset authorization/scope remains a separate contract boundary.

## Implementation sequence

1. Audit current TypeScript document and serialization implementation.
2. Add/strengthen structural validation for layer and cell/object semantics without changing valid existing snapshots.
3. Add round-trip coverage for World, Region, and Playable.
4. Add malformed-envelope and malformed-document regression cases.
5. Run focused tests.
6. Compare the resulting behavior against the Phase 2 exit evidence.
7. Record the final Phase 2 lock only after the evidence passes.

## Non-goals

- No new asset-scope table.
- No persistence redesign.
- No map-version redesign.
- No new map storage format.
- No automatic asset-scope backfill.
