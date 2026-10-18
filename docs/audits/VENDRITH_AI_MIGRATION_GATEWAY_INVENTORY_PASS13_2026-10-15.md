# Vandrith AI Transaction & Migration Inventory — Pass 13
**Date:** 2026-10-15  
**Status:** Read-only inventory; migration reconciliation is NOT complete.  
**Scope:** Local migration streams, hosted migration ledger, approval/enqueue call sites, gateway overloads, relevant live ACL/RLS/trigger definitions, and failure-after-write behavior.

## 1. Safety boundary
This pass used read-only hosted catalog queries and local source inspection. No production RPC mutation, DDL, migration application, data write, migration-ledger repair, package installation, deployment, commit, or push was performed. Existing worktree changes were preserved. This document is an audit artifact, not an executable migration.

## 2. Migration-stream inventory

### Local files
- `database/migrations`: 23 SQL files.
- `supabase/migrations`: 3 SQL files.
- Total currently visible local migration files: 26.
- `database/migrations` includes five older non-timestamped files (`0001`–`0005`) and a timestamped Vendrith AI sequence dated 2026-10-09.
- `supabase/migrations` contains:
  - `20261003170000_remote_schema_baseline_reconstructed.sql`
  - `20261011220000_map_editor_atomic_game_save_slot_v1.sql`
  - `20261012200000_map_editor_load_save_slot_validated_v1.sql`

### Hosted ledger
A fresh read-only `list_migrations` result contained **555 entries**. The latest hosted entry is `20261008211645 vendrith_phase4_final_audit_hardening_v1`. The hosted ledger includes the editor gateway history (including `add_editor_mutation_gateway_v1` and `extend_editor_mutation_gateway_for_batch_operations_v1`) and the AI session/proposal/runtime-intent stream under hosted versions dated 2026-10-08.

### Reconciliation status: BLOCKED
The local timestamped AI migrations use 2026-10-09 version prefixes while the hosted ledger has conceptually corresponding migrations dated 2026-10-08 with different versions. The local save-slot migrations dated 2026-10-11 and 2026-10-12 do not appear as exact version/name entries in the current hosted ledger. The reconstructed baseline filename is not a hosted ledger entry by that exact name.

This proves the streams are not currently one-to-one by filename/version; it does **not** prove every related schema object is absent from the live database. Live catalog definitions must be compared to each migration's SQL and the hosted ledger before deciding whether a file is applied, equivalent under another version, local-only, or reconstructed. Do not run `db push`, `db reset`, `db pull`, or migration-history repair as a shortcut.

## 3. Live approval and runtime flow

### Application call sites
- `apps/map-editor/app/api/vendrith-ai/route.ts` calls `approve_vendrith_creator_action_v1`, then reads the proposal's `action`, then calls `enqueue_vendrith_runtime_intent_v1` if a `runtimeAction` exists.
- Approval and enqueue are separate RPC statements/transactions. If enqueue fails after approval/mutation, the proposal may remain approved without a durable runtime intent. This remains a transaction-boundary defect, not a solved atomic workflow.
- `apps/map-editor/app/api/vendrith-runtime-intents/route.ts` separately drives retry/claim/consume/finish/reconciliation.

### Hosted function properties
- `approve_vendrith_creator_action_v1(uuid)`: SECURITY INVOKER; `search_path=public, pg_temp`; EXECUTE is granted to authenticated and trusted database roles, not PUBLIC/anon.
- 13-argument `editor_mutation_gateway_v1`: SECURITY INVOKER; supports `create/move/rotate/scale/delete`.
- 22-argument `editor_mutation_gateway_v1`: SECURITY INVOKER; additionally supports duplicate, paste, selection duplicate/transform, and gizmo selection operations. Authenticated callers have EXECUTE on both overloads. The narrower route approval allowlist is therefore not the sole database capability boundary; direct RPC calls can reach the broader overload.
- `enqueue_vendrith_runtime_intent_v1(uuid)`, `claim_vendrith_runtime_intent_v1(uuid)`, and `finish_vendrith_runtime_intent_v1(uuid,text,jsonb)`: SECURITY INVOKER.
- `retry_vendrith_runtime_intent_v1(uuid)`: SECURITY DEFINER with `search_path=public, pg_temp`; authenticated EXECUTE exists. Keep this as a separate security-review item; do not broaden it or add more definer functions merely to bypass RLS.

