# Vendrith AI Runtime & Governance Audit

**Audit date:** 2026-10-13
**Branch:** `feat/vendrith-ecc-v1`
**Status:** P2 in progress — runtime persistence contract still requires implementation and local PostgreSQL verification.

## Scope

This audit reviews the AI core contract, runtime orchestration, tool-call limits, policy boundaries, approval persistence, and runtime recovery. It does not claim that hosted Supabase migrations have been applied or that authenticated browser/session E2E has passed. Production database access was not used for this audit.

## Controls verified in code

- `docs/architecture/VENDRITH_AI_CORE_CONTRACT_V1.md` states that deterministic engine state remains authoritative and that model output is a proposal, not execution authority.
- `ai/application/runtime-orchestrator.ts` checks observation surface/intelligence, validates decision identity/state version/expiry/action metadata, applies surface and risk policy, requires a resulting state version for successful execution, and verifies executed actions.
- `ai/application/tool-loop.ts` has bounded defaults of 8 iterations and 12 total tool calls. Budget rejection now reports the attempted tool names and occurs before executing an over-budget batch.
- Runtime policy tests now assert that a high-risk action without approval never reaches the action executor.
- `ai/application/runtime-intent-consumer.ts` now validates the durable `finish_vendrith_runtime_intent_v1` response instead of reporting an intent as consumed when the finish write fails. A finish failure is surfaced as `RUNTIME_INTENT_FINISH_ERROR` with `reconciliationRequired: true`.
- `ai/application/runtime-recovery.ts` validates checkpoint sequence, tick, state version, canonical snapshot hash, mutation sequence continuity, mutation state version, and mutation hash. Canonical checkpoints with zero entities are also subject to hash validation.
- Development action approvals have persistence/audit migrations under `database/migrations`: `20261009016000_vendrith_development_action_proposals_v1.sql`, `20261009017000_vendrith_development_action_approval_v1.sql`, `20261009018000_vendrith_development_execution_v1.sql`, and `20261009022000_vendrith_phase4_final_audit_hardening_v1.sql`.

## P2 gaps that remain open

### 1. Runtime mutation journal, leases, and checkpoints lack tracked SQL definitions

The TypeScript runtime calls these RPCs:

- `acquire_world_runtime_lease_v1`
- `renew_world_runtime_lease_v1`
- `append_world_runtime_mutation_batch_v1`
- `save_world_runtime_checkpoint_v1`
- `read_latest_world_runtime_checkpoint_v1`
- `read_world_runtime_mutations_v1`

A tracked SQL definition for these functions was not found in `database/migrations` or `supabase` SQL files. The existing migration `database/migrations/20261009015100_vendrith_runtime_mutation_lookup_v1.sql` references `public.world_runtime_mutation_log`, but no tracked `CREATE TABLE` definition for that table was found.

This means code-level replay tests do not prove that durable runtime persistence works against a database built solely from tracked migrations. P2 must add a reviewed migration and disposable-PostgreSQL contract tests before this subsystem can be considered verified.

### 2. Intent finish failures need reconciliation

The consumer no longer reports success when a finish RPC fails. However, a failed finish may leave an intent in `processing`, while the current retry migration only retries `failed` intents. The recovery/reconciliation path for an ambiguous finish result therefore remains an explicit design task; do not treat `reconciliationRequired` as an automatic retry.

### 3. Generic approval state versus persisted development approvals

`ai/domain/approval.ts` is an in-memory state machine. The separate development-action proposal path has persisted approval and execution audit tables/functions, but this audit did not establish that every generic high-risk approval transition is durably recorded. Scope and ownership of the durable approval/audit boundary need to be made explicit.

### 4. Session persistence needs database-backed integration coverage

`ai/application/persistent-ai-session.test.ts` currently tests policy constants and allowed context types; it does not exercise create/load/append behavior, ownership/RLS, message ordering, or write-failure recovery against a disposable database fixture.

## Next required work

1. Design and implement the missing runtime persistence migration: mutation journal, latest checkpoint, lease acquisition/renewal, atomic append, validated checkpoint save, and ordered reads.
2. Add local PostgreSQL assertions for ownership, lease expiry/concurrency, atomic rollback, mutation idempotency, sequence monotonicity, checkpoint monotonicity, and read/replay behavior. Never apply this migration to production during these tests.
3. Add a reconciliation path for finish failures and prove it cannot duplicate a runtime mutation.
4. Add database-backed session and approval/audit tests using disposable fixtures.
5. Run full tests, typecheck, build, SQL assertions, `git diff --check`, and CI for the final commit. Keep authenticated browser/session E2E in a nonproduction environment as a separate release gate.

## Current test evidence

Final local verification for the current code changes: 169 test files passed, 884 tests passed, and `npm run typecheck` exited with code 0. Targeted runtime guardrail tests also passed. The new changes still require the post-push CI result. This document intentionally does not claim P2 is complete.
