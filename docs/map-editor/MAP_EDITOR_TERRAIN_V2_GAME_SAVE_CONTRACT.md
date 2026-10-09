# Game Save v2 Contract for Terrain Semantics

Status: proposal only; not implemented or wired to save-slot RPCs.

## Goals

- Preserve world and optional exterior maps as atomic editor states.
- Preserve validated terrain semantics for initialized maps.
- Load legacy v1 saves without inventing terrain semantics.
- Keep existing save-slot RPC and v1 parser behavior unchanged until compatibility tests and runtime verification are available.

## Proposed envelope

Use the existing `vandrith.game-save` schema with a new `version: 2`. `world` and `exterior` each contain a complete map snapshot accepted by the map snapshot parser. A nested v1 map snapshot becomes a legacy editor state with `terrainSemantics: null`; a nested v2 map snapshot must pass the v2 semantics validator. `exterior` remains either a valid playable exterior map snapshot or `null`.

## Validation rules

1. Reject unsupported envelope versions and malformed objects.
2. Validate world map type is `world` and exterior map type/space are `playable` / `exterior`.
3. Validate map identity and terrain semantics using existing canonical parsers.
4. Never infer water/land semantics from tile IDs or map type.
5. Serialize and parse the whole envelope atomically; do not partially accept one map if the other is malformed.
6. Preserve v1 save parsing as a compatibility path and represent those maps as legacy/uninitialized state.

## Migration gates

1. Implement a separate pure v2 adapter; do not change `game-save.ts` v1 functions in place.
2. Add unit tests for v1 compatibility, initialized v2 round-trip, legacy nested maps, malformed semantics, invalid world/exterior types, unsupported versions, and atomic rejection.
3. Audit every save-slot caller and RPC payload/response contract.
4. Run targeted tests, full Vitest, typecheck, and build.
5. Only after passing checks, propose a separately reviewed save-slot RPC migration. Production database changes require explicit audit and approval.

## Current decision

This document is a contract proposal, not an implementation or test result. Active save/load, crash recovery, conflict-save, production RPC/database, and runtime navigation remain unchanged.
