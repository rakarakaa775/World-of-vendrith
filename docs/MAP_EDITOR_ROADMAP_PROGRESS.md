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
- [x] Wire controller into persisted MapEditorApp Save action
- [x] Retain load-time base document and authoritative version for the editing session
- [~] Stale-version refresh/retry UX — stale conflict is preserved and remote version is surfaced; interactive rebase/retry still requires runtime verification
- [ ] End-to-end browser conflict-flow verification
- [ ] Foundation Exit Gate

## Current vertical slice

`load(version N) → retain base → edit → save → read authoritative remote → detect stale → three-way merge → conflict UI → resolve → commit(expected N) → N+1 → reconciliation → refresh`

The persisted MapEditorApp Save action now calls `saveWithConflictDetection()`. The editor retains the loaded base document and authoritative `version_number`; a stale remote version opens the existing conflict overlay instead of overwriting remote state. A successful save/merge advances both the authoritative version and the retained base document.

The remaining Foundation work is runtime verification of the stale/rebase/retry interaction and browser E2E. No browser/Vercel deployment is currently connected in this session, so those checks cannot truthfully be marked complete from repository inspection alone.

## Verification note — 2026-09-11

Supabase `map_versions.version_number` is authoritative. `map_editor_commit_merge_v1` locks the map, compares `p_expected_version`, returns `conflict` without insertion when stale, and on success inserts the next version and invokes reconciliation transactionally.

## Current next task

Run the actual editor against a configured deployment/browser and execute the two-client stale-save scenario: both clients load version N; client A commits N+1; client B saves against base N; B must open conflict UI, resolve, commit against the authoritative remote version, and refresh to N+2. Then run the existing automated tests/build and close the Foundation Exit Gate only after those checks pass.
