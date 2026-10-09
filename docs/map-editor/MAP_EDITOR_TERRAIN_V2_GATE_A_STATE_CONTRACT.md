# Map Editor Terrain v2 — Gate A State Contract

Status: **implemented as an opt-in pure adapter; not integrated into the live editor or persistence**.

## Contract

`apps/map-editor/editor/map-editor-state-v2.ts` defines a discriminated union:

- `kind: "legacy"` carries a canonical v1 `MapDocument` and `terrainSemantics: null`.
- `kind: "initialized"` carries a canonical v1 `MapDocument` and validated `TerrainSemanticsSection`.

A v1 snapshot stays legacy; the adapter never infers semantic cells from tile IDs, visual appearance, or map type.

## Explicit transitions

- `initializeTerrainSemantics` is the only legacy-to-initialized transition and validates every semantic record against current dimensions.
- `replaceMapEditorDocument` validates the new document before returning a state. Changing map ID resets to legacy, preventing semantic leakage between maps.
- A same-map dimension change resizes semantics deterministically: shrinking drops out-of-bounds cells; expansion creates no semantic records.
- `serializeInitializedMapEditorState` rejects legacy state rather than silently writing it as v2.

## Validation added

`map-editor-state-v2.test.ts` covers legacy v1 loading, v2 loading, explicit initialization, invalid semantic rejection, map identity switch, same-map edit preservation, resize behavior, and identity/version mismatch rejection.

## Still gated

This adapter is not wired to `EditorShell`, active undo/redo, Save/Load, crash recovery, save slots, conflict resolution, Supabase RPC, or runtime water navigation. Gate B–D remain open. Production database/RPC changes are not part of this change.

Tests have been authored but have **not been executed in this GitHub-only workflow**. An empty CI status list is not evidence of passing tests.
