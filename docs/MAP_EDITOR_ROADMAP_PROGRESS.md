# Map Editor Roadmap Progress

This file supplements `docs/MAP_EDITOR_ROADMAP.md` with implementation checkpoints when the master roadmap is not safely patchable through the connected GitHub API.

## Reliability / Conflict Resolution

- [x] Snapshot comparison diff model — `apps/map-editor/editor/map-conflict-diff.ts`
- [x] Snapshot comparison diff tests — `apps/map-editor/editor/map-conflict-diff.test.ts`
- [x] Entity/cell-level three-way merge foundation — `apps/map-editor/editor/map-entity-merge.ts`
- [x] Entity/cell merge tests — `apps/map-editor/editor/map-entity-merge.test.ts`
- [x] Delete-vs-edit reconciliation foundation — `apps/map-editor/editor/map-merge-reconcile.ts`
- [x] Delete-vs-edit / derived-state tests — `apps/map-editor/editor/map-merge-reconcile.test.ts`
- [x] Conflict resolution UI session model — `apps/map-editor/editor/map-conflict-resolution-ui-model.ts`
- [x] Conflict resolution UI model tests — `apps/map-editor/editor/map-conflict-resolution-ui-model.test.ts`
- [x] Conflict resolution application model — `apps/map-editor/editor/map-conflict-resolution-apply.ts`
- [x] Conflict resolution application tests — `apps/map-editor/editor/map-conflict-resolution-apply.test.ts`
- [x] Conflict resolution view contract — `apps/map-editor/editor/map-conflict-resolution-view.ts`
- [x] Conflict resolution view tests — `apps/map-editor/editor/map-conflict-resolution-view.test.ts`
- [x] Optimistic merge persistence RPC — Supabase `map_editor_commit_merge_v1`
- [x] Optimistic merge persistence adapter — `apps/map-editor/editor/map-merge-persistence.ts`
- [x] Optimistic merge persistence adapter tests — `apps/map-editor/editor/map-merge-persistence.test.ts`
- [x] Rebuild navigation/geometry/occupancy after applied merge — Supabase `map_editor_reconcile_after_merge_v1`, invoked transactionally by `map_editor_commit_merge_v1`
- [x] Supabase optimistic merge persistence bridge — `apps/map-editor/editor/map-merge-persistence-supabase.ts`
- [x] Supabase optimistic merge persistence bridge tests — `apps/map-editor/editor/map-merge-persistence-supabase.test.ts`
- [x] Atomic resolved-conflict commit flow — `apps/map-editor/editor/map-conflict-commit.ts`
- [x] Atomic resolved-conflict commit flow tests — `apps/map-editor/editor/map-conflict-commit.test.ts`
- [x] Rendered conflict overlay boundary — `apps/map-editor/components/conflict-resolution-editor-overlay.tsx`
- [~] Actual rendered Conflict Resolution UI integration — panel and overlay exist and are mounted by `MapEditorApp`, but the editor does not yet produce a live three-way conflict context from its Save/Load path
- [ ] Live conflict trigger with authoritative base/version context
- [ ] Stale-version refresh/retry UX
- [ ] End-to-end browser conflict-flow verification

## Verification note

Verified against the live Supabase function definitions on 2026-09-11. `map_editor_commit_merge_v1` inserts the next authoritative `map_versions` row only when `p_expected_version` matches the current version, then invokes `map_editor_reconcile_after_merge_v1` before returning success. The reconciliation function validates map ownership/version, removes only orphan geometry, synchronizes object OBB geometry for the map, rebuilds navigation, and updates the runtime snapshot with the committed version. Reconciliation failure therefore aborts the transaction rather than leaving a known-stale committed version.

The stale-version branch returns `conflict` before version insertion/reconciliation, preserving optimistic concurrency semantics.

The client-side atomic commit helper now preserves that result: a stale commit is returned as `conflict` and is not treated as persisted.

## Storage

- Engine and UI models: GitHub
- Authoritative map state and merge-version persistence: Supabase
- Conflict session state: client-side model until live conflict triggering is integrated
- Resolved merge commit: Supabase `map_versions` through `map_editor_commit_merge_v1`

## Current next task

Complete the live conflict trigger: retain the authoritative base snapshot and its version when the editor loads/starts editing, detect a stale Save against the authoritative snapshot, build `MapMergeResult(base, local, remote)`, open the rendered resolution overlay, then commit the resolved document with that retained expected version. After a stale response, refresh remote state and reopen/rebase rather than silently overwriting it. Finish with browser E2E verification and then reassess the Foundation exit gate before moving to the next phase.
