# Map Editor Terrain Semantics v2 — Integration Gate

**Status:** Design/audit gate only; not an authorization to migrate production persistence.
**Branch:** `feat/vendrith-ecc-v1`
**Last reviewed:** 2026-10-10

## Goal

Move authored terrain semantics together with `MapDocument` without allowing document-only edits, undo/redo, recovery, or saves to silently drop terrain metadata. Keep the existing v1 path authoritative until a complete migration is tested end-to-end.

## Confirmed current boundaries

| Area | Current behavior | Integration implication |
| --- | --- | --- |
| Active editor state | `apps/map-editor/components/editor-shell.tsx` owns `MapHistory` from `map-history.ts`; `history.present` is only a `MapDocument`. | V2 history is not active in the editor UI. |
| Editor callbacks | `onDocumentChange`, `onSave`, and `onQuickSave` pass only `MapDocument`. | Callback contracts need a coordinated state-v2 design; do not bolt on a second unsynchronized state. |
| Painting | `handlePaint` updates document-only history; gesture updates replace `present` and clear `future`. | Terrain-semantic changes must be part of the same gesture/commit boundary, including gesture coalescing. |
| Snapshot adapter | `map-snapshot-v2.ts` reads v1 and v2; v1 returns `terrainSemantics: null`. | A legacy v1 load must remain explicitly uninitialized until a product policy decides how semantics are authored; never fabricate them. |
| Runtime snapshot persistence | `map-persistence.ts` serializes canonical v1 MapDocument and calls `map_editor_upsert_runtime_snapshot_v1`. | Do not route v2 into this RPC until its accepted payload contract and database-side validation are audited. |
| Crash recovery | `map-crash-recovery.ts` is v1; `map-crash-recovery-v2.ts` is an isolated opt-in journal. | Recovery prompt, autosave, clear-after-save, and map switching need a single coordinated migration. |
| Conflict save | `map-conflict-save-controller.ts` merges three `MapDocument` values. | Three-way merge needs an explicit terrain-semantics conflict/merge policy before v2 saves can be safe. |
| Save slots | `map-save-slot.ts` parses a `GameSaveSnapshot`. | Audit the game-save envelope separately; do not assume the map snapshot adapter automatically covers save slots. |

## Integration invariants

1. One authoritative editor state contains both `document` and `terrainSemantics`; UI mirrors must not become a second source of truth.
2. Every edit, paint gesture, undo, redo, resize, map switch, recovery action, and save captures a consistent combined state.
3. A v1 snapshot is represented as legacy/uninitialized semantics, not silently converted into guessed land/water data.
4. Resize policy is deterministic: shrinking removes out-of-bounds semantic cells; expansion does not invent semantics. The document and semantic resize happen atomically.
5. Save/load and conflict handling preserve requested map identity and reject malformed or unsupported v2 envelopes.
6. Recovery writes and clears use the same authoritative combined state as the visible editor.
7. No production RPC/schema/data change until database function definitions, migration plan, rollback strategy, and end-to-end tests are reviewed.
8. No runtime navigation or water traversal consumes semantics until a separate gameplay contract and tests explicitly authorize it.

## Required migration sequence

### Gate A — Local state adapter
- Define a single editor state contract with an explicit legacy/uninitialized semantic state.
- Audit every `EditorShell` commit path, including pointer paint gestures, selection operations, resize, undo/redo keyboard shortcuts, and incoming `initialDocumentRevision`.
- Add tests proving no semantic state is lost across each operation.
- Preserve v1 editor behavior while this gate is being developed.

### Gate B — UI and lifecycle
- Make terrain semantic edits use the same commit/gesture boundaries as visual terrain edits.
- Handle map identity changes and external document revisions without reusing semantics from another map.
- Verify undo/redo, selection edits, and resize atomically update the combined state.

### Gate C — Recovery and conflict policy
- Integrate the v2 recovery journal only after the editor state is authoritative.
- Specify how legacy recovery entries coexist with v2 entries and how successful saves clear recovery.
- Design three-way semantic merge/conflict reporting; do not merge terrain semantics by simply selecting local or remote wholesale.

### Gate D — Persistence contract
- Audit the exact Supabase RPC definitions and any database migrations before changing payload shape.
- Add backward/forward compatibility tests for v1 and v2 payloads, map identity, unsupported versions, and partial/invalid envelopes.
- Confirm save-slot/game-save serialization is in scope or explicitly remains v1.
- Run targeted Vitest, full test suite, typecheck, and build; record actual CI results before enabling the v2 path.

## Current decision

**Do not integrate v2 into the live editor or production persistence yet.** The current v2 serializer, history, and recovery journal are opt-in foundations only. This gate documents the audited seams and required sequence; it does not claim test execution or production readiness.
