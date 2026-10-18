# Vendrith AI — Duplicate/Delete Leaf Atomicity Check (Pass 18)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Executed the reconstructed local SQL bodies for `editor_batch_selection_duplicate_leaf_v2`, `editor_duplicate_legacy_bridge_v1`, `editor_delete_object_leaf_v1`, and `remove_map_object_footprint` in a disposable PostgreSQL 17 fixture. Minimal table stubs were used; the mutation gateway and navigation-refresh dependency were controlled test doubles to inject deterministic failures. The exact duplicate/delete leaf and helper bodies were extracted unchanged from `supabase/migrations/20261003170000_remote_schema_baseline_reconstructed.sql`.

This is a source-level control-flow integration test, not a full schema import and not proof that these exact definitions are the current hosted definitions. No hosted mutating RPC, production DDL/data mutation, migration application, ledger repair, package installation, deployment, commit, or push occurred. The new `vendrith-pass18-pg` container and temporary SQL were removed; pre-existing stopped containers were left untouched.

## Test 1 — duplicate failure on item 2
**PASS — partial write reproduced.** The test gateway returned success for the first selected object and injected `{ok:false}` for the second. The actual duplicate leaf returned failure JSON with `created_before_failure: 1`, while the database still contained the two originals plus the first duplicate (3 objects). The function returned normally rather than raising, so PostgreSQL did not roll back the first duplicate.

## Test 2 — delete footprint refresh failure
**PASS — unchecked helper failure reproduced.** The actual footprint-removal helper received an injected navigation-refresh `{ok:false}`. The actual delete leaf ignored that JSON result, deleted the geometry and object, and returned `ok:true` with `committed:true`. The assertion confirmed the object and its geometry row were gone. This fixture did not model the full navigation projection schema; it proves the caller's unchecked-result behavior, not the complete hosted side effect.

## Required remediation
- Duplicate: preflight or execute each item within an exception-driven transaction boundary; any failed gateway result after earlier writes must raise so the entire statement rolls back. Prefer all-or-nothing behavior for selection duplication.
- Delete: check the footprint-removal result and raise if it is not `ok:true`; ensure projection updates and object/geometry deletion are atomic.
- Add regression assertions against the reconciled canonical source and relevant role/RLS setup; inspect the actual hosted function definitions before treating these results as production-state proof.

## Gate
The source-level failure patterns are now reproduced for paste, duplicate, and delete. The canonical local migration stream versus hosted migration history/definitions is still unreconciled, and the AI roadmap is not final. No production remediation has been applied.
