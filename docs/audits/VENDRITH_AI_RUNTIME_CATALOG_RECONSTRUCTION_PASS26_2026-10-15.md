# Vendrith AI World Runtime — Catalog Reconstruction and Access-Control Review (Pass 26)

Date: 2026-10-15  
Branch: `feat/vendrith-ecc-v1`  
Purpose: recover trusted source evidence for the hosted World Runtime migration family and document current hosted state without altering production.

## Executive result

**Exact historical source recovery remains unsuccessful.** A bounded search covered the repository, reachable Git history/refs, and the available handoff archives. The only local World Runtime SQL migration is the old `database/migrations/20261009015200_vendrith_runtime_persistence_v1.sql`; its function bodies do not match the current hosted definitions. No exact source files for the other 12 hosted ledger entries were found.

The current hosted catalog is sufficient to document a **current-state reconstruction**, not to recreate the original 13 migrations or their intermediate states. This report is evidence documentation only: it is **not an executable migration**, does not claim historical fidelity, and must not be placed in a migration directory or replayed against production.

## Search performed

- Repository: searched for World Runtime migration filenames, timestamps, function identifiers and table identifiers.
- Git: inspected all locally available branches/refs and searched history by filenames and unique function/table identifiers. The runtime-related history includes code and tests, but no exact historical SQL for the 12 missing hosted migrations.
- Archives inspected:
  - `archive/VANDRITH_ALL_PROJECT_FILES_LATEST.zip`
  - `handoff/VANDRITH_PROJECT_HANDOFF_v0.3_2026-08-13/VANDRITH_HANDOFF_v0.3/VANDRITH_CORE_v0.2_GITHUB.zip`
  - `handoff/VANDRITH_PROJECT_HANDOFF_v0.3_2026-08-13/VANDRITH_HANDOFF_v0.3/VANDRITH_HISTORY_ENGINE_v0.1.zip`
- No matching World Runtime SQL filenames or unique runtime function/table identifiers were found in those archives. The latest archive includes older Foundation/World/engine blueprint material and D47/D48 Foundation SQL, not the hosted Oct 4–5 World Runtime migration family.

## Hosted ledger gap

The read-only hosted migration ledger contains these 13 World Runtime entries:

1. `20261004015904 world_runtime_persistence_v1`
2. `20261004021316 world_runtime_authoritative_rpc_v1`
3. `20261004031235 world_runtime_persistence_read_rpc_v1`
4. `20261004042813 world_runtime_persistence_idempotency_v1`
5. `20261004143603 world_runtime_authenticated_execution_v1`
6. `20261004144347 world_runtime_authority_invariants_v1`
7. `20261004145042 world_runtime_authority_lease_v1`
8. `20261004150133 world_runtime_checkpoint_lease_v1`
9. `20261004152114 world_runtime_checkpoint_sequence_integrity_v1`
10. `20261004162108 world_runtime_persistence_lock_order_v1`
11. `20261004162145 world_runtime_lock_order_v1`
12. `20261004162237 world_runtime_remove_legacy_checkpoint_writer_v1`
13. `20261005015501 world_runtime_mutation_batch_v1`

Only the obsolete local base migration is available as a SQL source. Do not replay it. Do not invent 12 files with the historical names and do not repair the hosted migration ledger merely to make local filenames align.

## Current hosted catalog reconstruction (read-only)

### Tables

All three tables are in `public`, owned by `postgres`, have RLS enabled, and do not use FORCE ROW LEVEL SECURITY. No direct policies were returned for these tables. Direct table grants observed were restricted to `postgres` and `service_role`; authenticated clients do not receive direct table DML grants.

- `public.world_runtime_leases`
  - Columns: `world_id uuid NOT NULL`, `holder_id uuid NOT NULL`, `lease_token uuid NOT NULL`, `lease_until timestamptz NOT NULL`, `updated_at timestamptz NOT NULL DEFAULT now()`.
  - Constraints: primary key `(world_id)`; `world_id` references `public.worlds(id) ON DELETE CASCADE`; `holder_id` references `auth.users(id) ON DELETE CASCADE`.
  - Index: unique primary-key index on `(world_id)`.
- `public.world_runtime_mutation_log`
  - Columns: `id uuid NOT NULL DEFAULT gen_random_uuid()`, `world_id uuid NOT NULL`, `sequence bigint NOT NULL`, `mutation_id text NOT NULL`, `mutation_type text NOT NULL`, `mutation jsonb NOT NULL`, `domain_event jsonb NOT NULL`, `state_version text NOT NULL`, `state_hash text NOT NULL`, `tick bigint NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`.
  - Constraints: primary key `(id)`; foreign key `world_id → public.worlds(id) ON DELETE CASCADE`; unique `(world_id, sequence)` and `(world_id, mutation_id)`.
  - Indexes: primary key; unique world/sequence; unique world/mutation ID; `(world_id, sequence)` lookup index.
- `public.world_runtime_checkpoints`
  - Columns: `id uuid NOT NULL DEFAULT gen_random_uuid()`, `world_id uuid NOT NULL`, `sequence bigint NOT NULL`, `tick bigint NOT NULL`, `state_version text NOT NULL`, `state_hash text NOT NULL`, `state jsonb NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`.
  - Constraints: primary key `(id)`; foreign key `world_id → public.worlds(id) ON DELETE CASCADE`; unique `(world_id, sequence)`.
  - Indexes: primary key; unique world/sequence; `(world_id, sequence DESC)` lookup index.

