# Map Editor State / Identity Audit — 2026-09-17

Status: In progress
Roadmap phase: Phase 0 — Foundation Audit
Scope: STATE-001, STATE-002, STATE-003 and the active V4 editor state boundary.

## Audited files

- `apps/map-editor/components/map-editor-app-v4.tsx`
- `apps/map-editor/components/editor-shell.tsx`
- `apps/map-editor/components/map-browser.tsx`
- `apps/map-editor/editor/map-document.ts`
- `apps/map-editor/editor/map-manager.ts`
- `apps/map-editor/editor/playable-hierarchy.ts`

## Findings

### STATE-001 — Active map and persistence target can diverge

`MapEditorAppV4` stores `activeMapId` and `connectedMapId` separately. `MapBrowser` changes the active map by calling only `onOpen(node.id)`. It does not invalidate or update `connectedMapId`, `baseDocument`, or `version` at the same navigation boundary.

The current `ensureConnection()` can repair this later when Save/Load is invoked, but the editor state is temporarily allowed to represent:

```text
activeMapId = newly selected map
connectedMapId = previous persisted World Map
baseDocument = previous persisted document
version = previous persisted version
```

This violates the intended state invariant until another persistence operation repairs the connection.

### STATE-002 — Stale document publication risk exists at map-switch boundary

`EditorShell` receives `initialDocument={active}`. Its history is reset only when `initialDocument.id` changes, which is consistent with the current anti-flicker rule for ordinary edits.

However, `MapBrowser` changes `activeMapId` without an explicit load/navigation transaction. During the React update boundary, the parent still holds the previous `maps`/`active` relationship until the next render, while `EditorShell` continues to publish its current `history.present` through `onDocumentChange`.

The audit therefore identifies a lifecycle risk: map selection and document replacement are separate events rather than one explicit `openMap(requestedMapId)` transaction.

No evidence was found that `EditorShell` mutates `document.id` during ordinary paint/edit operations. The risk is the boundary between navigation and history publication, not an identified ID mutation inside the editor tools.

### STATE-003 — Failed persistence protection is incomplete at the application boundary

The Save and Load handlers generally update persisted-state markers only after successful operations. `loadLatest()` uses `adopt()` after retrieval, and `loadSlot()` parses before replacing the parent map state.

This is positive, but the application has no explicit transaction object separating:

```text
requested map
→ retrieved snapshot
→ validated identity
→ document adoption
→ history replacement
→ persistence metadata adoption
```

For Load Slot specifically, the returned snapshot is parsed but the frontend does not verify `doc.id === requested mapId` before setting `activeMapId`, `connectedMapId`, `baseDocument`, and `version`.

### Additional foundation finding — local child maps are not persistence targets in V4

`MapBrowser` can create Region/Playable/Interior documents locally. V4 `ensureConnection()` rejects non-world active documents with `Only the persisted World Map can be saved in this phase`.

Therefore the UI exposes map creation/navigation beyond the currently persisted V4 World Map workflow. This is a product-scope gap, not evidence that the Save RPC itself is broken.

## Evidence summary

| Invariant | Current evidence | Status |
|---|---|---|
| Active map ID is explicit | `activeMapId` state exists | PASS |
| Persistence target is explicit | `connectedMapId` state exists | PASS |
| Navigation synchronizes both atomically | MapBrowser only calls `onOpen` | GAP |
| Ordinary edits reset history | EditorShell dependency is `initialDocument.id` | PASS against anti-flicker rule |
| Load is an explicit document boundary | `adopt()` replaces parent state, but navigation is separate | PARTIAL |
| Load Slot validates requested identity | `doc.id` is not checked against `id` | GAP |
| Failed load leaves current document intact | Parse occurs before replacement in Load Slot | PASS for this path; broader transaction guard remains GAP |
| Non-world creation matches persistence scope | V4 rejects non-world saves | GAP / DEFERRED SCOPE |

## Conclusion

The foundation issue is primarily a **state-machine boundary problem**, not yet a proven database Save failure.

The next safe implementation target is to introduce an explicit map-open/navigation transaction so that selecting a map cannot leave stale persistence metadata attached to the newly selected document. That change should preserve the current `EditorShell` rule that ordinary edits do not reset history.

Before implementation, the Save/Load audit should also add the explicit frontend identity check for Load Latest and Load Slot, and the behavior should be tested with an injected mismatched snapshot.

No runtime code or Supabase behavior was changed during this audit.
