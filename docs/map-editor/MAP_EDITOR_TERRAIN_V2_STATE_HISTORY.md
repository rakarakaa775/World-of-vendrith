# Map Editor Terrain v2 — Combined State History

Status: **opt-in helper; active EditorShell history remains v1/document-only**.

## Why this exists

The active `EditorShell` history currently stores `MapDocument` only. Using that history for terrain v2 would allow undo/redo to restore the visual document without restoring terrain semantics. This helper stores each history entry as the whole `MapEditorState` union instead.

## Guarantees

- Supports both legacy/uninitialized and initialized v2 states.
- Validates canonical map document and terrain semantics before a commit.
- Undo/redo restores the entire state atomically.
- Cross-map commits are rejected; loading another map must reset history.
- New commits clear redo history.
- Retained past/future history is bounded to 100 entries.
- Resize must pass through `replaceMapEditorDocument` first so semantics are clipped and validated.

## Integration boundary

This helper is not wired into `EditorShell`, Save/Load, recovery, save slots, conflict-save, Supabase RPC, or runtime water navigation. It does not change production data contracts. Tests have been authored but not executed in this GitHub-only workflow.
