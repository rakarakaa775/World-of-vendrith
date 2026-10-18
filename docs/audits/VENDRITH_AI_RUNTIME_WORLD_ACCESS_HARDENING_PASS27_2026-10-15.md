# Vendrith World Runtime Authorization Hardening — Pass 27

Date: 2026-10-15  
Branch: `feat/vendrith-ecc-v1`  
Status: candidate and disposable PostgreSQL reproduction tested; not applied to hosted Supabase.

## Executive summary

Pass27 fetched the seven current hosted World Runtime function definitions using read-only Supabase catalog queries, reproduced the access issue on an isolated PostgreSQL 17 container, created a forward-only hardening candidate outside `supabase/migrations`, and tested the candidate against a two-user private-World/shared-canonical-World matrix.

**Current hosted behavior reproduced:** User A, authenticated as a different user from World B's owner, could acquire a lease on World B, read its latest checkpoint and mutation journal, append a mutation, and save a checkpoint. The reproduction used the exact current hosted `pg_get_functiondef` bodies from the read-only query, in a disposable schema that models the relevant table/function interfaces. No hosted function was invoked to perform the malicious operations; the only hosted interaction was catalog inspection.

## Candidate artifact

`docs/audits/candidates/VENDRITH_WORLD_RUNTIME_WORLD_ACCESS_HARDENING_CANDIDATE_PASS27.sql`

The candidate replaces all seven current runtime RPC definitions while preserving their signatures and core behavior. It adds `public.map_editor_can_access_v1(m.id)` checks to: acquire lease, renew lease, append mutation batch, save checkpoint, read latest checkpoint, read mutation journal, and read mutation by ID. It deliberately remains outside `supabase/migrations` so it cannot be swept into a normal migration push while the historical migration gap is unresolved.

Authorization predicate: a runtime `p_world_id` must map to at least one `public.maps` row for which `public.map_editor_can_access_v1(m.id)` returns true. This aligns runtime operations with the existing editor access helper, including the configured canonical shared World, rather than treating authentication or a lease alone as World authorization. The `worlds` table has no `created_by`, so this explicit mapping is necessary.

## Disposable test results

A fresh container `vendrith-pass27-authz` used the locally available `postgres:17-alpine` image. It was created only for this pass and removed after tests. The test fixture captured the seven hosted RPC definitions read-only, and a stub of the existing editor access helper modeled owner access plus the configured canonical shared World. Test artifacts are retained under `docs/audits/candidates/pass27-disposable-tests/`.

1. **Current hosted definitions — vulnerable behavior reproduced:** cross-user lease acquisition, checkpoint read, mutation journal read, mutation append and checkpoint save all succeeded for the wrong user.
2. **Candidate — private World isolation:** wrong-user lease acquire/renew, checkpoint read, mutation read, mutation-by-ID lookup, append and checkpoint save were rejected with `world access denied`. No unauthorized lease row or additional private-World mutation was created.
3. **Candidate — authorized access preserved:** World B's owner could read, acquire/renew a lease, append a mutation and save a checkpoint. User A could read the shared canonical World, look up a mutation, acquire a lease, append a mutation and save a checkpoint under the modeled helper policy.
4. Candidate SQL compiled successfully on PostgreSQL 17. `git diff --check` is the remaining repository-level formatting gate for this pass.

## Additional defect discovered and corrected in candidate

The current hosted `renew_world_runtime_lease_v1` source uses an unqualified `holder_id` in an `UPDATE` even though `holder_id` is also an output parameter. PostgreSQL 17 reproduced `column reference "holder_id" is ambiguous` for an authorized renewal call. The candidate qualifies the target table as `l` (`l.world_id`, `l.holder_id`, `l.lease_token`, `l.lease_until`) and uses `RETURNING l.*`, resolving the ambiguity. The owner-renewal assertion passed after this candidate change.

## Test boundaries and caveats

- The disposable schema reproduces the hosted function definitions but is not a complete clone of the production Supabase schema, roles, grants, extensions, or RLS environment. It proves the relevant function-body behavior under the modeled access helper, not full hosted end-to-end equivalence.
- Before any production deployment, rerun against a disposable database reconstructed from trusted schema sources and add integration coverage for grants, anonymous JWTs, canonical World resolution, duplicate/unknown map mappings, expired/foreign lease tokens, idempotent retries, and lock-order/concurrency behavior.
- Historical source recovery remains open: the 12 missing Oct 4–5 World Runtime migration SQL files were not recovered. This candidate does not claim to reconstruct them.
- Do not apply the candidate to production or alter the hosted migration ledger without explicit authorization and a reviewed migration reconciliation plan.

## Safety

No production DDL/DML, migration application, migration-ledger repair, package installation, deployment, commit or push occurred. The disposable PostgreSQL container was removed after tests. Existing worktree changes were preserved. Foundation 11-table specification and ERD remain unchanged.
