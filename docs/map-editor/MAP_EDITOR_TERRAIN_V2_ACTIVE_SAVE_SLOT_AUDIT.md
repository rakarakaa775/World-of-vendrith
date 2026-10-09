# Game Save v2 — Active Save Slot Consumer Audit

Status: source audit complete; no active behavior changed.

## Scope

Trace the active Save Slot save/load path after adding the opt-in `game-save-state-v2.ts` adapter. This audit intentionally does not change the live editor, RPC payload, or production database.

## Active caller

`apps/map-editor/components/vendrith-world-builder-app.tsx` remains the active World Builder Save Slot consumer.

### Save path

The current Save Slot callback:

1. Resolves and saves the authoritative world and optional exterior through the existing identity persistence paths.
2. Builds the envelope using `serializeGameSaveSnapshot` from `editor/game-save.ts`.
3. Calls `map_editor_save_slot_v1` with the existing v1 envelope and authoritative world version reference.
4. Refreshes the slot list after RPC success.

It does not call `serializeGameSaveStateV2`. Therefore terrain semantics are not persisted by active Save Slot yet.

### Load path

The current Load Slot callback:

1. Calls `map_editor_load_save_slot_v1`.
2. Parses the RPC snapshot as JSON when needed.
3. Recognizes the legacy `vandrith.game-save` envelope and parses world/exterior via the v1 `parseMapDocument` path.
4. Validates the world identity against `AUTHORITATIVE_WORLD_MAP_ID`.
5. Checks that an exterior map is `playable`, then replaces the map collection and bumps `loadRevision`.

The callback does not call `parseGameSaveStateV2`; a version 2 envelope would currently be incorrectly treated as though its nested map payloads were v1 `MapDocument` objects. The current exterior guard also checks `mapType` but does not require `playableSpace === "exterior"` at this boundary.

## Integration blockers

- `EditorShell` state/history are still document-only; loading only a `MapDocument` would drop the separate terrain semantics.
- The active save path has no combined `MapEditorState` source for world/exterior.
- The RPC payload/version contract has not been audited end-to-end for a v2 envelope. Do not send v2 payloads to `map_editor_save_slot_v1` yet.
- The current load path does not atomically restore a pair of `MapEditorState` values, and does not restore terrain semantics.
- Existing identity/version checks must remain enforced if/when an adapter is integrated.

## Safe next sequence

1. Keep the new adapter opt-in and leave active Save/Load unchanged.
2. Add focused tests for v2 envelope parsing and existing identity/type guards (adapter-level tests already added).
3. Design a separate UI state integration that atomically owns world/exterior `MapEditorState`, including history/reset behavior.
4. Audit the Save Slot RPC SQL constraints and version/reference invariants before deciding whether it can store a v2 envelope unchanged.
5. Run focused Vitest, full Vitest, typecheck, and build in a real runner.
6. Only after tests and contract review, propose active integration. Production database changes require a separate audit and explicit approval.

## Verification

GitHub source inspection only. No Vitest, typecheck, build, or live database changes were performed for this audit.
