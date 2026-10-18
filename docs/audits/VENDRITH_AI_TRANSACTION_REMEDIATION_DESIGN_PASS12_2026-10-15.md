# Vandrith AI Transaction Remediation Design — Pass 12

**Date:** 2026-10-15  
**Status:** Design draft only; not an executable migration.  
**Production changes:** None.

## 1. Decision

Do not apply a production migration yet. Pass 11 found a proposal state-integrity gap, a likely runtime-intent invoker/RLS mismatch, a split-transaction failure window, and a duplicate-enqueue response bug. Disposable PostgreSQL 17 tests verified exception rollback, the difference between exceptions and returned JSON failures, duplicate enqueue behavior, and single-winner approval/claim fixtures.

The preferred end state is one atomic approval RPC statement: validate identity, proposal, session, context, map and object ownership; execute the authorized editor mutation; transition proposal state through a server-controlled boundary; and create or recover exactly one runtime intent. Any exception must roll back the whole statement. A returned failure is safe only if the editor gateway guarantees no partial writes on that path.

## 2. Confirmed risk register

| ID | Finding | Priority | Required action |
|---|---|---|---|
| R1 | Authenticated owners can update proposal rows including server-owned status/result/approval metadata under the inspected policy/grant shape. | P1 | Prevent client state forgery without breaking the legitimate approval path. |
| R2 | Runtime-intent table has owner SELECT policy/client SELECT grant while invoker-mode enqueue/claim/finish functions write it. A disposable fixture returned SQLSTATE 42501 for this policy shape. | P1 / likely blocker | Confirm live grants, policies, function owners and effective roles. |
| R3 | Approval and enqueue are separate API transactions; enqueue failure can leave an approved proposal without an intent. | P1 | Combine into one transaction or define durable, idempotent repair. |
| R4 | Duplicate enqueue can return `ok:true` with `intent_id:null` after `ON CONFLICT DO NOTHING`. | P1 | Return the existing owner-matched intent ID and status. |
| R5 | JSON `{ok:false}` does not roll back earlier writes. Actual editor leaf failure paths still need full review. | P1 until proven safe | Define a no-side-effects-on-failure contract or raise an exception to force rollback. |
| R6 | Local migration folders and hosted migration history are not reconciled. | Release blocker | Build a canonical inventory before authoring or applying an active migration. |

## 3. Target transaction contract

1. Reject unauthenticated and anonymous identities.
2. Lock the proposal row and require `status = 'pending'`.
3. Validate proposal owner, AI session owner, session context, context type, target map and target object ownership/visibility.
4. Validate the operation and payload before any mutation.
5. Execute the editor gateway under a reviewed privilege boundary that preserves map/object ownership controls.
6. If a leaf raises, let the exception escape so the complete RPC statement rolls back. A returned failure must guarantee no mutation occurred; otherwise the gateway contract must raise on failure.
7. Transition proposal state and create exactly one runtime intent in the same transaction when runtime execution is required.
8. A retry must return the existing intent ID/status, never `ok:true` with a null ID.
9. Concurrent approval must not repeat editor mutation. Concurrent claim must have exactly one winner.

The API route should not issue a second independent enqueue RPC when the approval RPC itself guarantees atomic intent creation. Return the stable intent ID from the single transaction boundary.

## 4. Privilege/RLS decision gate

Keep `editor_mutation_gateway_v1` and its leaf functions SECURITY INVOKER unless a complete call-graph review proves elevation is required. The reviewed `map_objects` RLS policies enforce map ownership. Do not add SECURITY DEFINER merely to work around a permission error.

Inventory both gateway overloads and every called leaf: operation allowlists, ownership checks, search paths, ACLs, triggers, nested helper behavior, effective database role, and all return paths that can report failure.

The client should be able to submit permitted proposal input and read its own proposals, but not directly write `status`, `approval_id`, `approved_at`, or `result`. Do not revoke proposal UPDATE in isolation: the current invoker approval function needs to update those fields.

Two possible patterns require a security proof before selection:

