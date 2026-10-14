# Vendrith AI Runtime & Governance Audit

**Audit date:** 2026-10-13
**Branch:** `feat/vendrith-ecc-v1`
**Status:** P2 implementation complete on `feat/vendrith-ecc-v1`; local disposable-PostgreSQL contracts and GitHub Actions are green. Hosted Supabase application and authenticated browser/session E2E remain unverified release gates (P3).

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

### 1. Runtime persistence SQL was missing; candidate migration and isolated tests now exist

The new candidate migration `database/migrations/20261009015200_vendrith_runtime_persistence_v1.sql` defines the mutation journal, lease table, monotonic checkpoint table, and these RPCs:

- `acquire_world_runtime_lease_v1`
- `renew_world_runtime_lease_v1`
- `append_world_runtime_mutation_batch_v1`
- `save_world_runtime_checkpoint_v1`
- `read_latest_world_runtime_checkpoint_v1`
- `read_world_runtime_mutations_v1`
- `read_world_runtime_mutation_by_id_v1`

Writes are RPC-only, each function checks ownership through `maps.created_by`, lease-token writes are serialized on the lease row, mutation IDs are idempotent but reject conflicting reuse, batches are transaction-atomic, and checkpoints must exactly match the committed journal snapshot and cannot move backwards.

Isolated PostgreSQL fixtures and assertions now live in `supabase/tests/runtime-persistence-fixture.sql`, `runtime-persistence-assertions.sql`, and `runtime-persistence-concurrency.sh`; a dedicated CI job applies the prior lookup migration and candidate migration to a disposable PostgreSQL 17 service. Local disposable-PostgreSQL assertions and concurrent append checks passed. This is not evidence that the migration has been applied to hosted Supabase or that authenticated browser/session E2E has passed.

### 2. Intent finish failures need reconciliation

The consumer no longer reports success when a finish RPC fails. However, a failed finish may leave an intent in `processing`, while the current retry migration only retries `failed` intents. The recovery/reconciliation path for an ambiguous finish result therefore remains an explicit design task; do not treat `reconciliationRequired` as an automatic retry.

### 3. Approval authority boundary — decision recorded

`ai/domain/approval.ts` is a request-scoped orchestration state machine, not a durable authorization source and not proof that a write was approved. The Web/Creator API accepts only `explain` and `plan`; it rejects `execute`/`high-risk` and requires a persisted proposal for mutation. The Development AI endpoint also rejects `execute`/`high-risk` until its approved execution workflow is connected. Actual Development AI approval/execution bindings are persisted through the proposal, approval, and execution-audit tables/RPCs; Creator map mutations use persisted Creator proposals and the authenticated approval RPC. Runtime AI has its own surface/risk gate, and the regression test confirms a high-risk action without approval never reaches the action executor. Therefore the in-memory state machine is workflow metadata only; it must never be accepted by a server or database mutation boundary as authorization.

### 4. Session persistence — disposable database contract added

The dedicated `ai-session-approval-sql` CI job now applies the session and development approval migrations to an isolated PostgreSQL 17 service and asserts session/message ownership isolation, the 100-message cap, approval persistence, approval audit, approval-ID consumption after successful execution, and execution audit. The same contract passed locally against a disposable PostgreSQL 17 container. These checks do not claim authenticated browser/session E2E or hosted Supabase migration application.

## Next required work

1. Complete the full local PostgreSQL assertions and CI job for the candidate runtime persistence migration; do not apply it to production during these tests.
2. Add a reconciliation path for finish failures and prove it cannot duplicate a runtime mutation.
3. Add database-backed session and approval/audit tests using disposable fixtures.
4. Run full tests, typecheck, build, SQL assertions, `git diff --check`, and CI for the final commit. Keep authenticated browser/session E2E in a nonproduction environment as a separate release gate.

## Follow-up verification — 2026-10-14

- Added `supabase/tests/ai-session-approval-fixture.sql` and `supabase/tests/ai-session-approval-assertions.sql`, wired into a dedicated disposable PostgreSQL 17 CI job. The assertions cover session/message ownership isolation, persisted context, approval persistence, approval audit, approval-binding consumption after successful execution, and execution audit.
- Running the new contract against disposable PostgreSQL exposed an ambiguous `status` reference in `approve_vendrith_development_action_v1`; the update now qualifies the proposal table alias. The final-audit `finalize_vendrith_development_action_v1` update is also explicitly qualified to prevent the same PL/pgSQL output-parameter ambiguity.
- Local disposable PostgreSQL 17 execution of the new session/approval fixture and assertions passed. This database was created for the test and stopped afterward; no hosted/production database was accessed.
- The remaining governance question is whether the generic in-memory runtime approval state machine needs its own durable audit record, or whether it is intentionally scoped to a single execution request while durable approvals remain exclusive to Development AI proposals. Record and test that boundary before declaring P2 complete.
- Authenticated browser/session E2E and nonproduction deployment verification remain separate release gates; CI success alone does not establish them.

## Current test evidence

On 2026-10-14, GitHub Actions run [#964](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38571463579) passed all six jobs for commit `1252cbca`, including Map Editor typecheck/build/Vitest, Save Slot SQL integration, runtime persistence/reconciliation SQL, and the new AI session/approval SQL contract. The local session/approval SQL contract also passed against disposable PostgreSQL 17.

Final local verification for the current code changes: 169 test files passed, 884 tests passed; `npm run typecheck` completed without errors; Next.js build compiled successfully and generated all 24 static pages (with the existing non-fatal Autoprefixer warning). The candidate runtime migration applied successfully to disposable PostgreSQL 17; runtime SQL assertions passed for lease acquisition/renewal, ownership, idempotency/conflict, batch rollback, checkpoint integrity/monotonicity, ordered reads, and concurrent sequence allocation. `git diff --check` passed. Post-push CI is still required. This document intentionally does not claim P2 is complete.
