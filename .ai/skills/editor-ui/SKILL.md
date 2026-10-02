# Editor UI

## Purpose
Provide consistent UI engineering rules for the Vendrith Map Editor.

## Principles
- Optimize for editor productivity, not marketing-page aesthetics.
- Keep tool, panel, canvas, inspector, and status hierarchy explicit.
- Prefer existing shared components and composition before bespoke markup.
- Every interactive control needs clear hover, focus, disabled, loading, and error behavior where applicable.
- Preserve keyboard accessibility and predictable focus.
- Keep dense controls readable and group related actions.
- Avoid coupling UI state to canonical map data.

## Map Editor surfaces
- Toolbar
- Tool palette
- Layer/object panels
- Tileset/asset browser
- Canvas overlays
- Inspector
- Save/version dialogs
- Status and conflict feedback

## Review checklist
- State transitions are visible.
- Destructive actions have appropriate confirmation.
- Empty/loading/error states exist.
- Long-running actions prevent duplicate submission.
- UI state does not silently mutate domain state.