## 4. Live table ACL, RLS, and trigger findings

### Proposal table
- RLS is enabled.
- Policies are owner-scoped SELECT, INSERT, and UPDATE for authenticated non-anonymous users. There is no DELETE policy and no table trigger was found for this table.
- The local proposal migration grants only SELECT/INSERT/UPDATE, but the live table ACL currently gives authenticated **DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, and UPDATE** (plus PostgreSQL 17 MAINTAIN). The excess rights are consistent with broad default privileges found in the reconstructed baseline.
- Since authenticated owners can UPDATE proposal rows, the live row policy does not protect server-owned fields such as `status`, `approval_id`, `approved_at`, or `result`. A separately proven column/trigger/server transition boundary is still required.
- RLS normally blocks DELETE without a matching DELETE policy, but TRUNCATE is not row-filtered by RLS. Do not assume the row policy makes an excessive TRUNCATE grant harmless.

### Runtime-intent table
- RLS is enabled and only an owner-scoped SELECT policy exists; no table trigger was found.
- The live table ACL nevertheless grants authenticated DELETE/INSERT/REFERENCES/SELECT/TRIGGER/TRUNCATE/UPDATE (plus MAINTAIN). With no INSERT/UPDATE/DELETE policies, invoker-mode writes remain blocked by RLS, matching the earlier disposable-fixture SQLSTATE 42501 reproduction. The broad table grants still violate least privilege; TRUNCATE is not protected by row policies.
- The retry function is SECURITY DEFINER, so its ability to update a failed, retryable intent must be tested separately under actual role/RLS behavior.

### Default privileges — high-priority finding
The reconstructed baseline contains broad default table privileges for both `postgres` and `supabase_admin` in `public`, granting anon, authenticated, postgres, and service_role a wide set including DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, and UPDATE. The live `pg_default_acl` catalog confirms the same broad defaults for public-schema tables created by postgres and supabase_admin.

These defaults can silently grant excessive rights to future tables even where a later table-specific migration intended a narrower grant. This is a cross-cutting security/migration-baseline issue. It needs a separately reviewed, carefully scoped correction after the migration stream is reconciled; do not change default privileges ad hoc during this pass.

### Map/object authorization
- `map_objects` and `maps` have RLS enabled.
- `map_objects` policies scope SELECT/INSERT/UPDATE/DELETE to maps whose `created_by = auth.uid()`.
- The gateway and geometry pipeline functions inspected are SECURITY INVOKER, so caller privileges/RLS remain part of the authorization boundary. Do not switch them to SECURITY DEFINER as a permission workaround.

## 5. Gateway leaf failure contract

### Confirmed failure-after-write path
The live 22-argument gateway supports `duplicate_selection`, which reaches `duplicate_selected_map_objects_atomic` → `editor_batch_selection_duplicate_leaf_v2` → duplicate legacy bridge → duplicate gateway operation.

The live definition of `editor_batch_selection_duplicate_leaf_v2` loops over selected objects, creating each duplicate as it goes. If a later duplicate returns `ok:false`, the function returns that JSON plus `created_before_failure` instead of raising an exception. Earlier inserts are therefore not automatically rolled back by PostgreSQL. This is a confirmed partial-write risk: a failure-shaped JSON response can coexist with persisted duplicates.