### RPCs and effective access boundary

The following seven `public` RPCs exist in the current hosted catalog. All are owned by `postgres`, use `SECURITY DEFINER`, set an empty `search_path`, and have EXECUTE for `authenticated` and `service_role` (plus the owner). No `anon` EXECUTE grant was observed in the function ACLs.

| RPC | Identity signature | Current source definition MD5 (`md5(pg_get_functiondef(...))`) |
|---|---|---|
| `acquire_world_runtime_lease_v1` | `(uuid, uuid, integer)` | `ca1aa11a49d1a7a92754bed778d9c69d` |
| `append_world_runtime_mutation_batch_v1` | `(uuid, jsonb, uuid)` | `60783907ec4a0c2f59cdb2ec7fcf8bfc` |
| `read_latest_world_runtime_checkpoint_v1` | `(uuid)` | `8458e574ed092f7170f411ae45d7a12a` |
| `read_world_runtime_mutation_by_id_v1` | `(uuid, text)` | `cc9507339f53348f69cbd623a29a9521` |
| `read_world_runtime_mutations_v1` | `(uuid, bigint)` | `0d939a7aaef51fcfbbfc4daee0829ce4` |
| `renew_world_runtime_lease_v1` | `(uuid, uuid, integer)` | `249292790eedbc19bdbe7a50d42c408c` |
| `save_world_runtime_checkpoint_v1` | `(uuid, bigint, bigint, text, text, jsonb, uuid)` | `aec36402becd25b23e058d89a7ea5129` |

These hashes are of `pg_get_functiondef` output and should not be compared directly with prior hashes computed from `pg_proc.prosrc`; use one representation consistently when performing later comparisons.

## High-priority authorization finding — requires remediation before runtime use

**The current `SECURITY DEFINER` call path does not consistently bind a runtime operation to World ownership/access.** In the source definitions returned by the read-only catalog query:

1. `acquire_world_runtime_lease_v1` verifies that the caller is authenticated, validates the lease token/duration, and checks that the World exists. It does not check that the caller owns or is authorized to access that World before creating/replacing a lease.
2. `read_latest_world_runtime_checkpoint_v1` verifies authentication and World existence, then returns the latest checkpoint without a caller-to-World authorization predicate.
3. `read_world_runtime_mutations_v1` verifies authentication, sequence bounds and World existence, then returns mutations without a caller-to-World authorization predicate.
4. `append_world_runtime_mutation_batch_v1` checks authentication and a live lease held by the caller, but depends on lease acquisition being properly authorized. If an arbitrary authenticated caller can acquire a lease for an unrelated World, the append RPC's lease check does not itself prove access to that World.
5. `save_world_runtime_checkpoint_v1` likewise validates a live caller-owned lease and journal consistency, but does not independently verify caller access to the World.
6. `read_world_runtime_mutation_by_id_v1` does include a map ownership predicate (`maps.world_id = p_world_id AND maps.created_by = auth.uid()`), so its current authorization model is narrower/different from the other read RPCs and does not use the shared canonical-World access helper.

The existing `map_editor_can_access_v1(map_id)` helper authorizes a map when `maps.created_by = auth.uid()` or when the map is type `world` and points to the configured canonical World UUID `3695d0b0-788e-42fa-9345-cc3197d0c94d`. The `worlds` table itself has no `created_by` column, so a runtime authorization fix must deliberately resolve `p_world_id` to the permitted map/access model rather than assuming direct World ownership. The helper is evidence of the current editor access contract, not proof that runtime access is correctly enforced.

Because these functions are `SECURITY DEFINER`, direct table RLS/ACL restrictions do not compensate for missing authorization checks inside the RPCs. Treat this as a **high-priority cross-World data access and mutation risk** until the intended World access model and every RPC path are tested in a disposable two-user environment. Do not expose runtime writes or mark the runtime gate complete before this is resolved.

## Required next actions

1. In a disposable PostgreSQL/Supabase environment, create two users and at least two Worlds (including a shared canonical World if the editor contract permits it). Verify user A cannot acquire a lease for, read checkpoints/mutations from, append mutations to, or save checkpoints for user B's private World.
2. Define one explicit authorization predicate for runtime RPCs that respects private Worlds and the authorized shared canonical World. Apply it consistently to acquire/read/write/checkpoint RPCs; avoid silently treating “authenticated” as “authorized.”
3. Add negative tests for unknown World IDs, unauthorized private Worlds, shared canonical World policy, expired/foreign lease tokens, and idempotent mutation retries. Confirm no unauthorized rows are read or written.
4. Retrieve the exact hosted function definitions and metadata again after the intended policy is agreed, produce a reviewed forward-only migration candidate, and test the full call graph in a disposable database. Do not apply it to production until explicitly authorized.
5. Keep historical recovery and current-state reconstruction separate: this report documents current catalog state but does not replace the 12 missing historical migration sources.

## Safety and evidence limits

- Supabase reads in this pass were catalog/ledger queries only.
- No production DDL/DML, migration application, migration-ledger repair, package installation, deployment, commit, or push occurred.
- No API keys or secret values were read or recorded.
- Catalog reconstruction is a snapshot of current objects, not an exact migration replay or proof of all historical changes.
- Foundation 11-table Detailed Table Specification v0.1 and ERD were not changed.
