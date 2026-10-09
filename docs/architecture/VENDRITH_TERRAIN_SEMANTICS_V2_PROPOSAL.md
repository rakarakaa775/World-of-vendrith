# Vendrith Terrain Semantics — Versioned Contract Proposal

**Status:** Gate B design candidate; not yet wired into MapDocument serialization or runtime  
**Branch:** `feat/vendrith-ecc-v1`  
**Production/database changes:** none

## 1. Scope

This proposal defines authored gameplay semantics separately from render tile IDs. It does not change the existing MapDocument v1 contract, database schema, RPC payloads, or runtime behavior by itself.

## 2. Proposed serialized envelope

Keep the existing `vandrith.map-document` v1 envelope readable. A future reviewed envelope version may carry:

```ts
type TerrainSemanticRecord = {
  x: number;
  y: number;
  surface: 'land' | 'water';
  feature?: 'shoreline' | 'river' | 'lake' | 'waterfall' | 'ocean_sea' | 'none';
  depth?: 'shallow' | 'medium' | 'deep' | 'unknown';
  current?: 'calm' | 'moderate' | 'strong' | 'unknown';
  shallowWalkable?: boolean;
  bridge?: boolean;
  crossingPoint?: boolean;
};

type TerrainSemanticsSection = {
  schema: 'vandrith.terrain-semantics';
  version: 1;
  cells: TerrainSemanticRecord[];
};
```

The eventual MapDocument envelope version and exact placement of this section must be set in the implementation PR after call-site review. This standalone section version is not a substitute for versioning the enclosing document format.

## 3. Coordinate and validation rules

- Coordinates are zero-based integer cell coordinates in the document grid.
- Both coordinates must satisfy `0 <= x < width` and `0 <= y < height`.
- Each coordinate may appear at most once in the section.
- `surface: 'land'` is explicit authoring data; do not infer it from a missing record.
- Water records with missing/unknown semantics fail closed for traversal. Missing records never imply shallow water or safe crossing.
- Reject malformed enums, non-boolean flags, duplicate coordinates, and out-of-bounds coordinates; do not silently drop malformed records during parse.
- Collision remains an independent hard blocker and overrides all traversal permissions.
- Render tile IDs and visual water bands are not valid sources for depth, current, feature, swimming permission, or boat access.

## 4. Legacy v1 compatibility

- The v1 parser remains supported and must return the same MapDocument shape as before.
- A v1 map must not receive fabricated terrain semantics during parsing.
- The editor may show legacy semantics as “not authored” until the user explicitly assigns them.
- A legacy map must not silently become fully traversable or fully blocked solely because the new field is absent. Until semantic-aware runtime rollout is complete, retain the existing runtime path for legacy documents and do not claim water enforcement is active for them.
- Never auto-upgrade a saved v1 snapshot in place. Upgrades must be explicit, deterministic, and reversible.

## 5. Resize and crop

- Preserve semantic records whose coordinates remain within the resized bounds.
- When shrinking, remove records outside the new bounds deterministically.
- When expanding, create no semantic records for new cells.
- A resize operation must not infer semantics from adjacent cells, tile IDs, or projected water bands.
- Tests must verify that resizing followed by serialization/parsing preserves the retained records exactly.

## 6. Required implementation and release tests

1. Existing v1 fixture parses unchanged and round-trips under the legacy path.
2. New versioned fixture round-trips deterministically.
3. Unsupported envelope and section versions fail with explicit errors.
4. Invalid enums/flags, duplicate coordinates, fractional/negative/out-of-range coordinates fail closed.
5. Resize/crop preserves only in-bounds records and does not synthesize new ones.
6. Save/load, crash recovery, save slots, merge/conflict, and runtime snapshot paths preserve the versioned section.
7. Navigation projection consumes the same validated records used by authoritative per-step movement checks.
8. Collision remains a hard blocker even when a bridge/crossing/swimming capability is present.
9. CI test and typecheck suites pass before enabling writes of the new envelope version.

## 7. Explicit non-goals

This proposal does not authorize database migrations, new columns/tables, RPC changes, backfills, production writes, or enabling semantic water traversal in the production runtime. Those require separate review after the application-level contract and persistence paths are proven.
