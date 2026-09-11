# Map Editor Roadmap Progress

## Foundation — Conflict / Persistence

- [x] Snapshot comparison diff model
- [x] Three-way merge foundation
- [x] Delete-vs-edit reconciliation
- [x] Conflict resolution session model
- [x] Conflict resolution view contract
- [x] Rendered Conflict Resolution panel
- [x] Conflict resolution overlay
- [x] Canonical resolution → MapDocument
- [x] Apply gate tests
- [x] Optimistic merge persistence RPC — `map_editor_commit_merge_v1`
- [x] Optimistic merge persistence adapter
- [x] Supabase optimistic merge persistence bridge
- [x] Authoritative runtime `version_number` exposed by `map_editor_get_runtime_snapshot_v1`
- [x] MapEditorApp authoritative-version wiring for resolved conflict commit
- [x] Stale-save conflict controller — `apps/map-editor/editor/map-conflict-save-controller.ts`
- [x] Stale-save conflict controller test
- [x] Reconciliation after successful merge commit
- [~] Rendered UI live conflict trigger — controller is implemented, but the existing Save button still needs to invoke it
- [ ] Wire controller into the editor Save action and retain base snapshot/version for the editing session
- [ ] Stale-version refresh/retry UX
- [ ] End-to-end browser conflict-flow verification
- [ ] Foundation Exit Gate

## Current vertical slice

`load(version N) → retain base → edit → save → read authoritative remote → detect stale → three-way merge → conflict UI → resolve → commit(expected N) → N+1 → reconciliation → refresh`

The stale-save controller now implements the core detection/commit branch: it loads the authoritative remote snapshot, compares its version to the retained expected version, constructs `MapMergeResult`, and commits a clean merge through the optimistic RPC. If the RPC races and returns `conflict`, it reloads remote state and returns a fresh merge result rather than overwriting remote state.

The remaining work is wiring that controller into the actual editor Save action and retaining the load-time base document/version in the editor session. This is deliberately not marked complete until the real UI path is exercised.

## Verification note — 2026-09-11

Supabase `map_versions.version_number` is authoritative. `map_editor_commit_merge_v1` locks the map, compares `p_expected_version`, returns `conflict` without insertion when stale, and on success inserts the next version and invokes reconciliation transactionally.

## Current next task

Wire `saveWithConflictDetection()` into `MapEditorApp`'s persisted Save action. On load, retain both the loaded `MapDocument` and `version_number` as the editing base. On Save, call the controller; if it returns `conflict`, open the existing overlay; if committed, update the base document/version. Then verify the stale-save path in the browser before closing Foundation.