The function name `duplicate_selected_map_objects_atomic` is misleading relative to this observed return contract; the full selection operation needs prevalidation plus exception-based rollback or an explicit transaction-safe implementation before it can be relied upon as atomic.

### Additional call-graph notes
- `editor_delete_object_leaf_v1` calls `remove_map_object_footprint` using `PERFORM`, ignoring its JSON result, then deletes geometry/object rows and returns success. Review whether a helper `{ok:false}` can leave navigation state inconsistent; an escaping exception would roll back, but a returned JSON failure does not.
- `editor_paste_leaf_v2` has preflight checks before insertion, but its full write-and-finalize path still needs explicit verification for any returned JSON failures after the first insert.
- `editor_batch_selection_transform_leaf_v2` contains an exception handler that returns JSON failure. A PL/pgSQL exception block rolls back statements in its protected block before returning, but this behavior still needs a targeted live-role/disposable regression test and must not be generalized to functions that simply return JSON false.
- The approval RPC invokes the 13-argument overload only for its narrow operation set, but authenticated users can execute the 22-argument overload directly. Security must be enforced at every exposed RPC/leaf boundary, not only in the Next.js route.

## 6. Confirmed duplicate-enqueue behavior
The live `enqueue_vendrith_runtime_intent_v1` inserts with `ON CONFLICT(proposal_id) DO NOTHING RETURNING id`, then returns `ok:true` even if the returned ID is NULL. Repeated enqueue can therefore report success without returning the stable existing intent ID. A corrected design must return the existing owner-matched intent ID on conflict and verify it belongs to the same proposal/user.

## 7. Priority register and next gates
1. **P1 — migration-stream ambiguity:** 26 local files across two roots versus 555 hosted entries, with version/name divergence and local Oct 11/12 save-slot migrations not in the exact hosted ledger. Reconcile by object/function definition, not filename alone.
2. **P1 — overbroad public-schema default privileges:** live defaults grant broad table privileges to anon/authenticated and future tables; per-table RLS is not a substitute for removing unnecessary TRUNCATE/other ACL rights.
3. **P1 — proposal server-state boundary:** owner UPDATE can write server-owned transition fields; replace with a proven server-only transition mechanism before revoking UPDATE in isolation.
4. **P1 — runtime intent contract mismatch:** broad ACL plus owner-only SELECT RLS means SECURITY INVOKER enqueue/claim/finish writes fail; retry is a separate SECURITY DEFINER path.
5. **P1 — duplicate-selection partial writes:** the live selection duplicate leaf can return `ok:false` after prior inserts.
6. **P1 — approval/enqueue split:** mutation approval and intent enqueue are separate transactions.
7. **P1 — duplicate enqueue returns null ID:** retry must return the existing stable intent ID.
8. **P1 until verified — broader gateway capability:** both overloads are callable by authenticated; inspect every reachable leaf, ownership check, JSON failure, and side effect.
9. **Review — SECURITY DEFINER retry RPC and search path:** verify grants, ownership checks, RLS bypass implications, and role tests.

### Next sequence
1. Produce a per-file migration reconciliation matrix: hosted exact match / equivalent hosted version / local-only / reconstructed baseline / uncertain.
2. Finish leaf-function inventory for paste, delete-helper return values, transform, and batch mutation functions.
3. Decide the proposal state-transition boundary and runtime worker role model.
4. Prototype the combined approval + intent/outbox contract in a disposable PostgreSQL 17 environment using real Supabase-like roles and RLS.
5. Draft, statically review, and compare a migration only after the above gates. Production application requires explicit approval.

**No production changes were made in Pass 13.**


## 8. Local container hygiene note
A read-only Docker inventory found two **stopped** containers named `vendrith-runtime-pg` and `vendrith-runtime-pg2` (both `postgres:17`, exited about 9 hours before this check). No matching container was running. They were left untouched because this pass did not need them and removing containers/associated data would be an unnecessary side effect without confirming their full provenance and volume dependencies.
