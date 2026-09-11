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
- [~] Actual rendered Conflict Resolution UI integration
- [ ] Rebuild navigation/geometry/occupancy after applied merge

## Storage

- Engine and UI models: GitHub
- Authoritative map state and merge-version persistence: Supabase
- Conflict session state: client-side model until rendered UI integration
- Resolved merge commit: Supabase `map_versions` through `map_editor_commit_merge_v1`

## Current next task

Build the rendered Conflict Resolution UI around the existing session/application/persistence models, then connect the resolved document to the Supabase RPC and handle stale-version refresh/retry UX.
