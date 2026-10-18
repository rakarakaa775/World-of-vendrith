# Vendrith AI — Reconstructed Paste Function Integration Check (Pass 17)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Extracted the complete `editor_paste_leaf_v2`, `sync_map_object_obb_v1`, `sync_map_object_footprint`, `begin_map_editor_command_group`, and `close_map_editor_command_group` definitions from `supabase/migrations/20261003170000_remote_schema_baseline_reconstructed.sql`. Executed those function bodies unchanged in a new disposable PostgreSQL 17 container with minimal table stubs. The navigation-refresh helper was intentionally stubbed to return `{ok:false}` to inject a deterministic failure. This is a stronger source-level integration check than the prior hand-modeled caller fixture, but it is **not** a full import of the reconstructed baseline, and the source file is a reconstructed local baseline rather than proof of the exact currently deployed function bodies.

No hosted mutating RPC, production DDL/data mutation, migration application, ledger repair, package installation, deployment, commit, or push occurred. The newly created `vendrith-pass17-pg` container and temporary SQL were removed by cleanup; the two pre-existing stopped containers were not touched.

## Test and result
**PASS — actual reconstructed paste/helper bodies reproduce the unchecked failure contract.**

The fixture deliberately set the authenticated user to a different owner than the map creator. The actual `begin_map_editor_command_group` body therefore returned `ok:false` without a group ID. The actual paste function ignored that result, continued inserting the object, and invoked the actual OBB and footprint synchronization bodies. The injected navigation refresh returned failure JSON; the actual footprint helper propagated failure JSON, but paste ignored it too. The paste function then returned:

- `ok: true`
- `group_id: null`
- `objects_created: 1`

Assertions confirmed one `map_objects` row and one `map_object_geometry` row remained, while zero command-group rows existed. PostgreSQL completed the statement normally because these were JSON failures rather than raised exceptions.

## Interpretation and limits
This confirms the control-flow defect in the extracted reconstructed SQL: failure JSON from group creation and footprint synchronization does not automatically abort the statement, and the success response can overstate completion. It does **not** prove that this exact body is the live deployed version, nor does it certify the complete schema, RLS/grants, every helper dependency, concurrency, or all failure paths.

## Remediation gate
Before migration:
1. Validate the result from `begin_map_editor_command_group` and require a non-null group ID before any object writes.
2. Validate OBB and footprint helper results. Convert a failed result into an exception so all writes in the statement roll back.
3. Validate the command-group update and close result, raising on failure.
4. Add tests against the reconciled canonical SQL stream for failure on paste item 2, OBB sync, footprint/navigation refresh, group update, and group close; assert no object, geometry, navigation, or journal changes survive.
5. Separately test the exact duplicate and delete functions with their real helper bodies. Reconcile the local reconstructed source against hosted definitions before treating any source-level result as deployment evidence.

No production mutation or active migration was performed. Foundation 11-table specification and ERD remain unchanged.
