# Terrain Semantics v2 — Active Editor Audit

Date: 2026-10-10
Branch: `feat/vendrith-ecc-v1`
Status: audit-only; no live editor behavior changed.

## Findings

- `EditorShell` owns `MapDocument` only. Its document-change and save callbacks do not carry terrain semantics.
- Paint and erase call terrain-paint helpers. Ordinary changes use `commit`, but paint-gesture continuation updates the current history entry directly and clears redo. A combined-state integration must preserve gesture coalescing while updating document and semantics atomically.
- Selection paste/replace/move and layer/group/template operations all transform `MapDocument` and flow through the document-only commit boundary.
- Toolbar and keyboard undo/redo use v1 `MapHistory`, which stores documents only.
- Loading another document resets history based on map ID/revision; the current prop boundary cannot represent initialized terrain semantics.
- Active persistence and crash recovery serialize v1 documents. Save slots parse `GameSaveSnapshot`. Conflict-save merges `MapDocument` only.

## Required integration policy

1. Audit `game-save.ts` and all callers of `EditorShell`, Save/Load, autosave, and recovery.
2. Define explicit semantic-edit rules for paint, erase, selection transforms, layer operations, and imported maps. Never infer terrain semantics solely from tile IDs.
3. Keep legacy v1 loads as uninitialized state; require explicit initialization before v2 writes.
4. Replace every active history path together and test toolbar/keyboard undo-redo parity plus paint gesture coalescing.
5. Define versioned combined-state save/load and recovery contracts before changing persistence. Define an explicit three-way merge policy for semantics before conflict-save integration.
6. Add tests for map switching, save/load round-trip, recovery round-trip, and conflicts.
7. Run targeted tests, full Vitest, typecheck, and build in a real repository runner before enabling the UI integration.

## Safety boundary

No production database/RPC/schema changes and no runtime water-navigation changes are included. This is source inspection via GitHub file reads; tests, typecheck, and build have not been executed. Empty status checks are not evidence of success.


## Save-slot follow-up audit

Inspected `apps/map-editor/editor/game-save.ts` and `editor/map-save-slot.ts`:

- `GameSaveSnapshot` is version 1 only and embeds `MapDocument` for `world` and optional `exterior`.
- `parseGameSaveSnapshot` rejects other envelope versions and canonicalizes each nested document with the v1 parser. Terrain semantics cannot survive this shape.
- `parseSaveSlotSnapshot` validates world/exterior identity and map types after parsing the v1 envelope.
- Therefore, a future combined save-slot format needs an explicit new envelope version and compatibility tests. Existing v1 saves must load as legacy/uninitialized states; no semantics may be inferred from tiles.
- The active save-slot parser and RPC path remain unchanged. No new persistence format is activated by this audit.

## Follow-up change-path audit — 2026-10-13

Scope: source inspection of the current `editor-shell.tsx` on `feat/vendrith-ecc-v1`. This update records findings only; it does not activate Terrain v2 or alter Save Slot / Supabase behavior.

### Active mutation paths and required combined-state handling

| Path in current editor | Current behavior observed | Requirement before v2 activation |
| --- | --- | --- |
| Initial state / incoming map | `history` is created from `initialDocument`; effect resets it when `initialDocument.id` or `initialDocumentRevision` changes. | Incoming props must carry an explicit initialized/legacy semantic state. On map identity change, semantics must reset with the document; on same-map revision changes, adoption must be atomic and must not accidentally preserve stale semantics. |
| Shared `commit(next)` | Updates `documentRef` synchronously and commits document-only `MapHistory`. | Replace with one combined-state commit boundary; keep a synchronous combined-state ref for Save to avoid render/effect lag. |
| Paint / erase | `handlePaint` calls `applyTerrainPaint` / `eraseTerrainPaint`. Gesture continuation replaces `present` directly and clears redo; first gesture event uses `commit`. | Define semantic-edit policy for paint and erase. Keep document + semantics in the same gesture entry and preserve current coalescing/redo-clearing behavior. Do not infer semantics from tile IDs. |
| Selection keyboard operations | Copy is read-only; paste, replace and move call `commit`; clear selection changes UI only. | Semantic effects must be explicitly defined for paste/replace/move. Clipboard must carry semantic records only if the selection contract deliberately supports them; otherwise it must not silently copy or discard semantics. |
| Toolbar undo / redo | `handleUndo` and `handleRedo` call v1 document history. | Switch toolbar handlers and keyboard shortcuts to the same combined history implementation in one coordinated change. |
| Keyboard undo / redo | Ctrl/Cmd+Z, Shift+Ctrl/Cmd+Z, Ctrl/Cmd+Y update v1 history directly. | Must be parity-tested with toolbar undo/redo and combined-state history. |
| Object transforms and scatter | Object placement, scatter, transform, delete and duplicate mutate `MapDocument` through `commit`. | Preserve semantic records unchanged when map coordinates do not change; define and test behavior for any operation that changes spatial bounds. |
| Layers / groups / templates | Layer visibility, lock, opacity, order, groups, templates and layer merge all route through document-only `commit`. | Keep semantics in the same authoritative state. For cell-changing layer merge/template operations, verify semantics are neither fabricated nor unintentionally lost. |
| Save / Save-Load / quick save | Buttons send `documentRef.current` or the document callback only. | Do not wire v2 semantics into existing v1 persistence. Introduce a versioned combined payload and all caller contracts together, after recovery/conflict/RPC validation. |
| Map identity / viewport | History reset depends on document ID and external revision; viewport reset uses `initialDocumentRevision`. | Reset/adopt document and semantic state as a single lifecycle transition; test rapid map switch and same-map external revision. |

### Audit conclusion

- The editor has one shared document-only `commit` boundary for most non-paint edits, but paint-gesture continuation bypasses it and directly replaces `history.present`. A migration that only changes `commit` would therefore be incomplete.
- Undo/redo exists through both toolbar callbacks and keyboard shortcuts; both currently operate on v1 history and must migrate together.
- `EditorShell` has no terrain-semantics prop or callback today. The v2 state helper's required `terrainSemantics` object cannot represent the legacy/uninitialized state returned by the v1 snapshot parser (`null`). Gate A therefore still needs an explicit editor-state union, e.g. initialized-v2 versus legacy-uninitialized, before the UI can safely adopt it.
- No ordinary map-dimension resize control was found in this `EditorShell` source. Object width/height transforms are present but are not map resize. Map resize must be traced in the parent/import workflow before Gate B.
- No source code, migrations, RPCs, or production data were changed by this follow-up. Tests, typecheck and build were not run in this audit-only commit.

### Gate A implementation order

1. Add a typed editor state that explicitly represents legacy/uninitialized semantics without inventing cells.
2. Add pure transition helpers for combined commits and paint-gesture continuation, with identity checks.
3. Test state transitions for normal commit, paint coalescing, undo/redo, branch clearing, map switch, same-map revision, and legacy-v1 adoption.
4. Only then change `EditorShell` props/history, and keep all save callbacks v1 until Gate C/D is completed.

