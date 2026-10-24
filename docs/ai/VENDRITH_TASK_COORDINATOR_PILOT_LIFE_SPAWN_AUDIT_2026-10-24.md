# AI Task Coordinator Pilot — Life Spawn Proposal Flow

- **Task ID:** `VENDRITH-COORD-PILOT-LIFE-SPAWN-2026-10-24`
- **Date:** 2026-10-24
- **Status:** `PARTIALLY VERIFIED` — source and focused tests checked; end-to-end authenticated runtime and database transition contract are not cleared for production use.
- **Required branch:** `feat/vendrith-ecc-v1`
- **Baseline commit:** `5dfbfb85146ad4d68160973eb0f19b6760328c0f`
- **Coordinator route:** Roadmap Director → Repository Auditor → QA & Testing Agent → Integration & Release Agent → Independent Verification Agent. Implementation role reviewed the evidence and correctly recommended **no code/DB change** until the P1 authorization and transaction boundaries are resolved.
- **Skills selected:** `ai-task-coordinator`, `roadmap-director`, `repository-auditor`, `qa-testing-agent`, `integration-release-agent`, `independent-verification-agent`, `game-data`, `verification`; relevant specialist prompt: `.ai/agents/vendrith-architect.md`.

## Goal
Exercise the new coordinator on a real Vendrith task: establish whether Generate Life's proposal → explicit approval → runtime intent → execution flow is wired, tested, and safe to treat as game-ready, without touching production data or enabling paid services.

## Scope and safety

**In scope:** read-only source/test/document audit and local focused tests/typecheck.

**Out of scope:** application/SQL changes, hosted Supabase calls, production data mutation, paid service setup, deployment, and browser E2E requiring a configured authenticated environment.

**Preserved baseline:** branch was `feat/vendrith-ecc-v1`; initial worktree had the pre-existing modified `apps/map-editor/tsconfig.tsbuildinfo`. That file was not edited or staged.

## Findings

### Existing UI wiring is present

- `apps/map-editor/app/life-creator/page.tsx` has separate user actions for proposal creation, explicit approval, and runtime-intent execution.
- `apps/map-editor/app/api/life-spawn-proposals/route.ts` authenticates the user, resolves an authoritative Playable map, validates integer/non-negative coordinates and map bounds, builds a Life spawn reference, and stores a pending proposal. It does not execute the runtime action at proposal time.
- `apps/map-editor/editor/life-spawn-proposal-client.ts` separates the proposal, approval, and runtime execution requests.
- `apps/map-editor/app/api/vendrith-runtime-intents/route.ts` authenticates before calling the runtime intent consumer.

### Blocking security/transaction findings remain

1. **P1 approval-state integrity:** the existing audit `docs/audits/VENDRITH_AI_ROADMAP_BASELINE_AUDIT_2026-10-15.md` records that authenticated owners could directly set their own proposal status to `approved` under the inspected table grant/RLS contract. Runtime enqueue must be bound to a trusted server-side approval transition, not merely a row status.
2. **Approval/enqueue partial-failure window:** `apps/map-editor/app/api/vendrith-ai/route.ts` calls `approve_vendrith_creator_action_v1` and then separately calls `enqueue_vendrith_runtime_intent_v1`. If the second operation fails after approval/mutation, the proposal may remain approved without a runtime intent.
3. **Runtime RPC permissions/idempotency need verification:** the prior audit records a disposable-PostgreSQL mismatch for invoker-mode runtime intent writes under the inspected grants/RLS, and duplicate enqueue may return success with a null intent ID. These are prior audit findings, not newly reproduced against a hosted database during this pilot.
4. **End-to-end readiness is unproven:** local unit tests and TypeScript do not demonstrate that hosted migrations/grants are current, authenticated approval/enqueue succeeds, the runtime intent is consumed, or the authoritative world state reflects a verified spawn.

## Validation evidence

- Focused Vitest: **3 files, 14 tests passed** (`life-spawn-proposal-client.test.ts`, `life-spawn-reference.test.ts`, `life-creator-draft.test.ts`).
- `npm run typecheck` from `apps/map-editor`: **passed** (exit code 0).
- Static source review: proposal/approval/execute boundaries found and inspected.
- Hosted Supabase integration: **not run**; no hosted DB was queried or mutated.
- Browser E2E / live runtime spawn: **not run**; not claimed verified.
- Deployment: **not checked**.

## Acceptance checklist

- [x] Coordinator selected a task route and relevant domain skills.
- [x] Repository branch and dirty-file baseline checked; unrelated file preserved.
- [x] Existing implementation located before proposing duplicate code.
- [x] Focused tests and typecheck run with exact results recorded.
- [x] Approval integrity and partial-failure risks escalated rather than bypassed.
- [ ] Prove approval-controlled proposal fields cannot be forged in an isolated PostgreSQL fixture using the current migration chain.
- [ ] Design and test an atomic transaction or durable outbox/idempotent recovery for approval + runtime-intent enqueue.
- [ ] Verify enqueue/claim/finish permissions and duplicate behavior with isolated roles/RLS.
- [ ] Run authenticated end-to-end test in a safe non-production environment and verify durable spawn state.
- [ ] Independently confirm hosted migration state and browser behavior before calling Life spawn game-ready.

## Handoffs and next action

- **Roadmap Director:** make proposal approval integrity + runtime intent atomicity the next P1 task; do not treat visual UI wiring as feature completion.
- **Repository Auditor:** inspect the exact current migration chain, grants, RLS, and function security modes before proposing SQL changes.
- **Implementation Agent:** wait for an approved design and isolated fixture evidence; do not patch hosted/production database or simply revoke grants without preserving the legitimate approval path.
- **QA & Testing Agent:** add negative forged-approval, enqueue failure, duplicate enqueue, concurrent approval, claim/finish and recovery tests.
- **Integration & Release Agent:** review migration ordering and only stage intended files; no deployment claim without separate evidence.
- **Independent Verification Agent:** verify every acceptance item against isolated and authenticated test evidence.

**Conclusion:** The coordinator pilot successfully routed a real task, surfaced the actual existing implementation, ran local checks, and stopped before an unsafe database change. The flow is **partially wired, not yet proven game-ready**. The next engineering task is the P1 approval-integrity and atomic/idempotent enqueue contract, starting with an isolated database fixture and no hosted mutation.
