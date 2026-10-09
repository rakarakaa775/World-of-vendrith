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
