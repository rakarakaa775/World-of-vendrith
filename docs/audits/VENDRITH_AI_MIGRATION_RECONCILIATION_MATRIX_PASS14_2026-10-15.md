# Vandrith AI — Migration Reconciliation Matrix, Pass 14
**Date:** 2026-10-15  
**Status:** Read-only reconciliation draft. No migration is authorized for application.

## 1. Scope and evidence
Compared 26 local SQL files across `database/migrations` and `supabase/migrations` with the current 555-entry hosted migration ledger and read-only live catalog definitions. Classification distinguishes ledger name/version evidence from observed live schema/function evidence. A matching object in the live catalog does not by itself prove which migration created it; a missing ledger filename does not prove the schema change is absent.

## 2. Local-to-hosted matrix

| Local file | Hosted ledger evidence | Live evidence / classification | Required next action |
|---|---|---|---|
| `database/migrations/0001_vandrith_foundation_and_simulation.sql` | Exact name at hosted version `20260815041801`, local file is unversioned | **Equivalent hosted entry; version differs by design** | Preserve historical mapping; do not replay |
| `0002_energy_recovery_v1_0_rules.sql` | No exact name; hosted `energy_recovery_v1_0_rules` at `20260815164626` | **Equivalent candidate** | Compare SQL before declaring equivalent |
| `0003_fix_eat_food_recovery_trigger_v1_0.sql` | No exact name; hosted related food-recovery migrations exist | **Uncertain/likely equivalent family** | Match DDL/function bodies |
| `0004_energy_history_recovery_events_v1_0.sql` | Hosted `0004_energy_history_recovery_events_v1_0` at `20260816024648` | **Equivalent hosted entry candidate** | Compare SQL bodies and object state |
| `0005_fix_energy_trigger_order_for_recovery.sql` | Hosted `fix_energy_trigger_order_for_recovery` at `20260816031519` | **Equivalent hosted entry candidate** | Compare SQL bodies |
| `20261009004400_vendrith_ai_sessions_v1.sql` | `vendrith_ai_sessions_v1` at `20261008174537` | **Hosted equivalent name; local version differs** | Compare full SQL and policies |
| `20261009004600_vendrith_ai_sessions_require_non_anonymous.sql` | `vendrith_ai_sessions_require_non_anonymous` at `20261008174740` | **Hosted equivalent name; local version differs** | Compare policy expressions |
| `20261009005000_vendrith_ai_session_world_context_v1.sql` | `vendrith_ai_session_world_context_v1` at `20261008175146` | **Hosted equivalent name; local version differs** | Compare columns/check constraints |
| `20261009011000_vendrith_creator_action_proposals_v1.sql` | `vendrith_creator_action_proposals_v1` at `20261008175324` | **Hosted equivalent name; local version differs** | Compare table, grants, and policies |
| `20261009012000_vendrith_creator_action_approval_v1.sql` | `vendrith_creator_action_approval_v1` at `20261008175354` | **Hosted equivalent name; local version differs** | Compare full function body/ACL |
| `20261009013000_vendrith_runtime_intents_v1.sql` | No exact matching ledger entry surfaced in the 555-entry list | **Uncertain ledger mapping; runtime-intent table and enqueue RPC exist live** | Find the migration that introduced them or prove equivalent history |
| `20261009014000_vendrith_runtime_intent_consumer_v1.sql` | `vendrith_runtime_intent_consumer_v1` at `20261008180015` | **Hosted equivalent name; local version differs** | Compare status constraints and consumer functions |
| `20261009015000_vendrith_runtime_intent_retry_v1.sql` | `vendrith_runtime_intent_retry_v1` at `20261008182110` | **Hosted equivalent name; local version differs** | Compare SECURITY DEFINER body and ACL |
| `20261009015100_vendrith_runtime_mutation_lookup_v1.sql` | `vendrith_runtime_mutation_lookup_v1` at `20261008182401`; security-hardening follow-up at `20261008183110` | **Hosted equivalent family** | Compare both local stages with final hosted function/grants |
| `20261009015200_vendrith_runtime_persistence_v1.sql` | No exact matching ledger name found | **Uncertain ledger mapping; runtime persistence objects require catalog-by-catalog comparison** | Inventory all six persistence functions/tables and identify hosted versions |
| `20261009015300_vendrith_runtime_intent_reconciliation_v1.sql` | No exact matching ledger name found | **Uncertain/local-only candidate** | Verify reconciliation table/function live before any replay |
| `20261009016000_vendrith_development_action_proposals_v1.sql` | `vendrith_development_action_proposals_v1` at `20261008183805` | **Hosted equivalent name; local version differs** | Compare table and RLS |
| `20261009017000_vendrith_development_action_approval_v1.sql` | `vendrith_development_action_approval_v1` at `20261008184052` | **Hosted equivalent name; local version differs** | Compare approval/audit function |
| `20261009018000_vendrith_development_execution_v1.sql` | `vendrith_development_execution_v1` at `20261008184816` | **Hosted equivalent name; local version differs** | Compare finalize function, grants, and audit tables |
| `20261009020000_vendrith_phase4_rpc_execute_hardening_v1.sql` | Same name at `20261008201231` | **Hosted equivalent name; local version differs** | Compare every EXECUTE grant/revoke |
| `20261009020100_vendrith_phase4_rpc_anon_execute_hardening_v1.sql` | Same name at `20261008201247` | **Hosted equivalent name; local version differs** | Compare anon/PUBLIC ACLs |
| `20261009022000_vendrith_phase4_final_audit_hardening_v1.sql` | Same name at `20261008211645` | **Hosted equivalent name; local version differs; latest hosted entry** | Compare final policies and function body |
| `20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql` | No exact matching ledger name found | **Uncertain/local-only candidate** | Verify private table, function, grants, and live defaults |
| `supabase/migrations/20261003170000_remote_schema_baseline_reconstructed.sql` | No exact filename/name in hosted ledger | **Reconstructed baseline, not an ordinary forward migration** | Use as reference only; compare its objects to live catalog and source history |
| `supabase/migrations/20261011220000_map_editor_atomic_game_save_slot_v1.sql` | No exact entry | **Local candidate; live function lookup returned no function** | Keep unapplied; validate contract/tests, then review migration order |
| `supabase/migrations/20261012200000_map_editor_load_save_slot_validated_v1.sql` | No exact entry | **Local candidate; live function lookup returned no function** | Keep unapplied; validate dependency/order and tests |

