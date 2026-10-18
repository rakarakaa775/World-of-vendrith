# Vendrith AI — Editor Leaf Atomicity Audit (Pass 15)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`  
**Scope:** Read-only hosted function inspection, local baseline review, isolated PostgreSQL 17 behavior fixtures.

## 1. Safety boundary
No hosted mutating RPC, production DDL/data mutation, migration application, ledger repair, package installation, deployment, commit, or push occurred. Existing stopped containers `vendrith-runtime-pg` and `vendrith-runtime-pg2` were left untouched. A new disposable container `vendrith-pass15-pg` was created for this pass and removed after completion, along with its temporary SQL fixture. The Foundation 11-table specification and ERD were not changed.

## 2. Hosted function review
Read-only catalog definitions inspected: `editor_batch_selection_duplicate_leaf_v2`, `editor_batch_selection_transform_leaf_v2`, `editor_duplicate_legacy_bridge_v1`, `editor_delete_object_leaf_v1`, `remove_map_object_footprint`, and `editor_paste_leaf_v2`.

### Confirmed risks
1. **Selection duplicate — partial commit risk.** The loop calls `editor_duplicate_legacy_bridge_v1`; if a later item returns JSON `ok:false`, the wrapper returns that JSON plus `created_before_failure`. It does not raise, so prior inserts can persist despite an overall failed result.
2. **Delete — ignored helper failure.** `editor_delete_object_leaf_v1` executes `PERFORM remove_map_object_footprint(...)`, ignores the returned JSON, then deletes geometry and the object. The helper can return `ok:false` if a navigation-cell refresh reports failure without raising. The caller should raise on a false helper result so the statement transaction rolls back.
3. **Selection transform — stronger exception shape.** It raises when a transform or command-record result fails during writes and catches outside the protected block. This is a stronger rollback shape than returning failure JSON after writes, but the actual function graph still needs an integration regression.
4. **Paste — atomicity not yet proven.** It preflights approved assets and collision geometry, then creates a command group and objects. During writes it calls `sync_map_object_obb_v1` and `sync_map_object_footprint` with `PERFORM`, so JSON failure values are not inspected. SQL exceptions abort the statement, but helper failure reported only as JSON could be silently ignored. Command-group metadata/finalization also needs a complete failure-contract review.

## 3. Disposable PostgreSQL 17 fixture
The fixture used minimal simulated functions, not the production schema or actual hosted function graph.
- **PASS — duplicate pattern:** first simulated duplicate inserted; second returned `ok:false`; wrapper returned failure with `created_before_failure=1`; first insert remained.
- **PASS — transform exception pattern:** fixture wrote a command record and object, then raised inside a protected block; both writes were absent after the exception handler returned failure.
- **PASS — delete helper-result pattern:** helper returned `ok:false`; caller ignored it and returned success after deleting the object.

The temporary container and SQL fixture were removed. These results verify PostgreSQL control-flow semantics and identified patterns only; they do not prove end-to-end behavior for every production function, trigger, RLS role, or geometry helper. Paste’s helper-return hazard was identified by source inspection, not by a full production-dependency fixture.

## 4. Remediation requirements (design only)
1. Make batch duplicate atomic: preflight every selected object and ensure a leaf failure raises/propagates rather than returning failure JSON after prior writes. If a helper uses JSON failure values, every caller must check them and abort the whole operation.
2. Make delete check the `remove_map_object_footprint` result. If `ok` is not true, raise before deleting geometry/object.
3. For paste, inspect/enforce return contracts for OBB sync, footprint sync, command-group updates, and close/finalization. Any failure after the first insert must roll back all writes.
4. Add disposable integration tests against the actual SQL definitions and representative roles/RLS. Inject failure on duplicate item 2, footprint/navigation refresh, paste synchronization, and command-group finalization; assert object, geometry, navigation, and command-journal state all roll back.
5. Keep hosted DB untouched until migration-stream reconciliation is complete.

## 5. Pass 15 outcome
Source review and minimal fixture are complete. **Full actual-function integration proof remains open**, especially paste helper semantics and failure injection through the real gateway. No implementation fix was applied or authorized in this pass.
