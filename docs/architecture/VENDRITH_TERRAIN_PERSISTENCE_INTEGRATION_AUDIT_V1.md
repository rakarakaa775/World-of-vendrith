# Vendrith Terrain Persistence Integration Audit v1

Date: 2026-10-10
Branch: `feat/vendrith-ecc-v1`
Status: Audit and test hardening; persistence integration is not yet enabled.

## Objective

Define the safe boundary for carrying authored terrain semantics through Map Editor save/load without changing the production database or activating gameplay navigation.

## Verified source contracts

- `MapDocument` remains version 1. Its grid cells contain `tileId` only.
- `serializeMapDocument` / `parseMapDocument` remain the established v1 serializer/parser.
- `resizeMapDocument` resizes each layer's tile grid and preserves in-bounds cells; new cells are `{ tileId: null }`.
- Terrain semantics are currently a separate validated section, with their own schema/version and coordinate-based records.
- The v2 envelope wraps the existing v1 document and adds `terrainSemantics`; the legacy envelope parser returns `terrainSemantics: null` for v1 input rather than fabricating semantic data.
- The Map Editor package declares `test: vitest run` and `typecheck: tsc --noEmit`. This audit did not execute those commands.

## Integration risks

1. **Persistence path not wired:** the v2 serializer exists as a separate module. Do not assume the current Save, Load Latest, Save Slot, runtime snapshot, or recovery paths call it until each call site is traced and verified.
2. **Legacy data:** v1 snapshots do not contain semantic terrain data. Loading them must remain explicit about missing semantics; no inferred water depth/current/navigation properties may be persisted as if authored.
3. **Resize consistency:** tile grids resize today, but a separate semantic section must be resized in the same state transition. Shrinking must drop out-of-bounds records; expanding must not invent semantic records.
4. **History consistency:** undo/redo snapshots must include the semantic section atomically with the document. If history currently stores only `MapDocument`, semantics must not be silently kept out-of-band.
5. **Durability and recovery:** any later durable format must preserve schema/version, requested map identity, and deterministic serialization through save/load/recovery. Runtime projections must be rebuildable and must not become a competing source of truth.
6. **Runtime safety:** no terrain-based water traversal should be enabled until authored semantics survive durable persistence, resize, history, and recovery.

## Required sequence before integration

1. Trace all authoritative save/load entry points and identify the exact serializer used by each.
2. Add unit tests for v1 compatibility, v2 deterministic round-trip, requested map ID enforcement, invalid/missing semantics, and duplicate/out-of-bounds coordinates.
3. Introduce one explicit editor-state contract that carries `MapDocument` and optional/required terrain semantics together; define how legacy v1 data is represented.
4. Make resize and undo/redo operate on that combined state atomically.
5. Add integration tests for save → load, save-slot load, load-latest, undo/redo, resize, and recovery. Tests must exercise real production call sites rather than only the serializer module.
6. Only after these tests pass, plan a separately reviewed persistence/RPC migration if needed. No database, RPC, production runtime, or navigation behavior changes are included in this audit.

## Current verification

- Added serializer tests for v1 compatibility, deterministic v2 round-trip, requested map identity, malformed payloads, unsupported versions, missing/invalid semantics, and duplicate coordinates.
- GitHub API returned no commit status checks or workflow runs for the preceding test commit; passing CI has **not** been established.
- No production database changes were made.