- **Narrow internal transition mechanism:** updates only approved server-owned fields and checks `auth.uid()`, ownership, expected previous state and allowed transition. It must not be independently callable in a way that bypasses the editor gateway. If a privileged function is selected, keep it out of exposed schemas, use a fixed empty search path and fully qualified names, revoke default PUBLIC execution, and document its exact caller/privilege model.
- **Column privilege plus trigger boundary:** restrict client column writes and enforce valid transitions in the database. Prove that direct API writes cannot forge any internal authorization marker and that the legitimate approval flow still works. Do not treat a client-settable custom setting as a security capability.

Neither pattern is approved by this draft. Test the selected pattern using actual Supabase roles and RLS, not only a simplified table owner.

Authenticated clients must not have direct INSERT/UPDATE/DELETE rights on runtime intents. If a trusted server worker consumes intents, define its identity and permissions separately from ordinary user-authenticated RPCs.

## 5. Retry and failure contract

- First successful approval performs the editor mutation, updates proposal state, inserts one intent, and returns the intent ID/status.
- A concurrent or repeated approval must not repeat the editor mutation.
- Retry after successful approval returns the existing intent ID/status.
- An approved proposal with no intent returns a specific repair/reconciliation error, not success with a null ID.
- An existing intent with a mismatched proposal/user is an integrity error, not a valid result for the caller.
- Exceptions escaping the top-level RPC roll back editor changes, proposal transition, journal rows and intent creation in that statement.
- A returned JSON failure does not roll back. Every gateway leaf must guarantee no writes on a returned failure or raise if the operation cannot safely continue.
- Keep the unique constraint on `proposal_id` as the final duplicate barrier, but recover the existing row and return its ID.
- Reconciliation must be idempotent and auditable; never blindly replay an editor operation that may already have succeeded.

## 6. Required tests before implementation approval

1. Owner can insert a pending proposal with allowed input fields; cannot insert it with approved/failed status.
2. Owner cannot directly update status, result, approval ID/timestamp, owner, session, context, map, operation or action after creation.
3. Legitimate approval still works after client state-write access is restricted.
4. User A cannot read, approve, mutate, enqueue, claim, finish or reconcile User B's proposal/intent.
5. User A cannot mutate an object on a map they do not own or cannot access.
6. Invalid session/context/map/object checks create no editor writes.
7. Exception from an editor leaf rolls back all effects.
8. A returned `{ok:false}` cannot leave partial editor writes.
9. Duplicate approval does not repeat editor mutation and returns a stable result.
10. Duplicate enqueue returns the same non-null intent ID and current status.
11. Concurrent approvals produce one mutation, one proposal transition and one intent.
12. Concurrent claims produce exactly one winner.
13. Direct client writes to runtime intents are denied.
14. Failure/retry/reconciliation preserve uniqueness and auditability.
15. Function EXECUTE grants, schemas, search paths, RLS policies, table/column grants and default privileges match the approved design.

## 7. Migration-stream reconciliation gate

Before creating an active migration, reconcile all of the following:

- `database/migrations` local history;
- `supabase/migrations` local history;
- hosted Supabase migration ledger;
- actual hosted definitions/ACLs for approval, both gateway overloads, runtime-intent functions, relevant triggers and RLS policies;
- application call sites and tests.

The hosted migration inventory contains version/name pairs that differ from the local migration filenames. Classify each item as applied, local-only, hosted-only, reconstructed baseline, or equivalent under a different version. Treat this as a release blocker. Do not apply schema changes or repair migration history until the comparison is complete. No migration-history repair is authorized by this draft.

## 8. Implementation sequence

1. Read-only inventory: export exact definitions, ACLs, policies, triggers and all gateway leaf functions; identify canonical migration source.
2. Design decision: choose the server-state transition pattern and document function ownership, schema exposure, grants and how gateway calls preserve caller RLS.
3. Disposable prototype: test every case in §6, including actual role/RLS behavior and failure injection.
4. Static review: check search paths, default execution grants, unqualified names, role boundaries, failure returns and retry correctness.
5. Only after steps 1–4 pass, create a migration through the repository's established workflow. Leave it unapplied for review.
6. Compare the draft to live definitions and hosted history; run relevant advisors/tests; require explicit approval before production application.

## 9. Current boundary

This pass produced a design document only. It did not modify application source, active migration SQL, hosted schema, grants, policies, data, migration history, packages or deployment. No commit or push was made. Foundation schema/ERD and the completed 11-table Foundation specification are out of scope and must not be redesigned as part of this work.
