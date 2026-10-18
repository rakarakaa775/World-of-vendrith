# Vendrith AI — Paste Failure Contract Follow-up (Pass 16)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Reviewed the reconstructed local SQL baseline's complete `editor_paste_leaf_v2` body and its directly relevant helper definitions. Ran an isolated PostgreSQL 17 fixture modeling the same unchecked JSON-return control flow. This was not a full import of the production schema or the actual function graph. No hosted mutating RPC, production DDL/data mutation, migration application, ledger repair, package installation, deployment, commit, or push occurred. The new `vendrith-pass16-pg` container and temporary SQL were removed; older stopped containers were left untouched.

## Additional source findings
1. `editor_paste_leaf_v2` reads `group_id` from `begin_map_editor_command_group(...)` without checking the returned `ok` field. If that helper returns `{ok:false}`, `group_id` can be null while paste proceeds to insert objects.
2. The paste loop calls `sync_map_object_obb_v1` and `sync_map_object_footprint` using `PERFORM`, ignoring their JSON results. The local baseline's `sync_map_object_footprint` returns `{ok:false}` when `refresh_map_navigation_cell_v1` fails. Because the helper can return failure JSON after earlier cell work, the caller can continue after a partially applied navigation projection.
3. The final `UPDATE map_editor_command_groups ... WHERE id=group_id` and `close_map_editor_command_group(group_id)` result are not validated. A missing/failed group can therefore coexist with an `ok:true` paste response.
4. This means the function can violate both mutation atomicity and response truthfulness: it can report success even when geometry/navigation synchronization or command-group lifecycle failed. SQL exceptions still abort the statement, but returned JSON failures do not.

## Disposable fixture result
**PASS — reproduced caller failure pattern.** A minimal fixture returned failure JSON from group creation and footprint synchronization. The paste-style caller ignored both, inserted an object and partial geometry row, and returned `ok:true` with a null group ID. The assertion passed. This demonstrates the unchecked-result pattern; it is not proof that the full production schema will hit every failure branch in a particular deployment.

## Required remediation before migration
- Check `begin_map_editor_command_group` result and require a valid group ID before writes.
- Check each OBB/footprint helper result. If any result is not `ok:true`, raise an exception so all writes in the statement roll back.
- Validate the command-group update and close result; failure must raise, not be ignored.
- Add real-function disposable integration tests with injected failure on the second pasted object, navigation refresh, OBB synchronization, group update, and group close. Assert no objects, geometry, navigation cells, or command-group rows survive the failed statement.
- Apply the same explicit return-contract review to duplicate and delete callers. Keep production untouched until migration streams and downstream dependencies are reconciled.
