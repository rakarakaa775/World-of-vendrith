# Vendrith AI Runtime — Hosted Migration Source Gap (Pass 25)

**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`  
**Scope:** read-only hosted migration-ledger/catalog checks + local roadmap update.  
**Safety:** no hosted DDL/data change, no migration application, no ledger repair, no package installation, no commit/push/deployment.

## 1. Hosted migration sequence versus local source files

Read-only Supabase migration-ledger output confirms these 13 hosted entries:

| Hosted version | Hosted migration name | Local source status |
|---|---|---|
| `20261004015904` | `world_runtime_persistence_v1` | Historical base source exists under a different local filename/timestamp (`database/migrations/20261009015200_vendrith_runtime_persistence_v1.sql`), but its function bodies are not the current hosted bodies. |
| `20261004021316` | `world_runtime_authoritative_rpc_v1` | Missing local source file. |
| `20261004031235` | `world_runtime_persistence_read_rpc_v1` | Missing local source file. |
| `20261004042813` | `world_runtime_persistence_idempotency_v1` | Missing local source file. |
| `20261004143603` | `world_runtime_authenticated_execution_v1` | Missing local source file. |
| `20261004144347` | `world_runtime_authority_invariants_v1` | Missing local source file. |
| `20261004145042` | `world_runtime_authority_lease_v1` | Missing local source file. |
| `20261004150133` | `world_runtime_checkpoint_lease_v1` | Missing local source file. |
| `20261004152114` | `world_runtime_checkpoint_sequence_integrity_v1` | Missing local source file. |
| `20261004162108` | `world_runtime_persistence_lock_order_v1` | Missing local source file. |
| `20261004162145` | `world_runtime_lock_order_v1` | Missing local source file. |
| `20261004162237` | `world_runtime_remove_legacy_checkpoint_writer_v1` | Missing local source file. |
| `20261005015501` | `world_runtime_mutation_batch_v1` | Missing local source file. |

Local Git history contains the old base persistence migration added in commit `aa0fbb89`, but no trusted later SQL source files for the hosted Oct 4–5 sequence were found in the current repository or reachable Git history. The current migration ledger therefore gives reliable ordering/name evidence, not recoverable original SQL source text.

## 2. Read-only hosted catalog evidence

The hosted catalog currently contains the three runtime persistence tables and seven RPCs:

- Tables: `world_runtime_leases`, `world_runtime_mutation_log`, `world_runtime_checkpoints`.
- RPCs: `acquire_world_runtime_lease_v1`, `renew_world_runtime_lease_v1`, `append_world_runtime_mutation_batch_v1`, `save_world_runtime_checkpoint_v1`, `read_latest_world_runtime_checkpoint_v1`, `read_world_runtime_mutations_v1`, `read_world_runtime_mutation_by_id_v1`.

All three tables have RLS enabled and FORCE RLS disabled; direct ACLs are restricted to `postgres` and `service_role`, and the catalog query found no direct RLS policies on these tables. The client-facing operations are therefore intended to pass through privileged RPCs, not direct table DML.

The seven listed functions are `SECURITY DEFINER`, set `search_path` to the empty string, and have EXECUTE grants to `authenticated` and `service_role` (plus owner `postgres`). Their current hosted source hashes/lengths were recorded in the audit session:

| Function | Source MD5 | Length |
|---|---|---:|
| `acquire_world_runtime_lease_v1(uuid,uuid,integer)` | `aa90c9a99940b0c3c4088a5ec3c44000` | 1264 |
| `append_world_runtime_mutation_batch_v1(uuid,jsonb,uuid)` | `9a058013cc75850445ec33c6809d4157` | 7259 |
| `read_latest_world_runtime_checkpoint_v1(uuid)` | `121c29f8be3c2fc5c9097a113438109f` | 410 |
| `read_world_runtime_mutation_by_id_v1(uuid,text)` | `dad4e07557848007bc7c202d4b478389` | 678 |
| `read_world_runtime_mutations_v1(uuid,bigint)` | `fc835efc0dc2f8cec51c97bd541551ab` | 541 |
| `renew_world_runtime_lease_v1(uuid,uuid,integer)` | `2a2940b11fe0fd115631d3e5a3eba878` | 834 |
| `save_world_runtime_checkpoint_v1(uuid,bigint,bigint,text,text,jsonb,uuid)` | `9278d990e0189dc0eb73c2d398ac5ec6` | 2680 |

The table columns observed in the live catalog are:

- `world_runtime_leases`: `world_id`, `holder_id`, `lease_token`, `lease_until`, `updated_at`.
- `world_runtime_mutation_log`: `id`, `world_id`, `sequence`, `mutation_id`, `mutation_type`, `mutation`, `domain_event`, `state_version`, `state_hash`, `tick`, `created_at`.
- `world_runtime_checkpoints`: `id`, `world_id`, `sequence`, `tick`, `state_version`, `state_hash`, `state`, `created_at`.

These are current-state catalog facts. They do **not** recover the exact historical DDL, all intermediate constraints, or migration-time data transformations for each of the 13 hosted entries.

## 3. Reconciliation decision

**Do not replay the old local runtime persistence migration. Do not invent historical migration files and claim they were the originals. Do not repair/insert migration-ledger entries.**

Preferred recovery order:

1. Search trusted backups, previous exports, local archives and known developer handoff artifacts for the exact 12 missing SQL files.
2. If exact sources cannot be recovered, create a clearly labeled *catalog reconstruction* document with current `pg_get_functiondef`, table constraints/indexes, ACLs, dependencies, and test evidence; do not present it as original migration source.
3. Build a clean disposable PostgreSQL fixture from that reconstructed current contract and run runtime persistence/concurrency/recovery tests.
4. Keep migration replay and hosted ledger repair out of scope unless the project owner separately authorizes a planned reconciliation procedure.

## 4. AI roadmap update

Updated `docs/ai/VENDRITH_AI_ROADMAP.md` from the stale 2026-10-02 status snapshot to an evidence-oriented 2026-10-15 plan. The revised roadmap separates local implementation from hosted availability, prioritizes Creator AI/Save-Load verification, migration-source recovery, runtime-intent correctness, editor mutation atomicity, then read-only project intelligence and gated mutation features. It records roadmap.sh as a high-level reference only; Vendrith's own contracts remain authoritative.

The user-reported HTTP 503 after the Gemini key change/redeploy is recorded as not yet independently reproduced during this pass. No API key values or secrets were accessed.

## 5. Remaining gates

- Recover or explicitly reconstruct the missing World Runtime SQL history.
- Complete authenticated two-user browser verification for private Save Slots on the shared canonical World in nonproduction.
- Independently reproduce and resolve the current Preview AI 503, then prove one real model response and one read-only project tool round trip.
- Complete the broader AI runtime/editor authorization and rollback gates.
- Keep candidate icon/asset package installation deferred until a specific roadmap phase requires it and compatibility/license review is complete.

Foundation 11-table specification and ERD remain unchanged.