**Interpretation:** Exact hosted names exist for much of the AI migration family, but hosted versions precede the local timestamp prefixes. The runtime-intent base, runtime persistence, reconciliation, rate-limit, and Save/Load candidates need more evidence before they can be classified as applied or local-only. Do not use version renaming or ledger insertion to make the lists look aligned.

## 3. Editor gateway leaf review — pass 14 addendum

### Duplicate-selection leaf — confirmed non-atomic JSON failure
Live `editor_batch_selection_duplicate_leaf_v2` iterates selected objects, calls `editor_duplicate_legacy_bridge_v1`, and returns the failure JSON with `created_before_failure` if a later duplicate returns `ok:false`. It does not raise an exception. PostgreSQL therefore does not automatically roll back earlier inserts just because this function returns a failure-shaped JSON object.

### Transform-selection leaf — exception handler gives stronger rollback semantics
Live `editor_batch_selection_transform_leaf_v2` performs a validation pass before writes; in the mutation pass it raises on a failed transform or command record. Its outer `EXCEPTION WHEN OTHERS` returns a failure JSON. PL/pgSQL rolls back statements within the protected block before entering that handler, so this is materially different from the duplicate-selection leaf. A disposable PostgreSQL regression should still prove that all object and command-group writes roll back under the actual gateway path.

### Delete and footprint helper — ignored returned failure
Live `editor_delete_object_leaf_v1` executes `PERFORM public.remove_map_object_footprint(o.id)`, then deletes geometry and the object without inspecting the returned JSON. The helper itself can return `ok:false` if a navigation-cell refresh returns failure without raising. This can allow delete to continue after a failed footprint/navigation refresh. Fix contract should either raise on helper failure or explicitly reconcile affected navigation state transactionally.

### Paste
The live paste leaf preflights approved assets and collision geometry before starting writes. The complete mutation/finalization path still needs line-by-line review for JSON failure returns after command group/object inserts; no conclusion of full atomicity is recorded yet.

## 4. Additional read-only live checks
- The hosted database did not contain `map_editor_save_game_slot_atomic_v1` or `map_editor_load_game_slot_validated_v1` when queried by exact function name/signature. This supports keeping the two local candidate migrations unapplied.
- No production data writes or DDL were executed in this pass.
- Two stopped PostgreSQL 17 containers found in the prior pass remain untouched; their removal was not necessary for this read-only comparison.

## 5. Release gates before a migration draft
1. Complete function/table-level mapping for the uncertain AI migration rows, including hosted definition hashes or exact body comparisons against local SQL.
2. Compare final effective privileges against local intended grants, including default privileges for `postgres` and `supabase_admin`.
3. Resolve the proposal server-owned state transition and runtime intent worker execution model.
4. Design atomic duplicate-selection and delete-footprint failure handling; test all leaves for JSON failure after writes.
5. Reconcile local migration ordering with hosted ledger without rewriting history.
6. Only then create a draft migration using the repository's supported migration tooling and run disposable PostgreSQL/Supabase role tests. Production application requires separate explicit approval.

**Pass 14 remains read-only. No migration has been applied or authorized.**
