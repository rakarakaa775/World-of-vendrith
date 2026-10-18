# Vendrith AI — Hosted Definition and Migration Reconciliation (Pass 19)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Read-only inspection of hosted PostgreSQL function catalog and migration ledger, followed by local source/hash comparison against `supabase/migrations/20261003170000_remote_schema_baseline_reconstructed.sql`. No hosted writes or schema changes were performed.

## Hosted function comparison
The hosted catalog exposes these inspected signatures in `public`: `begin_map_editor_command_group`, `close_map_editor_command_group`, `editor_batch_selection_duplicate_leaf_v2`, `editor_delete_object_leaf_v1`, `editor_duplicate_legacy_bridge_v1`, two overloads of `editor_mutation_gateway_v1`, `editor_paste_leaf_v2`, `remove_map_object_footprint`, `sync_map_object_footprint`, and `sync_map_object_obb_v1`. All inspected functions are SECURITY INVOKER (`prosecdef=false`).

**Reconciled: all 11 function definitions/signatures match the reconstructed baseline after normalizing whitespace.** Initial hash differences for the 13-argument `editor_mutation_gateway_v1` and `sync_map_object_obb_v1` were caused by a leading whitespace character in the hosted source representation; adding that leading character makes their normalized MD5 match the local source. No semantic discrepancy was found in these two definitions by this comparison.

## Confirmed live behavior
The hosted definitions confirm the atomicity patterns previously reproduced in disposable fixtures:
1. `editor_paste_leaf_v2` extracts `group_id` from the JSON result of `begin_map_editor_command_group` without checking `ok`; it uses `PERFORM` for `sync_map_object_obb_v1` and `sync_map_object_footprint`, then updates/closes the group without validating returned JSON.
2. `editor_batch_selection_duplicate_leaf_v2` returns failure JSON with `created_before_failure` after a gateway failure, without raising an exception to roll back prior successful duplicates.
3. `editor_delete_object_leaf_v1` ignores the JSON result from `remove_map_object_footprint`, then deletes geometry/object and returns success.
4. The hosted 13-argument `editor_mutation_gateway_v1` also contains a delete path that `PERFORM`s `remove_map_object_footprint` and proceeds with deletion, so the unchecked helper-result risk exists on a second entry point.

These are live hosted function-definition observations, not just fixture assumptions. No function was invoked to mutate production data.

## Migration-ledger reconciliation
- Hosted ledger contains **555** rows; first version `20260815041801`, latest version `20261008211645` (`vendrith_phase4_final_audit_hardening_v1`).
- Hosted editor-gateway sequence is recorded around `20260831130103`–`20260831133321`, including gateway, legacy-delete hardening, mutation leaves, batch leaves, wrapper hardening, and final authority work.
- Hosted AI session/proposal sequence appears at versions `20261008174537`–`20261008184816`, with Phase 4 hardening through `20261008211645`.
- Local `database/migrations/20261009*.sql` names and timestamps are not the same ledger version identifiers as the hosted Oct 8 entries. Matching names or live objects are evidence of likely equivalence, not proof that every local SQL file equals the migration applied remotely.
- Local `20261009013000_vendrith_runtime_intents_v1.sql`, `20261009015200_vendrith_runtime_persistence_v1.sql`, `20261009015300_vendrith_runtime_intent_reconciliation_v1.sql`, and `20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql` remain special review items because the ledger does not contain exact matching names. Existing hosted objects are not sufficient to prove each local migration is applied byte-for-byte.
- The two local map-editor migrations `20261011220000_map_editor_atomic_game_save_slot_v1.sql` and `20261012200000_map_editor_load_save_slot_validated_v1.sql` have no exact ledger entry. Earlier read-only checks did not find the corresponding exact new RPC names. They remain unapplied candidates until a full object-level comparison says otherwise.

## Gate and next actions
1. Reconcile the four uncertain AI migration files against hosted table/function/policy definitions and their migration intent; do not repair the ledger by assumption.
2. Keep the Save/Load migrations un-applied until their expected functions, tables, grants, RLS and migration ordering are reconciled against the hosted state.
3. Then finalize the AI roadmap with evidence-linked work items and acceptance tests before adding any candidate packages.

No hosted mutation, migration application, migration-ledger repair, package installation, deployment, commit, or push occurred. Foundation 11-table specification and ERD remain unchanged.
