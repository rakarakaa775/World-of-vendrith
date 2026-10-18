# Vendrith AI — Runtime Persistence / Intent / Rate-Limit Object Reconciliation (Pass 20)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Read-only comparison of four local migration files against hosted tables and function catalog:
- `20261009013000_vendrith_runtime_intents_v1.sql`
- `20261009015200_vendrith_runtime_persistence_v1.sql`
- `20261009015300_vendrith_runtime_intent_reconciliation_v1.sql`
- `20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql`

No hosted mutation, migration application, migration-ledger repair, deployment, package installation, commit, or push occurred.

## Findings

### 1. Runtime intents — live object matches local function body
- Hosted `public.vendrith_runtime_intents` exists.
- Hosted `public.enqueue_vendrith_runtime_intent_v1(uuid)` exists.
- Hosted `pg_proc.prosrc` MD5 for enqueue is `be59f4d156262660877ceda632093d2d`, matching the local migration body exactly.
- The local migration's exact filename/version is not present in the hosted ledger; therefore the object/function match proves live code equivalence for this function body, not that the whole migration file was applied byte-for-byte.

### 2. Runtime persistence — objects exist, but local file is not the current function source
- Hosted tables `public.world_runtime_leases`, `public.world_runtime_mutation_log`, and `public.world_runtime_checkpoints` exist.
- Hosted functions `acquire_world_runtime_lease_v1`, `renew_world_runtime_lease_v1`, `append_world_runtime_mutation_batch_v1`, `save_world_runtime_checkpoint_v1`, `read_latest_world_runtime_checkpoint_v1`, and `read_world_runtime_mutations_v1` exist.
- Their hosted source hashes do not match the local `20261009015200_vendrith_runtime_persistence_v1.sql` bodies. The hosted ledger includes later world-runtime migrations from Oct 4–5 (authoritative RPC, idempotency, lease/lock ordering, mutation batch, etc.), while those later SQL sources are absent from the current local `database/migrations` inventory.
- This is not evidence that the live functions are broken or that the initial schema migration never ran; it is evidence that the local migration stream is incomplete/outdated relative to the hosted runtime evolution. Do not replay the old local migration over the hosted functions.

### 3. Runtime-intent reconciliation — local-only candidate
- Local migration defines `public.vendrith_runtime_intent_reconciliation_audit` and `public.reconcile_vendrith_runtime_intent_v1(uuid)`.
- Neither the table nor the function exists in the hosted catalog at this check.
- The local file itself explicitly says it is review-only until the project owner authorizes application. Treat it as **not applied**; do not attempt ledger repair or application in this audit phase.

### 4. Distributed Web AI rate limit — live object and body match
- Hosted `private.vendrith_web_ai_rate_limits` exists.
- Hosted `public.consume_vendrith_web_ai_rate_limit_v1(uuid,timestamptz)` exists.
- Hosted `pg_proc.prosrc` MD5 `bd240da2641d86654e1c0d71df4ae9e9` matches the local migration function body exactly.
- The local migration filename is not an exact hosted ledger name. Object/function equivalence is confirmed for this function, but the complete migration and ledger mapping still needs reconciliation.

## Gate / next actions
1. Recover or reconstruct the missing local SQL history for hosted world-runtime migrations Oct 4–5 from trusted migration artifacts or catalog definitions, preserving their actual order and never replaying them blindly.
2. Keep the intent-reconciliation migration unapplied until its expected semantics, state machine and atomicity contract are reviewed and authorized.
3. Continue Save/Load migration reconciliation separately; both local Save/Load files remain un-applied candidates.
4. After the migration source stream is reconciled, finalize the AI roadmap. Do not install the deferred candidate packages yet.

No production state was changed. Foundation 11-table specification and ERD remain unchanged.
