# Vendrith Approval Integrity Gate — Pass 28

**Date:** 2026-10-24
**Status:** Read-only source audit; implementation gate remains blocked.
**Branch:** `feat/vendrith-ecc-v1`
**Production database:** Not accessed or modified in this pass.

## Scope

Reconcile the earlier approval-integrity finding against the repository's local migration sources, reconstructed schema baseline, and the application approval route. Preserve unrelated local changes.

## Evidence

1. `database/migrations/20261009011000_vendrith_creator_action_proposals_v1.sql` grants `SELECT, INSERT, UPDATE` on `public.vendrith_creator_action_proposals` to `authenticated`. The UPDATE policy limits rows by `user_id` but does not constrain server-owned columns or status transitions.
2. `database/migrations/20261009012000_vendrith_creator_action_approval_v1.sql` is an invoker-mode function (no `SECURITY DEFINER`). It locks an owned pending proposal, checks session/context/map visibility, calls `editor_mutation_gateway_v1`, then updates proposal status and approval metadata.
3. `database/migrations/20261009013000_vendrith_runtime_intents_v1.sql` gives authenticated users SELECT on runtime intents and defines an owner SELECT policy. `enqueue_vendrith_runtime_intent_v1` is invoker-mode and inserts into that table. `ON CONFLICT(proposal_id) DO NOTHING RETURNING id` can leave the local intent ID NULL, while the function still returns `ok:true`.
4. `apps/map-editor/app/api/vendrith-ai/route.ts` calls the approval RPC, then selects the proposal action, then calls the enqueue RPC in a second database request when `runtimeAction` exists. This is a split-transaction failure window.
5. The function body for the 13-argument `editor_mutation_gateway_v1` was found in `supabase/migrations/20261003170000_remote_schema_baseline_reconstructed.sql`. It dispatches to create, delete, transform, duplicate, paste and selection mutation functions. This file is explicitly a reconstructed baseline, not proof of the exact current hosted function bodies or migration ledger.
6. The migration history is split: the AI feature migrations live under `database/migrations`, while the Supabase folder has a reconstructed baseline plus later map-editor migrations. Existing audit documentation says the hosted migration ledger and local filenames have not been fully reconciled. Do not assume applying the AI SQL folder in filename order is safe.
7. In this environment, no `psql`/`pg_isready` client was found and `docker ps` showed no running containers. No disposable PostgreSQL integration test was run in this pass.

## Security conclusion

The source-level approval-state integrity gap and split approval/enqueue transaction are supported by local source. They are not proof that an unauthorized runtime action was successfully executed against the hosted project. The reconstructed baseline gives us a starting call graph, but it is not sufficient to authorize a privileged wrapper or a production migration.

Do **not** simply revoke UPDATE on the proposal table: the current invoker approval function needs to update proposal status/result metadata. Do **not** switch the approval function to `SECURITY DEFINER` without tracing every leaf's effective role, RLS/ownership checks, triggers, failure semantics, and grants. Do not use broad runtime-intent table writes as a workaround.

## Required implementation gate

- Reconcile hosted definitions, ACLs, RLS policies, triggers and migration ledger read-only before selecting a migration stream.
- Test the exact chosen state-transition boundary with actual `authenticated`/`anon` roles and RLS in a disposable PostgreSQL/Supabase fixture.
- Prove direct client INSERT/UPDATE cannot forge `status`, `approval_id`, `approved_at` or `result` while legitimate approval still succeeds.
- Prove exception rollback and no-partial-write semantics for every gateway return path.
- Make approval and intent creation atomic, or provide a durable idempotent recovery contract; duplicate enqueue must return the stable non-null existing intent ID.
- Cover cross-user/map/object attempts, anonymous callers, duplicate/concurrent approvals, enqueue failures, direct intent writes, claim/finish transitions and recovery.
- Keep all production changes blocked until the source/ledger comparison and disposable tests pass and explicit approval is given.

## Verification and change boundary

This pass is documentation-only. No active migration, application source, hosted schema, grants, policies, data, migration history, packages or deployment were changed. Existing local `apps/map-editor/tsconfig.tsbuildinfo` remains untouched.
