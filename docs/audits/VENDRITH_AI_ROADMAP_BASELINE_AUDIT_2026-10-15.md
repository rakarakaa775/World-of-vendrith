# Vendrith AI Roadmap — Baseline Audit
**Audit date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch observed:** `feat/vendrith-ecc-v1`  
**HEAD observed:** `d5d03536` — `fix(ai): retry overloaded Gemini models`  
**Audit mode:** Read-only source/documentation inspection. No application code, database, deployment, dependency, commit, or push changes made for this audit.

## 1. Executive summary

Vendrith AI is **not a greenfield feature**. The repository already contains a multi-surface AI foundation spanning Web/Creator AI, Development AI, and Game/NPC runtime intelligence. The next roadmap should prioritize **integration correctness, capability evidence, runtime reliability, and release gates** before adding more AI libraries or agents.

The existing architecture's governing principle is sound: the model proposes; deterministic game/engine state, policy, approval, persistence, and verification remain authoritative. Roadmap.sh is being used as a learning/architecture reference, not as a source to copy into Vendrith.

## 2. Repository state and safety constraints

- The active branch is `feat/vendrith-ecc-v1`, tracking `origin/feat/vendrith-ecc-v1`.
- HEAD observed during this audit: `d5d03536`.
- The working tree already contains an unrelated, pre-existing modification to `.gitignore`: `*.log` was changed to `*.lo`, and the file has no final newline. **Preserve this change; do not revert or include it in a future audit commit without the user's direction.**
- The repository was inspected using Desktop Commander on the online Codespaces device.
- No tests were run during this initial source/documentation pass. Historical test results in project documents are evidence for their stated revisions only and are not a fresh pass for HEAD `d5d03536`.
- No hosted/production Supabase mutation, migration, deployment, dependency installation, commit, or push was performed.

## 3. Existing implementation found

### 3.1 AI surfaces

1. **Web / Creator AI**
   - API route: `apps/map-editor/app/api/vendrith-ai/route.ts`.
   - Authenticates Supabase users and rejects anonymous sessions.
   - Has request-size and prompt bounds, per-user request budget, persistent user-owned sessions/messages, world/region/playable context resolution, evidence/tool results, and a persisted proposal/approval path for supported creator actions.
   - Web/Creator request modes are restricted to `explain` and `plan`; direct `execute` and `high-risk` requests are rejected.

2. **Development AI**
   - API route: `apps/map-editor/app/api/vendrith-dev-ai/route.ts`.
   - Has a distinct `development` audience and repository/code-graph inspection path.
   - The current route rejects `execute` and `high-risk` requests with `DEVELOPMENT_MUTATION_WORKFLOW_NOT_CONNECTED`. This means the user-facing Development AI mutation path must be treated as **not connected end-to-end**, even though Phase 4 documentation describes a governed repository-mutation workflow elsewhere. Reconcile the code/docs before planning additional execution features.

3. **Game / NPC runtime**
   - Runtime intent API: `apps/map-editor/app/api/vendrith-runtime-intents/route.ts`.
   - Uses authenticated requests, durable intent claim/finish flow, and explicit reconciliation logic rather than blindly repeating an interrupted action.
   - Existing AI modules cover NPC behavior, goals, needs, schedules, movement/navigation, relationships/social intelligence, world awareness, specialized agents, long-term memory, and bounded coordination.
   - The runtime remains a separate authority surface; Web/Creator and Development tools must not become implicit runtime permissions.

### 3.2 Shared architecture and guardrails

- Shared AI code is organized under `apps/map-editor/ai/{domain,application,ports,adapters,policies}`.
- The core contract specifies `observe → reason/plan → propose → policy → execute → verify → remember`.
- A `ModelProviderPort`, tool router, audience/capability metadata, approval policy, evidence records, and bounded tool loop already exist.
- The runtime governance audit documents limits of 8 iterations and 12 total tool calls, state-version/expiry validation, risk checks, and fail-closed handling of unapproved high-risk actions.
- Existing docs distinguish architecture completion from hosted database/browser release verification. Authenticated browser/session E2E and some hosted Supabase/deployment checks remain explicit release gates.

### 3.3 Current technology/dependency baseline

From `apps/map-editor/package.json`:
- Next.js 15, React 19, TypeScript 5.9, PixiJS 8, Supabase JS/SSR, Vercel OIDC, Vitest.
- No `ai` / `@ai-sdk/*`, LangChain, or MCP SDK dependency appears in this package manifest.
- `DirectModelProvider` is used by the Web/Creator and Development API routes and supports an OpenAI-compatible endpoint, including Gemini configuration and bounded retry/fallback behavior.
- A `VercelAiGatewayModelProvider` adapter and tests exist, but a repository search found no route wiring that instantiates it; current routes instantiate `DirectModelProvider`. Treat AI Gateway adoption as an architecture/configuration decision, not as an already-active route integration.
- No package from the earlier UI/icon discussion (Tabler Icons, Iconify, Heroicons, Simple Icons, Devicon, unDraw) is required for the AI architecture. Keep those candidate UI packages deferred until the AI roadmap and UI needs justify them.

## 4. Open workstreams to evaluate in the roadmap

The following are candidate workstreams, not claims that every item is a confirmed defect:

1. **Evidence and source-of-truth reconciliation**
   - Resolve discrepancies between current routes, architecture documents, migrations, and release-readiness reports.
   - Make each roadmap item point to its source file, tests, and acceptance criteria.

2. **Provider reliability and operations**
   - Confirm which provider path is intended for local, preview, and production environments.
   - Compare direct provider vs Vercel AI Gateway using cost, latency, retry behavior, model fallback, observability, secrets, and failure semantics.
   - Re-test the current Gemini 503 retry/fallback change on the observed HEAD before treating it as verified.

3. **Tool and permission governance**
   - Verify capability/audience filtering and approval binding across all API routes.
   - Keep repository writes, database changes, deployment, destructive operations, and high-risk actions fail-closed unless their explicit approval workflow is connected and verified.
   - Treat tool output, repository content, and model output as untrusted data.

4. **Durable runtime recovery**
   - Confirm runtime-intent finish/reconciliation behavior from source and disposable PostgreSQL tests.
   - Prove retries/reconciliation cannot duplicate a committed world mutation.
   - Keep hosted/production migration status separate from local/CI evidence.

5. **NPC intelligence integration**
   - Assess whether long-term memory affects goal preference scoring.
   - Assess whether coordination proposals enter authoritative goal arbitration.
   - Assess whether world consequences become durable event/history evidence.
   - Keep these as bounded, deterministic integrations, not permission to let the model directly mutate game state.

6. **Context, memory, and code intelligence**
   - Audit context selection, token/context budgets, project rule retrieval, CodeGraph freshness, evidence provenance, and memory retention.
   - Avoid broad repository context dumps and unverified durable memories.

7. **Security, abuse, and observability**
   - Recheck distributed rate limiting for multi-instance deployment.
   - Check request-size limits, auth/session ownership, prompt injection, sensitive logging, provider errors, retries, and operational telemetry.
   - Add adversarial tests for cross-audience tool access and untrusted tool output.

8. **Release validation**
   - Separate unit tests, typecheck/build, disposable PostgreSQL contracts, preview HTTP checks, authenticated browser/session E2E, and hosted Supabase verification.
   - Do not call a release gate passed based only on CI or HTTP 200 responses.

## 5. Roadmap.sh reference review

References reviewed:
- https://roadmap.sh/ai-agents
- https://roadmap.sh/ai-engineer
- https://roadmap.sh/software-architect
- https://roadmap.sh/ai-red-teaming
- Existing internal reference audit: `inspirasi/DEVELOPER_ROADMAP_KAMRANAHMEDSE_AUDIT.md`

Use these as **topic checklists**, not as a plan to clone a generic AI-agent stack. The relevant topic groups to map against Vendrith are:
- AI application and provider integration;
- agent/tool orchestration and bounded execution;
- architecture and explicit boundaries;
- evaluation, regression tests, observability, and reliability;
- security and AI red teaming;
- deployment/release verification.

The existing internal roadmap.sh audit records a restrictive content/license warning. Do not copy roadmap text, diagrams, images, or project content into Vendrith. Use original Vendrith-authored requirements and acceptance criteria.

## 6. Initial risk / priority assessment

| Priority | Topic | Initial assessment | Roadmap treatment |
|---|---|---|---|
| P0 | Branch/worktree integrity | Existing `.gitignore` edit must be preserved | Record baseline before any write/commit |
| P0 | Route/docs capability mismatch | Development AI route rejects execute/high-risk while Phase 4 docs describe a broader workflow | Reconcile and test before expanding mutation capability |
| P1 | Provider path clarity | Direct provider is wired; Gateway adapter appears implemented but unwired | Decide by environment and acceptance criteria before adding SDKs |
| P1 | Runtime intent recovery | Reconciliation is present in route; durable no-duplicate behavior must be proven by tests | Audit SQL contract and failure scenarios |
| P1 | Authenticated browser E2E | Existing release docs leave it open | Keep as a distinct release gate |
| P2 | NPC emergent feedback loops | Memory scoring, arbitration, and durable event/history feedback are documented as deferred | Prioritize only after deterministic runtime integration criteria are defined |
| P2 | Multi-instance rate limiting | Distributed rate limiting is documented as deferred | Revisit before scaling beyond one runtime instance |
| P3 | Additional agent frameworks/SDKs | No immediate evidence that another framework is required | Defer; avoid duplicating existing orchestration |
| P3 | UI icon/illustration packages | Not relevant to core AI runtime | Remain in the separate deferred candidate list |

## 7. Audit limitations

This is an initial baseline audit based on current source files and existing project documents. It is not a full security review, provider benchmark, authenticated browser E2E run, hosted database verification, or release sign-off. The next audit pass should inspect the tool router/policy implementations, provider error handling, session and approval SQL contracts, runtime intent SQL/reconciliation tests, and the tests affected by the latest provider retry/fallback commit.

## 8. Recommended next audit sequence

1. Reconcile code vs documentation and capture the exact current branch/diff baseline.
2. Audit AI API routes, authentication, session persistence, rate limits, and approval boundaries.
3. Audit provider selection, retry/fallback, error redaction, and telemetry.
4. Audit tool router, capability/audience filters, prompt-injection boundaries, and evidence construction.
5. Audit runtime intent SQL, recovery/reconciliation, idempotency, and no-duplicate guarantees.
6. Audit NPC intelligence integration and list deferred capabilities with measurable acceptance criteria.
7. Run targeted tests for the latest commit, then the full test/typecheck/build/SQL pipeline where safe.
8. Draft the implementation roadmap with dependencies, priority, acceptance criteria, and explicit non-goals. Only then consider package additions.

**Current decision:** Audit first. No dependency installation or AI architecture redesign is authorized by this baseline document.

## 9. API / identity / approval boundary audit (pass 2)

**Scope actually inspected:** Web/Creator API route, Development AI API route, runtime-intent consumer route, orchestrator, tool router, approval policy, persistent session store, runtime intent consumer/executor, selected SQL migrations, and focused unit tests. This is source review plus targeted tests, not a penetration test or hosted-environment audit.

### 9.1 Controls confirmed in source

- Web/Creator and Development routes call Supabase `auth.getUser(token)` and reject missing/expired tokens and anonymous users.
- AI session/message tables use RLS; policies bind rows to `auth.uid()`, explicitly reject anonymous Auth users, and messages have a composite FK to the matching session/user.
- Creator proposals bind to the session/user and the approval RPC checks proposal ownership, pending status, session/context consistency, and map accessibility.
- Runtime intents have a separate authenticated consumer endpoint. The runtime consumer requires a canonical `runtimeAction`, calls the authoritative map resolver, records failed execution, and requests journal-backed reconciliation if the finish write is not confirmed.
- The tool router rejects unknown tools, validates arguments, filters tool definitions by audience, rejects direct cross-audience calls, and enforces explicit approval for high-risk tools.
- The Development repository executor (source inspected) restricts write paths, blocks secret/private-key file patterns and GitHub workflow files, caps file content at 512 KiB, uses expected-SHA conflict checks, and verifies written content after the GitHub API call. This executor is not wired as a mutation path on the inspected Development AI API endpoint.

### 9.2 Confirmed high-priority finding: rate-limit clock is caller-controlled

File: `database/migrations/20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql`.

The authenticated RPC `consume_vendrith_web_ai_rate_limit_v1(p_user_id, p_now default now())` accepts caller-supplied `p_now` and uses it to determine/reset the rate-limit window. The function verifies the caller's user ID matches `p_user_id`, but does not force the timestamp to database time. Because authenticated users can invoke the granted RPC directly, a user can supply successively later timestamps to advance/reset their own counter, bypassing the intended per-user request budget. This is a source-level finding, not a live exploit test.

**Priority: P1 / fix before relying on the distributed limiter for abuse protection.** Recommended remediation: remove the caller-controlled timestamp from the public RPC signature (or ignore it and use database `now()` internally), revoke the old function signature, update the TypeScript call and tests, and add a SQL regression test proving callers cannot manipulate the clock. Confirm migration ordering and deployed function signature before changing it.

### 9.3 Confirmed hardening gaps in Development AI route

File: `apps/map-editor/app/api/vendrith-dev-ai/route.ts`.

- Unlike the Web/Creator route, it has no request-byte limit and does not use the distributed request budget. It parses JSON before applying the 4,000-character prompt limit. This leaves the endpoint without the same explicit request-size/abuse controls as Web/Creator AI.
- It rejects `execute` and `high-risk` modes, but does not explicitly reject unknown mode strings at runtime. TypeScript's request-body cast does not validate untrusted JSON. The router still applies its own tool checks, but the API should validate allowed values and return a 400 for unsupported modes.
- There are no direct route-level tests among the inspected test inventory; current tests cover router isolation and the Web AI security helper, not the full HTTP authentication/body/mode/error behavior of this route.

**Priority: P1/P2.** Add bounded body reading (not only Content-Length checks), distributed rate limiting appropriate to the Development AI audience, strict runtime schema validation, and route tests. Keep high-risk mutation disconnected until the separately approved execution workflow is truly connected.

### 9.4 Request-body size enforcement needs a stronger boundary

Web/Creator checks the `Content-Length` header against 64 KiB, but `requestBodyExceedsWebAiLimit(null)` returns false. The route later limits prompt length, but JSON parsing and other fields occur before that prompt check. A missing or untrusted Content-Length should not be treated as proof the body is small.

**Priority: P2.** Enforce a byte cap while reading the request stream or through a trusted platform-level limit, and test missing/malformed Content-Length plus oversized streamed JSON. Keep the existing prompt-length cap as a separate control.

### 9.5 Error redaction / operational leakage

The inspected Web/Creator GET/POST catch blocks return `error.message` to clients. The Development AI route does the same. Some errors are deliberately sanitized by lower-level adapters, but the route does not guarantee that every database/provider/configuration error is safe for public exposure.

**Priority: P2.** Return stable public error codes/messages; log structured, redacted diagnostics server-side with request IDs. Add tests proving provider and database exception text is not returned verbatim. Do not log bearer tokens, prompts containing secrets, or full private repository contents.

### 9.6 Approval-to-mutation-to-runtime sequencing requires a contract test

The Creator route calls `approve_vendrith_creator_action_v1`; the corresponding SQL function performs the editor mutation through `editor_mutation_gateway_v1`. After that, the route reads the proposal action and, when it contains `runtimeAction`, queues a runtime intent. The runtime intent is later executed through the separate runtime executor and journal.

This may be intentional (editor/map action plus runtime-world action), but source inspection alone does not establish that the two effects are always distinct, atomic enough, and safe under partial failure. A failure after the map mutation but before intent enqueue could leave a partially completed workflow; retries must not repeat the map mutation.

**Priority: P1 verification.** Add integration/SQL tests for approval succeeds + enqueue succeeds, approval succeeds + enqueue fails, repeated approval, repeated enqueue, and recovery after process failure. Document which effect is authoritative and what user-visible status means. Do not label this a confirmed duplicate-mutation bug until those contracts are tested.

### 9.7 Runtime endpoint boundaries

- Runtime route authenticates a non-anonymous user and validates intent ID format.
- Ownership/eligibility for claim/retry/reconciliation is delegated to SECURITY DEFINER RPC contracts in SQL. Route-level checks alone do not establish ownership, so review each function's `auth.uid()`, intent-user binding, status transitions, and grants before release.
- Runtime executor uses a lease, idempotency mutation ID `runtime-intent:<intentId>`, action/proposal equality checks, state-hash verification, journal append, checkpoint persistence, and explicit reconciliation. These are strong design controls, but the live DB functions and concurrency behavior still require integration tests.

### 9.8 Targeted tests run during this pass

Executed from `apps/map-editor`:
- `npm test -- --run tests/web-ai-security.test.ts tests/ai-tool-router.test.ts ai/ports/tool-router.test.ts` — **3 test files, 21 tests passed**.
- `npm test -- --run ai/application/persistent-ai-session.test.ts ai/application/runtime-intent-consumer.test.ts` — **2 test files, 9 tests passed**.

These results are for the current local checkout at the time of execution. They do not prove production deployment, SQL migration application, browser E2E, or multi-user concurrency safety. Typecheck was started separately; its final result must be recorded only after the process completes.

## 10. Updated risk ranking after pass 2

| Priority | Finding | Evidence / next action |
|---|---|---|
| P1 | Caller-controlled clock can reset own distributed Web AI rate limit | Remove/ignore `p_now` in the granted SQL RPC; regression test and confirm deployed signature |
| P1 | Creator approval + runtime enqueue is a multi-effect workflow | Test partial failure and idempotency across map mutation and runtime intent enqueue |
| P1/P2 | Development AI route lacks shared body/rate controls and strict mode validation | Add request stream cap, rate limit, runtime schema validation, route tests |
| P2 | Web body cap relies on Content-Length | Enforce actual streamed byte limit |
| P2 | Raw exception messages returned to clients | Stable error codes, redacted logs, non-leakage tests |
| P1 release gate | Hosted SQL ownership/status/permission behavior not verified in this pass | Inspect claim/retry/reconcile functions and run disposable DB integration tests |
| P1 release gate | Authenticated browser/session E2E not performed | Add and run end-to-end tests in preview/staging |

**No source code, SQL migration, dependency, production database, or deployment was changed during pass 2.** The only write remains this audit document; the earlier unrelated `.gitignore` modification remains untouched.

- `npm run typecheck` — **passed** (`tsc --noEmit`, exit code 0) on the same local checkout. This is a compile/type check only; it does not resolve the API/SQL security findings above.

## 11. SQL/RPC permission and approval-integrity audit (pass 3 — source-only)

**Scope:** Read-only inspection of the relevant migrations for Web AI rate limiting, creator proposals/approval, runtime-intent queue/claim/finish/retry/reconciliation, runtime persistence, and their TypeScript callers. No hosted Supabase database was queried; migration application state and deployed grants/RLS are unverified.

### 11.1 P1 — Runtime intent RPCs conflict with table RLS

Files:
- `database/migrations/20261009013000_vendrith_runtime_intents_v1.sql`
- `database/migrations/20261009014000_vendrith_runtime_intent_consumer_v1.sql`
- `database/migrations/20261009020000_vendrith_phase4_rpc_execute_hardening_v1.sql`

The runtime-intent table defines a SELECT-only RLS policy. No INSERT or UPDATE policy for authenticated users was found in the inspected migrations. Yet `enqueue_vendrith_runtime_intent_v1`, `claim_vendrith_runtime_intent_v1`, and `finish_vendrith_runtime_intent_v1` are ordinary PL/pgSQL functions (no `SECURITY DEFINER` declaration); their bodies insert/update the runtime-intent table. Granting EXECUTE on these functions does not bypass RLS. Under the authenticated caller role, enqueue/claim/finish therefore appear blocked by RLS. The exact error must be confirmed against a disposable database built from the complete migration sequence, but the source contract is inconsistent.

**Priority: P1 / release blocker for runtime intent flow.** Decide explicitly between narrowly scoped SECURITY DEFINER RPCs (with fixed empty search_path, strict auth/ownership/status validation and minimal grants) or carefully designed write policies/permissions. Do not simply grant broad table writes. Add SQL integration tests for enqueue, claim, finish, unauthorized user, anonymous user, invalid status, and invalid transitions.

### 11.2 P1 — Creator proposal table permissions allow clients to forge approval state

File: `database/migrations/20261009011000_vendrith_creator_action_proposals_v1.sql`.

Authenticated users receive INSERT and UPDATE on their own proposal rows, and the RLS policies only enforce row ownership. The table's status constraint permits `approved`; the policies do not constrain which columns/status transitions a user may set. Meanwhile `enqueue_vendrith_runtime_intent_v1` checks that a caller-owned proposal has status `approved`, but does not require a server-created approval binding or an approval audit record.

As written, an authenticated client can potentially insert or update its own proposal directly to `approved`, supply an action containing `runtimeAction`, and call the enqueue RPC without passing through `approve_vendrith_creator_action_v1`. Runtime action validation may limit which actions execute, but it does not repair the database-level approval-integrity gap.

**Priority: P1.** Remove direct client UPDATE authority over approval-controlled fields/status, and consider server-only proposal creation/update or a tightly constrained transition RPC. Bind enqueue to a server-issued approval ID and validate proposal state/action in the same trusted boundary. Add a negative integration test proving a forged approved proposal cannot be enqueued or executed.

### 11.3 P2 — Idempotent enqueue can return success without an intent ID

File: `database/migrations/20261009013000_vendrith_runtime_intents_v1.sql`.

The INSERT uses `ON CONFLICT(proposal_id) DO NOTHING RETURNING id`. On a repeated enqueue, no row is returned, so local variable `i` remains NULL; the function still returns `ok: true`, `status: queued`, and `intent_id: null`. This avoids a duplicate row, but gives callers an ambiguous success response and makes recovery/retry orchestration harder.

**Priority: P2.** On conflict, fetch the existing intent and return its actual ID/status, while verifying it belongs to the same user/proposal and has not entered an incompatible terminal state. Test repeated enqueue and concurrent enqueue.

### 11.4 P1 — Distributed rate-limit RPC trusts caller-controlled time (reconfirmed)

File: `database/migrations/20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql`.

The function accepts `p_now` and uses it to calculate/reset its minute window. The TypeScript helper omits `p_now`, so normal route calls use the default; however, authenticated clients can call the granted RPC directly with a future timestamp. The risk remains a direct-RPC abuse path. Use database time inside the function and retire the old callable signature only after migration/deployment compatibility is verified.

### 11.5 P1 verification — Approval mutation and runtime enqueue are separate transactions

The Web/Creator route first calls the approval RPC, whose SQL invokes the editor mutation gateway and marks the proposal approved; only after that RPC returns does the route separately enqueue a runtime intent if the proposal contains `runtimeAction`. A failure between these operations leaves the editor mutation approved/applied while runtime work may not be queued. Retrying approval cannot safely be assumed to enqueue the missing intent because the proposal is no longer pending.

This is a confirmed partial-failure window in the source-level sequence, not proof of data corruption or duplicate execution. Prefer a durable outbox/intent row created atomically with the approval transaction, or add an idempotent repair/retry contract that does not repeat the editor mutation. Test approval success + enqueue failure, repeated requests, concurrent requests, and recovery.

### 11.6 Runtime persistence / reconciliation review notes

- The lease, journal, checkpoint, mutation lookup and reconciliation functions use SECURITY DEFINER with ownership checks in the inspected SQL; the mutation log/checkpoint/lease tables revoke direct table access from authenticated clients.
- Reconciliation requires an authenticated owner, accepts only processing/failed intents, checks for a journal row keyed by `runtime-intent:<intentId>`, and compares intent/proposal/action/world/state metadata before marking the intent consumed. It records audit outcomes and does not blindly re-execute a missing journal entry.
- The reconciliation function can mark an intent consumed while reporting `checkpointSaved: false` if the matching journal exists but the checkpoint has not caught up. This may be intentional if recovery replays the durable journal; confirm that the recovery path does replay it before treating the intent as fully recovered.
- These controls are only source-reviewed. Concurrency, grants, owner/bypass-RLS behavior, journal integrity and checkpoint replay still need disposable-database integration tests. Do not infer hosted deployment from migration files.

### 11.7 Roadmap alignment

The current roadmap.sh AI Agents and AI Red Teaming tracks, alongside its API Security best-practice checklist, support prioritizing authorization boundaries, adversarial tests, safe input/output handling, and automated integration tests before adding frameworks or packages. These are planning checklists, not a reason to copy a roadmap or add dependencies:
- https://roadmap.sh/ai-agents
- https://roadmap.sh/ai-red-teaming
- https://roadmap.sh/pdfs/best-practices/api-security.pdf

### 11.8 Pass 3 risk ranking

| Priority | Finding | Next action |
|---|---|---|
| P1 | Runtime-intent enqueue/claim/finish appear blocked by missing write RLS policies because functions run as invoker | Reconcile function security mode, RLS/grants; prove behavior in disposable PostgreSQL/Supabase integration tests |
| P1 | Own-row proposal INSERT/UPDATE can forge `approved` status and bypass the intended approval RPC | Protect approval-controlled fields and bind enqueue to server-side approval proof |
| P1 | Caller-controlled rate-limit timestamp remains a direct-RPC bypass path | Use database time; test direct RPC attempts with future timestamps |
| P1 | Approval and runtime enqueue are separate transactions | Add atomic outbox or safe idempotent repair flow |
| P2 | Duplicate enqueue returns `ok: true` with null intent ID | Return existing intent ID/status on conflict |
| P1 release gate | Hosted migration state and actual database grants/RLS remain unverified | Test full migration sequence in disposable DB, then inspect staging before any production change |

**Change boundary:** This pass only appended findings to this audit document. No source code, SQL migration, dependency, live database, or deployment was changed. No package was installed; the roadmap remains an audit/planning artifact.

## 12. Disposable PostgreSQL verification (pass 4)

**Environment:** Started a new temporary PostgreSQL 17 container named `vendrith-ai-audit-pg`, with a fresh database `vendrith_ai_audit` and a tmpfs data directory. It was isolated from Supabase hosted projects. The harness applied only the selected creator-proposal, runtime-intent, runtime-consumer, and rate-limit migrations against minimal Auth/session fixture tables. This was not the complete 23-file application migration sequence and did not use the hosted database.

### 12.1 Reproduced results

1. **Proposal status mutation — reproduced.** As database role `authenticated`, inserted an owned proposal with status `pending`, then updated its status to `approved`. PostgreSQL returned `UPDATE 1`; subsequent SELECT returned `approved`. This proves the current RLS/column-permission contract does not protect the approval status. In this harness the runtime enqueue call is separately blocked by the next finding; therefore this test proves status manipulation, not successful unauthorized runtime execution.

2. **Runtime enqueue/claim/finish — permission failure reproduced.** As role `authenticated`, all three RPCs raised SQLSTATE `42501` in the disposable database:
   - `enqueue_vendrith_runtime_intent_v1`
   - `claim_vendrith_runtime_intent_v1`
   - `finish_vendrith_runtime_intent_v1`
   
   The failures are consistent with missing table write grants/RLS policies for invoker functions. This confirms the selected-migration harness behavior; test the complete production-like migration chain before applying any fix.

3. **Caller-controlled rate-limit time — reproduced.** Three authenticated calls supplied progressively later timestamps (2035-01-01 00:00Z, 00:01Z, and 00:02Z). All returned `allowed: true`, `remaining: 19`; the persisted counter ended at `request_count = 1` for the latest future window. This confirms the direct RPC can reset its counter using caller-supplied time.

4. **Duplicate enqueue response — reproduced.** Calling enqueue a second time as the database owner against the existing proposal returned `{"ok": true, "status": "queued", "intent_id": null}`. This confirms the idempotency response gap, although the normal authenticated invoker path is currently blocked by the runtime write-permission issue.

### 12.2 Test interpretation and remaining gaps

- These are controlled, source-matched reproductions in a minimal disposable database, not proof that the hosted database has the same migration state or grants.
- The harness applied the relevant migration files, not all 23 migrations. It did not exercise the full editor mutation gateway, approval transaction, concurrency races, runtime journal/checkpoint replay, or hosted RLS/function ownership.
- The proposal-status issue and runtime-RPC failure must be fixed together: simply changing runtime functions to SECURITY DEFINER without first restricting proposal status transitions would remove the current permission barrier while leaving the approval-integrity weakness.
- No production or hosted database was contacted. No application source, SQL migration, dependency manifest, or deployment was changed. Only this audit document was appended; the existing `.gitignore` and `apps/map-editor/tsconfig.tsbuildinfo` worktree changes were left untouched.

### 12.3 Required next verification gate

Before proposing a migration patch, build a reproducible test database from the project's canonical baseline plus the complete applicable migration chain, then add SQL regression assertions for:
- authenticated user cannot set approval status/approval ID/result directly;
- only the approved RPC can create the approval binding;
- unauthorized and anonymous users cannot enqueue, claim, finish, retry, or reconcile another user's intent;
- legitimate enqueue/claim/finish succeeds through the intended trusted boundary;
- repeated enqueue returns the existing intent ID;
- future timestamps cannot change the rate-limit window;
- approval and runtime intent survive/repair partial failures without repeating editor mutation;
- concurrent claims/enqueues produce exactly one authoritative transition.

**Pass 4 outcome:** Three P1 issues (runtime RPC write boundary, proposal approval integrity, caller-controlled rate-limit clock) are reproduced in the isolated harness; the P2 duplicate-enqueue response issue is also reproduced. The AI roadmap remains blocked on security-contract decisions and complete migration-chain tests. No packages were installed.


## 13. Migration source inventory and authority reconciliation (pass 5 — read-only)

**Scope:** Inspected both migration directories, SHA-256 fingerprints, Supabase CLI config, repository guidance, package scripts, CI workflows, baseline object coverage, and current worktree status. No migration was applied and no hosted database was contacted.

### 13.1 Inventory and chronology

| Directory | File count | Content pattern | Intended role evidenced by repository docs |
|---|---:|---|---|
| `supabase/migrations/` | 3 | One reconstructed production schema baseline (2026-10-03), then atomic Save Slot RPC (2026-10-11), then validated Load Slot RPC (2026-10-12) | Supabase CLI migration source directory; ordered lexicographically by timestamp |
| `database/migrations/` | 23 | Five numbered historical/project migrations, then 18 timestamped AI/session/approval/runtime migrations dated 2026-10-09 | Separate historical/project SQL source; not automatically part of the Supabase CLI migration chain |

The Supabase baseline is 1,069,167 bytes and labels itself a **reconstructed schema-only baseline from PostgreSQL catalogs**, not a verbatim `pg_dump`; it explicitly asks for authenticated `supabase db pull` validation before migration-history repair. The two later Supabase migrations depend on `public.map_editor_save_slots` and related Map Editor objects present in that baseline. The local `supabase/config.toml` enables migrations and does not configure an alternate migration directory; the standard Supabase CLI source path is therefore `supabase/migrations/`.

The two directories are not duplicates and must not be concatenated or replayed as one sequence by filename sorting. The five `0001`–`0005` files and the Oct-09 AI family are a separate stream; the AI migrations are not represented in the three-file Supabase CLI directory. CI deliberately applies selected `database/migrations/` AI SQL files against disposable PostgreSQL fixtures, but that is test execution, not proof of deployment.

### 13.2 Material source/deployment gap

A read-only object-name scan of `20261003170000_remote_schema_baseline_reconstructed.sql` found references to `map_editor_save_slots` and `map_editor_commands`, but **no definitions/references** for `vendrith_ai_sessions`, `vendrith_creator_action_proposals`, `vendrith_runtime_intents`, or `vendrith_web_ai_rate_limits`. Those AI objects are introduced in `database/migrations/` instead. This is consistent with the separate-source guidance, but it means the repository alone does not prove that the AI SQL is included in the Supabase CLI deployable chain.

**P1 release gate / state unknown:** Before relying on the AI routes against hosted Supabase, establish whether the relevant Oct-09 AI migrations were applied to the intended hosted project and how they were applied. The live migration ledger is the source of truth for applied history per `database/README.md`; it was not queried in this audit. Do not copy these files into `supabase/migrations/`, mark them as applied, or run `db push` until exact live ledger state, schema state, migration ordering, and replay safety have been verified. In particular, the AI SQL includes later hardening and reconciliation migrations that must not be assumed equivalent to the reconstructed Oct-03 baseline.

### 13.3 Documentation drift

`supabase/README.md` is stale relative to the current tree: it says the “current captured migration” is `20260908_inventory_mutation_gateways.sql`, but that file is not present in `supabase/migrations/`; it also says the directory exposes only that migration, while three different files currently exist. `docs/checkpoints/MIGRATION_SOURCE_PARITY_2026-09-11.md` accurately records the older Sep-11 state (one captured file and a live ledger larger than the repo), but it predates the Oct-03 reconstructed baseline and Oct-11/12 Save Slot migrations. The checkpoint is historical evidence, not a current inventory.

Recommended documentation follow-up (not performed in this audit): update `supabase/README.md` to reflect the three present files and retain the warning that the reconstructed baseline is not byte-for-byte verified; add a dated migration-source map explaining that `database/migrations/` is not automatically deployed by the Supabase CLI and that live ledger reconciliation is mandatory.

### 13.4 Automation and tool availability

- `.github/workflows/map-editor-ci.yml` runs app tests/typecheck/build and separate PostgreSQL fixture jobs. It applies selected Save Slot migrations from `supabase/migrations/` and selected AI runtime migrations from `database/migrations/` only to disposable test databases. No Supabase production deploy or migration-ledger reconciliation step was found in the inspected workflows.
- `apps/map-editor/package.json` defines app scripts (`dev`, `build`, `start`, `test`, `typecheck`) but no database migration/deployment script. No root `package.json` exists.
- Docker is available. Host `supabase` CLI and `psql` executables were not found in this environment. No relevant Supabase/database environment variables were present in the checked environment-variable names. This prevented live ledger inspection without installing/configuring tools or obtaining credentials; neither was attempted.

### 13.5 SHA-256 inventory fingerprints

Hashes below were computed from the current worktree after the read-only inventory. They are local fingerprints for repeatability, not proof of remote deployment or GitHub/hosted parity.

**`database/migrations/` (23 files):**

| File | SHA-256 |
|---|---|
| `0001_vandrith_foundation_and_simulation.sql` | `6a061ce3f60219aeb25435d59c944e196be5f1bc860aa705dede264eb235bf33` |
| `0002_energy_recovery_v1_0_rules.sql` | `517e276de8b0e680552e876d19aaafb375bf29a12944aacbc5c47a72dd6d0f53` |
| `0003_fix_eat_food_recovery_trigger_v1_0.sql` | `b4bf2c0a3b432d410beccf233961767e0ee611aa7697d3c594aec5630e10f435` |
| `0004_energy_history_recovery_events_v1_0.sql` | `38f213c98a91782552746df052961bbcfe8028c97dd51d96b9828d6fdd56b167` |
| `0005_fix_energy_trigger_order_for_recovery.sql` | `20009b34960d2fdb5428439cbaf0d7874fc18c1f4703069310b6b2403add0434` |
| `20261009004400_vendrith_ai_sessions_v1.sql` | `f70e25e22b512373f3d63767204b0624f0cc25b2285a9a89b794ec71c5ffc9c8` |
| `20261009004600_vendrith_ai_sessions_require_non_anonymous.sql` | `23f19743ce4560180e6a6b02997f509925524dee2a6c661d980361379bf95690` |
| `20261009005000_vendrith_ai_session_world_context_v1.sql` | `0417aab05c85c48b19f5709fb8313746f2ef354e46e6a76e67b130838d408043` |
| `20261009011000_vendrith_creator_action_proposals_v1.sql` | `e52635c6340a6d2f14e8be0d276c0066e52707eea4e0f314e1f74870bd9de398` |
| `20261009012000_vendrith_creator_action_approval_v1.sql` | `d5a9b8ddd0178fe67b68e2b86ffaa87c159d4e3d0c27c8d8e7a4beab59720988` |
| `20261009013000_vendrith_runtime_intents_v1.sql` | `f39369d237822ace3d53eb5546cd0f4f83932b76ed35519731995edf2264e0c6` |
| `20261009014000_vendrith_runtime_intent_consumer_v1.sql` | `0c89e0b0117ef1f8e35d98eb681c35778e4bef99f7690d31027b46109f0764f2` |
| `20261009015000_vendrith_runtime_intent_retry_v1.sql` | `c23d19c52691999e1e7135fd2e7b244bb33fb5957461e951c9451ee8b98de309` |
| `20261009015100_vendrith_runtime_mutation_lookup_v1.sql` | `b72caf004eb910c9d9ee51dcce6e150a5266dac4b33bbe278d521b6d85ffd3b0` |
| `20261009015200_vendrith_runtime_persistence_v1.sql` | `f7bd9ca6e50693d5b47c4d1ef82261cd6563ee2cc92ed5340c5b3fe72653718b` |
| `20261009015300_vendrith_runtime_intent_reconciliation_v1.sql` | `bae27af83d3ecfc73f00cbaafa8299a1802e85ff47804c8a3ee9203efc417ef9` |
| `20261009016000_vendrith_development_action_proposals_v1.sql` | `dea45af26ead53d1db0bc02546615af460c88173b0079b8f25f00332a3f6a924` |
| `20261009017000_vendrith_development_action_approval_v1.sql` | `87b1b652869911c9ce0d3bd1ce698e546684340fc0ea134dc85debc80a1b15bf` |
| `20261009018000_vendrith_development_execution_v1.sql` | `dd485ef74547b57f1a7b258aff735ebb9615b87c870728a0f59a785e99216051` |
| `20261009020000_vendrith_phase4_rpc_execute_hardening_v1.sql` | `3b14c8e64c3a47b03eb979fccf4fd78e09f91883e44a524b2128f13efe72850e` |
| `20261009020100_vendrith_phase4_rpc_anon_execute_hardening_v1.sql` | `3d79cc0d8e00199dbba928006ed633590d11f561777174024125c32067daa437` |
| `20261009022000_vendrith_phase4_final_audit_hardening_v1.sql` | `f226ba1e23208c5edd48c45dee9a1215bfb1baa92296bdacdebdc96d68fa3f63` |
| `20261009030000_vendrith_web_ai_distributed_rate_limit_v1.sql` | `ca30fe666ccbd7a37073354a8fcc84e8d0caf7c40539dcba5dbd988771434c84` |

**`supabase/migrations/` (3 files):**

| File | SHA-256 |
|---|---|
| `20261003170000_remote_schema_baseline_reconstructed.sql` | `00d0383f2d201cdda0608bcfd0cc53a11bc4e94592f7617a57bb0637262ab2e3` |
| `20261011220000_map_editor_atomic_game_save_slot_v1.sql` | `04eb412d07cac5e2bea001959c2cc4f6b93d0ae73a5e20a2a0f490cb70c52dbe` |
| `20261012200000_map_editor_load_save_slot_validated_v1.sql` | `bac3414549a7fca752be7fdc559da13196b2731e313247c765a54fc2c30ca84` |


### 13.6 Pass 5 conclusion and next gate

1. **Canonical repository path for new Supabase CLI migrations:** `supabase/migrations/`, in timestamp order. This is a repository/tooling conclusion, not a claim that its reconstructed baseline matches the hosted migration ledger.
2. **Separate source stream:** `database/migrations/` contains project/AI SQL and is not automatically picked up by standard Supabase CLI migration commands. Selected files are used by CI fixtures only.
3. **Current unresolved deployment fact:** whether the Oct-09 AI migration family exists in the intended hosted project, and under what migration-ledger entries, is unknown. Treat this as a release gate, not as an assumption.
4. **Documentation drift:** `supabase/README.md` needs updating to match the present tree, but no documentation outside this audit was changed.
5. **Next safe step:** obtain authorized read-only access to the intended Supabase migration ledger and catalog (or a trusted export), compare it against the three repository migrations and the AI migration family, and produce a reconciliation matrix before proposing any SQL change. Do not run `db push`, `db reset`, `db pull`, or migration-history repair until the target project and exact remote state are confirmed.

**Change boundary:** Only this audit document was appended. No source code, migration SQL, package manifest, config, live database, or deployment was changed. The pre-existing `.gitignore` and `apps/map-editor/tsconfig.tsbuildinfo` worktree changes remain untouched. The audit remains uncommitted and unpushed.


## 14. Hosted Supabase read-only reconciliation (pass 6)

**Access method:** Connected Supabase project listing and read-only project metadata, migration-ledger, table inventory, SQL catalog queries, and Supabase advisors. Target selected by the exact project name returned from the connected account: `The world Vendrith` (`ojtmfokjcirvjvhnbnos`). No DDL, DML, migration-history edits, or deployment was performed.

### 14.1 Project and migration ledger facts

- Project status: `ACTIVE_HEALTHY`; PostgreSQL `17.6`.
- The remote migration ledger returns **555 entries**. Its latest observed entry is version `20261008211645`, name `vendrith_phase4_final_audit_hardening_v1`.
- The remote ledger contains the AI session/creator/runtime/development migration family, recorded mostly under **2026-10-08 versions**, e.g. `20261008174537_vendrith_ai_sessions_v1`, `20261008175324_vendrith_creator_action_proposals_v1`, `20261008175354_vendrith_creator_action_approval_v1`, `20261008180015_vendrith_runtime_intent_consumer_v1`, `20261008182110_vendrith_runtime_intent_retry_v1`, and Phase 4 hardening through `20261008211645`.
- The ledger does **not** contain matching entries by local filename-derived migration name for `vendrith_runtime_intents_v1`, `vendrith_runtime_persistence_v1`, `vendrith_runtime_intent_reconciliation_v1`, or `vendrith_web_ai_distributed_rate_limit_v1`. This is a ledger/name discrepancy, not proof that those objects are absent: the live catalog confirms some corresponding objects exist.
- The ledger does not contain exact entries matching the two current local Save Slot migration names (`20261011220000_map_editor_atomic_game_save_slot_v1` and `20261012200000_map_editor_load_save_slot_validated_v1`), although the live catalog does contain `public.map_editor_save_slots`. A prior migration with a different name/version may account for some objects; exact RPC deployment parity remains to be checked.
- The local reconstructed baseline `20261003170000_remote_schema_baseline_reconstructed.sql` is not present as an exact version/name in the remote ledger. The remote database instead has a long historical ledger with hundreds of migrations. Treating the reconstructed baseline as a pending migration would be unsafe.

### 14.2 Live catalog: AI objects and rate limiter

The remote catalog contains these public tables: `vendrith_ai_sessions`, `vendrith_ai_messages`, `vendrith_creator_action_proposals`, and `vendrith_runtime_intents`. The verbose table inventory reports RLS enabled on them. The private schema contains `private.vendrith_web_ai_rate_limits`; the corresponding public RPC `consume_vendrith_web_ai_rate_limit_v1(uuid,timestamptz)` exists and `authenticated` has EXECUTE while `anon` does not.

The live function definition was read without invoking it. It is a `SECURITY DEFINER` function that accepts `p_now timestamptz DEFAULT now()`, computes `v_window := date_trunc('minute', p_now)`, and uses `p_now` again for retry timing. Its identity check binds `auth.uid()` to `p_user_id` and rejects anonymous users, but it does not bind the clock to database time. **The caller-controlled timestamp defect is therefore confirmed in the connected hosted project's current function definition, not merely inferred from local source or reproduced only in the disposable database.** No exploit call was made against the hosted project.

### 14.3 Live runtime RPC definitions

Read-only catalog inspection returned definitions for `enqueue_vendrith_runtime_intent_v1(uuid)` and `claim_vendrith_runtime_intent_v1(uuid)`. Both are ordinary PL/pgSQL functions with a fixed `search_path` but **do not declare `SECURITY DEFINER`**, so they execute as invoker. Their bodies depend on direct writes to `public.vendrith_runtime_intents` and ownership/status filters. `authenticated` has table-level SELECT, INSERT, and UPDATE privileges on `public.vendrith_runtime_intents`; this alone does not establish whether RLS permits the needed writes. No hosted mutation was attempted to test it. The isolated PostgreSQL failure from pass 4 remains evidence about that harness only, not proof that the hosted call fails.

The duplicate-enqueue code path in the live enqueue function still uses `ON CONFLICT(proposal_id) DO NOTHING RETURNING id` and then returns `ok:true`, `status:'queued'`, and the local `i` variable. As no fallback SELECT occurs in the observed function body, a repeated enqueue can still return a null `intent_id` if the conflict path returns no row. This is a live-definition confirmation of the P2 response gap; no enqueue was called against hosted data.

### 14.4 Supabase advisor snapshot (read-only)

Security advisor categories observed at `2026-10-14T18:32:58.869Z` included:
- 4 `security_definer_view` findings (ERROR level) across asset-related views; these are not directly attributable to the AI runtime and need a separate asset-access review.
- 54 `function_search_path_mutable` findings (WARN level).
- 6 `anon_security_definer_function_executable` findings (WARN level) and 39 `authenticated_security_definer_function_executable` findings (WARN level); these require function-by-function intent review, not blanket revocation.
- 77 `rls_enabled_no_policy` findings (INFO level), across many tables; determine whether each table is intentionally deny-by-default before changing policies.
- AI-specific warnings included mutable search path on `touch_vendrith_ai_session` and `prune_vendrith_ai_messages`; the advisor also lists authenticated EXECUTE on SECURITY DEFINER functions `approve_vendrith_development_action_v1`, `finalize_vendrith_development_action_v1`, `retry_vendrith_runtime_intent_v1`, and the rate limiter. EXECUTE exposure is not automatically a vulnerability where the function is intentionally user-bound, but each function requires review of ownership, state transitions, and search path.

Performance advisor observations included 56 unindexed foreign keys, 30 auth-RLS initplan warnings, 222 unused indexes, 6 multiple-permissive-policy warnings, and 3 duplicate-index warnings. AI-specific items included unindexed foreign keys on `vendrith_ai_messages`, `vendrith_creator_action_proposals`, and `vendrith_runtime_intents`, and per-row auth function evaluation in AI-session/message/proposal/runtime-intent RLS policies. These are optimization/backlog items; do not mix them into the immediate security patch without tests.

### 14.5 Reconciliation matrix (observed, not guessed)

| Item | Repository state | Hosted evidence | Status |
|---|---|---|---|
| AI sessions/messages/proposals/runtime intents | Present in `database/migrations/` source family | Tables exist; related Oct-08 AI migrations appear in remote ledger | Objects deployed; exact source/version parity not proven |
| Runtime intent base migration | Local `20261009013000_vendrith_runtime_intents_v1.sql` | No matching ledger name/version found; runtime table and RPCs exist | Ledger/source drift; origin version unknown |
| Runtime persistence/reconciliation | Local migrations `...015200...` and `...015300...` | No matching ledger names found; some runtime persistence objects may exist under earlier versions, not fully compared | Unresolved; inspect exact function/table catalog before changes |
| Distributed AI rate limiter | Local `...030000...` migration | Private counter table and vulnerable function exist; no matching ledger name found | Function/table exist, ledger attribution unresolved; live P1 defect confirmed |
| Reconstructed Supabase baseline | Local `20261003170000...` | No exact ledger entry; hosted schema has 555-entry history | Do not apply/push this baseline as a normal pending migration |
| Save Slot RPC migrations | Local `20261011220000...` and `20261012200000...` | Save Slot table exists; exact corresponding migration names absent from ledger | RPC parity/deployment status unknown; do not assume local candidate migrations are deployed |

### 14.6 Priority and next gate

1. **P1 confirmed hosted issue:** caller-controlled `p_now` in the live rate-limit SECURITY DEFINER RPC. Prepare a reviewed fix that uses database time internally, removes or safely retires the caller-controlled signature, updates the TypeScript caller/tests, and adds SQL regression coverage. Do not apply it until the deployed signature/grants and migration ledger are reconciled and an approved migration path is chosen.
2. **P1 release gate:** migration history and live schema have drifted from current repository naming/source. Never run `supabase db push`, `db reset`, or migration-history repair now; the local reconstructed baseline could be treated as pending even though the live database already has a large historical schema.
3. **P1/P2 runtime contracts:** proposal approval-state protection, enqueue/claim/finish RLS behavior, runtime-intent persistence/reconciliation, and duplicate-enqueue response must be verified against live definitions/policies/grants. Do not use a SECURITY DEFINER change as a quick permission workaround.
4. **Next safe work:** produce an exact live-vs-local object/migration map for the affected AI RPCs and policies, then create a tested patch and reviewable migration plan. Until then, all hosted operations remain read-only.

**Change boundary:** Only this audit document was appended. All hosted checks were read-only. No hosted function was invoked for mutation, no SQL was applied, no row was written, no migration ledger was changed, and no deployment was performed. The existing `.gitignore` and `apps/map-editor/tsconfig.tsbuildinfo` worktree edits remain untouched. The audit remains uncommitted/unpushed.


### 14.7 Additional exact RPC presence checks

Read-only catalog checks confirm:

- `public.map_editor_save_game_slot_atomic_v1(...)`: not present in the connected hosted catalog.
- `public.map_editor_load_save_slot_validated_v1(uuid,smallint)`: not present in the connected hosted catalog. The local migration comments state these Save Slot migrations are candidate/CI-only; the live catalog confirms they are not deployed under these names.
- `public.reconcile_vendrith_runtime_intent_v1(uuid)` and `public.vendrith_runtime_intent_reconciliation_audit`: not present in the connected hosted catalog. The local reconciliation migration is not deployed under these exact object names.
- The world-runtime persistence RPC family (`acquire_world_runtime_lease_v1`, `renew_world_runtime_lease_v1`, `append_world_runtime_mutation_batch_v1`, `save_world_runtime_checkpoint_v1`, `read_latest_world_runtime_checkpoint_v1`, `read_world_runtime_mutations_v1`) is present.
- The live `approve_vendrith_creator_action_v1(uuid)` definition does not declare `SECURITY DEFINER`; it relies on invoker privileges/RLS for editor mutation. Exact hosted proposal column grants and UPDATE policy `WITH CHECK` were not obtained in this pass. The proposal-status issue remains a high-priority authorization verification item, not a reproduced hosted exploit.

These checks were read-only; no write-capable RPC was invoked and no authenticated-user impersonation was attempted.


## 15. Rate-limiter remediation draft (local review only; not a migration)

### 15.1 Current call contract

`apps/map-editor/ai/application/web-ai-security.ts` invokes `consume_vendrith_web_ai_rate_limit_v1` with exactly `{ p_user_id: userId }`; it does not send a timestamp. The hosted function's optional `p_now` parameter is therefore unnecessary for the app and creates a caller-controlled clock surface for direct RPC callers. The local migration defines the same two-argument/defaulted signature. Existing `tests/web-ai-security.test.ts` tests the result shape and error behavior but does not assert the RPC name/argument contract or test the SQL implementation.

### 15.2 Proposed SQL patch — review candidate only

**Do not save this as an active migration or run it against Supabase yet.** The canonical migration path and exact hosted dependency/grant parity still need reconciliation. This candidate intentionally has no `CASCADE`: if the old signature has database dependencies, the migration should stop for review instead of silently removing them.

```sql
-- Candidate only. Apply only after migration-ledger/dependency review.
-- Remove the callable overload that accepts a caller-controlled clock.
drop function if exists public.consume_vendrith_web_ai_rate_limit_v1(uuid, timestamptz);

create or replace function public.consume_vendrith_web_ai_rate_limit_v1(
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window timestamptz := date_trunc('minute', v_now);
  v_count integer;
  v_retry integer;
begin
  if auth.uid() is null
     or (auth.jwt()->>'is_anonymous') = 'true'
     or auth.uid() <> p_user_id then
    raise exception 'authentication required';
  end if;

  insert into private.vendrith_web_ai_rate_limits(user_id, window_started_at, request_count)
  values (p_user_id, v_window, 1)
  on conflict (user_id) do update
    set window_started_at = excluded.window_started_at,
        request_count = 1
    where private.vendrith_web_ai_rate_limits.window_started_at < excluded.window_started_at
  returning request_count into v_count;

  if v_count is not null then
    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(0, 20 - v_count),
      'retryAfterSeconds', 0
    );
  end if;

  select request_count into v_count
    from private.vendrith_web_ai_rate_limits
   where user_id = p_user_id
   for update;

  if v_count >= 20 then
    v_retry := greatest(1, ceil(extract(epoch from ((v_window + interval '1 minute') - v_now)))::integer);
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retryAfterSeconds', v_retry
    );
  end if;

  update private.vendrith_web_ai_rate_limits
     set request_count = request_count + 1
   where user_id = p_user_id
   returning request_count into v_count;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(0, 20 - v_count),
    'retryAfterSeconds', 0
  );
end;
$$;

revoke all on function public.consume_vendrith_web_ai_rate_limit_v1(uuid) from public, anon;
grant execute on function public.consume_vendrith_web_ai_rate_limit_v1(uuid) to authenticated;
```

**Patch rationale:** the timestamp is captured once from `clock_timestamp()` inside the function and reused for both the minute bucket and retry calculation. The existing authentication/anonymous checks, fixed empty `search_path`, private counter table, 20-request limit, response JSON contract, and user binding are preserved. The two-argument overload is removed without `CASCADE`, and the replacement grants execution only to `authenticated` (plus PostgreSQL's function-owner behavior). The current TypeScript caller already passes only `p_user_id`, so no caller signature change appears necessary; still add a contract test so a future change cannot accidentally reintroduce `p_now`.

### 15.3 Regression coverage required before any deployment

**TypeScript/Vitest contract test** in `apps/map-editor/tests/web-ai-security.test.ts`:

- Capture `functionName` and `args` in the RPC mock.
- Assert the function name is exactly `consume_vendrith_web_ai_rate_limit_v1` and args equal `{ p_user_id: 'user-budget' }` (no `p_now`).
- Keep existing allowed/blocked/invalid-response/RPC-error tests.

**Disposable PostgreSQL integration tests** using the repository's existing authenticated-role/JWT fixture pattern (do not run these against the hosted project):

1. Catalog: only the `(uuid)` overload exists; `(uuid,timestamptz)` is absent. The migration must fail rather than cascade if dependencies prevent dropping the old overload.
2. Grants: `authenticated` can execute the new `(uuid)` function; `anon` and `PUBLIC` cannot. The private counter table remains inaccessible directly to `anon`/`authenticated`.
3. Identity: missing `auth.uid()`, anonymous JWT, and `auth.uid() <> p_user_id` are rejected; a matching authenticated user is accepted.
4. Budget: the first 20 calls in a single minute are allowed with remaining counts descending to zero; the 21st is denied with `remaining = 0` and a positive retry value. Check the counter row has not exceeded 20.
5. Clock injection: a two-argument call with a far-future timestamp fails because no matching overload exists. After a valid call, inspect the counter row and assert `window_started_at` is in the database's current minute, not a supplied future minute.
6. Window rollover: after advancing the database/test clock in a controlled disposable test (or testing the bucket calculation separately), a new minute resets the count exactly once.
7. Concurrency: concurrent requests for the same user do not exceed 20 allowed requests per bucket and do not lose increments. If this fails, fix locking/atomicity in the same candidate before release.
8. Retry calculation: denial reports a value from 1 to 60 seconds consistent with the database-time minute boundary.

### 15.4 Migration/release gate

- First reconcile the hosted old function's dependencies, ownership, ACLs, and exact source with repository migration history. The observed 555-entry ledger and local `database/migrations/` versus `supabase/migrations/` split mean this SQL is **not yet assigned a safe migration filename/path**.
- Apply the candidate to a disposable PostgreSQL 17 fixture, run the SQL regression suite and relevant TypeScript tests, then review the generated migration diff.
- Only after explicit migration-path approval should a new canonical migration be added under the correct migration stream. Do not run `supabase db push`, alter migration history, or invoke the hosted rate-limit RPC as part of testing.

**Status at the time this draft was written:** it was a design draft only; no source/test/migration file had yet been changed. The follow-up contract test and disposable PostgreSQL verification are recorded in section 16. No hosted database operation was performed; no package was installed; no commit or push was made.


## 16. Rate-limiter follow-up verification and proposal-policy confirmation (pass 7)

### 16.1 TypeScript contract test

Added one focused regression test to `apps/map-editor/tests/web-ai-security.test.ts`. It captures the RPC call and asserts the exact contract:

- RPC name: `consume_vendrith_web_ai_rate_limit_v1`
- Arguments: `{ p_user_id: "user-budget" }`
- No caller-supplied `p_now` field.

Verification results:

- `npm test -- --run tests/web-ai-security.test.ts`: **6/6 tests passed** (one new test; prior tests retained).
- `npm run typecheck`: **passed** (`tsc --noEmit`, exit code 0).

### 16.2 Disposable PostgreSQL 17 candidate test

Started a temporary local Docker container using `postgres:17`, with a minimal isolated `auth.uid()` / `auth.jwt()` fixture and private counter table. Applied a test-only stand-in for the old timestamp overload, then applied the candidate function patch from section 15. The test container and temporary SQL files were removed after successful verification. This did not connect to the hosted project.

Assertions passed for:

- old `(uuid,timestamptz)` overload absent and new `(uuid)` overload present;
- `authenticated` has EXECUTE, `anon` does not, and the new function has no PUBLIC EXECUTE grant;
- `authenticated` cannot directly SELECT the private counter table;
- matching non-anonymous user can call the function;
- mismatched user ID and anonymous JWT are rejected;
- the first 20 calls are allowed with the expected decreasing `remaining` values, and call 21 is denied with `remaining=0` and a positive retry value;
- persisted `window_started_at` is in the database's current minute;
- dynamic invocation with an arbitrary timestamp cannot resolve to an overload.

**Limit of this test:** it is a focused functional/ACL contract test, not a concurrency stress test, and it does not simulate minute rollover. Those remain required before release. The fixture also does not prove hosted grants or dependencies are identical to the candidate.

### 16.3 Exact hosted proposal status policy

Read-only hosted catalog inspection now confirms the following for `public.vendrith_creator_action_proposals`:

- `authenticated` has table-level `UPDATE` privilege.
- The `vendrith_creator_proposals_update_own` RLS policy allows updates to any column on a user's own proposal when the JWT is non-anonymous; its `USING` and `WITH CHECK` expressions constrain ownership, not allowed state transitions.
- The live `status` check constraint accepts `pending`, `approved`, `rejected`, and `failed`.

This combination means a user with a valid authenticated session can potentially set their own proposal status to `approved` directly, bypassing the intended RPC transition, subject to any other database trigger/constraint not yet inspected. This is a **confirmed hosted policy design gap**, not a claim that a live exploit was executed. No such update was attempted. It must be fixed together with runtime-intent enqueue authorization so a client cannot forge approval and then queue work. Do not simply revoke all table updates without verifying the app's legitimate proposal operations.

### 16.4 Remaining gates

1. **Rate limiter:** SQL candidate passed the focused disposable contract test. Before production use, complete concurrency/rollover tests and inspect dependencies/ACL expectations; the connected hosted function's exact dependencies are not yet fully reconciled with repository migration history. Do not apply or drop the live function yet.
2. **Proposal/runtime boundary:** design a single controlled state transition that prevents direct client writes to approval status, binds approval to the correct proposal/user/context, and makes enqueue idempotent/atomic or safely recoverable. Verify the live enqueue/claim/finish RLS path in an isolated fixture before changing hosted grants or function security mode.
3. **Migration path:** do not run `supabase db push`, rewrite the remote migration ledger, or deploy either fix until the canonical migration stream and existing hosted versions are reconciled.

**Change boundary for this pass:** changed only `apps/map-editor/tests/web-ai-security.test.ts` by adding the RPC contract regression test and appended this audit section. The temporary PostgreSQL container and `/tmp` test scripts were removed. No active migration was created, no production data/function/policy was modified, no package was installed, and no commit/push was performed. Pre-existing `.gitignore` and `apps/map-editor/tsconfig.tsbuildinfo` changes were preserved.


## 17. Hosted proposal approval and runtime RPC contract map (pass 8)

Read-only function-definition/ACL inspection of the connected hosted project returned these exact runtime contracts:

| Function | Hosted execution mode | Observed behavior / release concern |
|---|---|---|
| `approve_vendrith_creator_action_v1(uuid)` | Invoker (`SECURITY DEFINER = false`); `search_path = public, pg_temp` | Checks authenticated non-anonymous user, owns proposal/session, and pending status; applies `editor_mutation_gateway_v1`, then writes `approved` or `failed`. Depends on caller's table privileges/RLS. |
| `enqueue_vendrith_runtime_intent_v1(uuid)` | Invoker; `search_path = public, pg_temp` | Checks owner and `status='approved'`, inserts intent with `ON CONFLICT(proposal_id) DO NOTHING`, but returns the local ID variable even when conflict leaves it null. |
| `claim_vendrith_runtime_intent_v1(uuid)` | Invoker; `search_path = public, pg_temp` | Updates a user's `queued` intent to `processing`; relies on table UPDATE privilege plus RLS. |
| `finish_vendrith_runtime_intent_v1(uuid,text,jsonb)` | Invoker; `search_path = public, pg_temp` | Updates a user's `processing` intent to a limited final status; relies on table UPDATE privilege plus RLS. |

The hosted `vendrith_runtime_intents` RLS policy inventory in this pass showed only `SELECT` for an authenticated user's own rows. Table-level privileges include `SELECT`, `INSERT`, and `UPDATE` for `authenticated`, but the absence of INSERT/UPDATE RLS policies means those writes are not authorized by RLS under the inspected policy set. This is a strong indicator that the current invoker-mode enqueue/claim/finish write paths may fail for normal authenticated callers; no hosted write RPC was called to reproduce the behavior.

### Required fix architecture (design only)

- Do not simply remove `UPDATE` from `vendrith_creator_action_proposals`: the current invoker-mode approval RPC itself needs to update the proposal. The legitimate approval transition and direct client write surface must be redesigned together.
- Prefer a narrowly scoped, transactionally consistent approval boundary that explicitly checks `auth.uid()`, non-anonymous identity, proposal ownership, session/context/map ownership, `pending` state, action shape, and all editor mutation authorization before it changes the proposal state. Any move to `SECURITY DEFINER` requires a full manual authorization review, a safe fixed `search_path`, least-privilege grants, and tests; it is not a shortcut for RLS errors.
- Couple successful editor mutation, proposal state transition, and runtime-intent enqueue in one transaction or a durable outbox with a deterministic idempotency key and repair path. The current API route performs approval and enqueue as separate RPCs, leaving a partial-failure window.
- Make enqueue idempotency observable: on a duplicate proposal ID, return the existing intent ID/status instead of `ok:true` with a null ID.
- Give runtime intents an explicit authorization contract for insert/claim/finish. Test allowed owner transitions, cross-user rejection, duplicate enqueue, retries, concurrent claims, and failure/recovery in a disposable PostgreSQL fixture before selecting invoker/definer privileges.

### Pass 8 boundary

This was read-only hosted catalog inspection plus a design note. No hosted RPC was called for mutation, no table/policy/function was altered, and no deployment or migration-ledger operation occurred. No additional source files were changed during pass 8. The test-only change and audit status remain as recorded in pass 7.


## 18. Proposal-state privilege design and disposable reproduction (pass 9)

### 18.1 Hosted approval mutation path: additional security implication

The hosted `editor_mutation_gateway_v1` overload called by `approve_vendrith_creator_action_v1` is also `SECURITY INVOKER`, with `search_path = public, pg_temp`. It dispatches to lower-level editor mutation functions. The approval RPC itself currently runs as invoker and relies on the caller's RLS/privileges for reading and updating the proposal. Therefore, changing its execution mode or table grants in isolation can either break approval or expand privileges around editor mutations. A definer-based redesign must explicitly preserve all downstream identity, map-access, object-access, and operation-level checks; the wrapper's existing proposal/session checks alone are not enough to assume that all downstream checks remain equivalent under a changed `current_user`.

### 18.2 Disposable PostgreSQL 17 reproduction

Created a temporary PostgreSQL 17 Docker database with a minimal proposal table, `auth.uid()`/`auth.jwt()` fixture, and the same broad owner-only SELECT/INSERT/UPDATE policy shape. In that isolated fixture:

1. Authenticated user A could update their own `pending` proposal to `approved` under the baseline policy and table-level UPDATE grant. This reproduced the policy design gap locally.
2. A candidate privilege boundary revoked table-level `INSERT` and `UPDATE`, then granted INSERT only on proposal-content columns (`user_id`, `session_id`, `context_type`, `context_id`, `map_id`, `operation`, `action`, `rationale`). Direct UPDATE of `status` and INSERT specifying `status='approved'` both failed with insufficient privilege.
3. The test completed with `PASS: baseline self-approval reproduced; column-grant boundary blocks direct status mutation`. The temporary container and SQL files were removed.

This validates the PostgreSQL column-privilege concept in a minimal fixture. It is **not a deployable patch**: the current approval RPC is invoker-mode and needs to update `status`, `approval_id`, `approved_at`, and `result`, so those operations would fail after removing direct client UPDATE unless a reviewed, narrow approval boundary is implemented. Existing app proposal insertion appears compatible with the proposed INSERT column list because it omits the server-owned state/result columns. Verify every caller before adopting this grant shape.

### 18.3 Recommended architecture for the next draft

- Restrict direct client INSERT to proposal input columns only; do not allow client-supplied `status`, `approval_id`, `approved_at`, or `result`.
- Remove direct client UPDATE privileges on proposals. Proposal status must change only through the approved server-side transition.
- Design a dedicated, narrow approval transition in a non-exposed/private schema where practical. It must authenticate a non-anonymous user, lock and validate a pending proposal, verify the session/context/map and exact action shape, and re-check the authorization required by the underlying editor mutation leaves. If a privileged wrapper is necessary, pin `search_path`, fully qualify object names, grant EXECUTE narrowly, and test cross-user/map/object attacks. Do not merely flip the existing function to `SECURITY DEFINER`.
- Prefer one database transaction for editor mutation + proposal status + runtime intent/outbox insertion. If a single transaction is not feasible, use a durable outbox/idempotency design and explicit repair status so a successful editor mutation cannot silently lose its runtime intent.
- For runtime intents, grant no direct client table writes. Provide narrowly scoped owner-checked RPCs or a service-side consumer path with an explicit trusted identity contract. Define queued → processing → final-state transitions, concurrent claim behavior, retries, and duplicate enqueue return semantics before choosing invoker/definer mode.

### 18.4 Pass 9 boundary

Only this audit document was updated during pass 9. The isolated fixture showed the baseline weakness and a possible column-privilege boundary; no application source, active migration, hosted table, policy, function, or data was changed. No package was installed, and no commit/push occurred. Existing unrelated worktree edits remain preserved.


## 19. Proposal/runtime authorization contract fixture (pass 10)

### 19.1 Corrected migration path discovery

The earlier read used two nonexistent paths because the runtime persistence/reconciliation migration filenames include an extra sequence component. The actual local files are:

- `database/migrations/20261009015200_vendrith_runtime_persistence_v1.sql`
- `database/migrations/20261009015300_vendrith_runtime_intent_reconciliation_v1.sql`

The repository's creator proposal and runtime intent migrations were read directly, not inferred from the hosted catalog. The proposal migration grants authenticated table-level `SELECT, INSERT, UPDATE` and uses an owner-only UPDATE policy. The runtime-intent migration grants authenticated `SELECT` only and defines only a SELECT RLS policy, while enqueue/claim/finish are invoker-mode functions that write the table. The retry/reconciliation functions use SECURITY DEFINER and must be reviewed separately for least privilege and their full downstream authorization contract.

### 19.2 Disposable PostgreSQL 17 fixture result

A temporary, isolated PostgreSQL 17 Docker database was created and removed after the test. It contained a minimal proposal table, RLS, authenticated identity fixture, a simulated editor-mutation journal, runtime intents, and a **test-only** approval/enqueue wrapper. No application SQL or hosted object was changed.

**Result: PASS** for these fixture assertions:

1. A normal authenticated user could insert a pending proposal using only the explicitly granted input columns.
2. Direct client UPDATE of `status` to `approved` failed.
3. Direct INSERT with a caller-supplied `status='approved'` failed.
4. The controlled wrapper checked identity, proposal ownership, map ownership, and pending state; it created the simulated mutation record, changed proposal state, and inserted the runtime intent in one transaction.
5. Repeating the same approval call returned the same intent ID and did not create a second mutation record or intent.
6. A different authenticated user could not approve or read the first user's proposal through the wrapper.

The temporary fixture and SQL scripts were removed by the test process. No hosted RPC was called and no live database was mutated.

### 19.3 What this test does—and does not—prove

This proves a viable **privilege-boundary pattern** in a minimal PostgreSQL fixture, not that the production implementation is already safe. The test wrapper intentionally used a simulated mutation journal; it did not call the actual `editor_mutation_gateway_v1` or its lower-level editor functions. It therefore does not authorize changing the real approval function to SECURITY DEFINER. Before implementation, inspect every downstream function for identity checks, map/object ownership, RLS assumptions, search paths, and operation allowlists under the wrapper's effective database role.

The fixture also did not stress concurrent approvals/claims, test rollback after a deliberately failing editor mutation, or verify live grants. Those remain mandatory before a production migration is considered.

### 19.4 Updated implementation direction

- Keep proposal client INSERT restricted to input columns; status/result/approval metadata remain server-owned.
- Remove direct client UPDATE only when the controlled server transition is ready in the same reviewed migration, so approval does not break mid-change.
- Prefer one transaction for the actual editor mutation, proposal transition, and intent/outbox creation. The API currently makes approval and enqueue separate RPC calls, so the present application flow has a partial-failure window.
- Make retry behavior explicit: if the proposal is already approved and its intent exists, return that existing intent ID/status; if approved but the intent is missing, report a repairable invariant violation rather than silently returning a null ID.
- Give runtime intents no direct client write permissions. Use a narrowly scoped, fully reviewed server-side transaction boundary or a trusted service consumer with explicit identity and ownership checks. Do not solve RLS failures by blindly changing invoker functions to SECURITY DEFINER.
- Before release, add tests for transaction rollback, duplicate enqueue, concurrent approvals, concurrent claims, cross-user and cross-map access, retry transitions, and failure/reconciliation. Then reconcile the canonical migration stream and hosted dependencies/ACLs.

### 19.5 Pass 10 boundary

Only this audit document was appended in pass 10. The temporary PostgreSQL 17 fixture passed and its container/scripts were removed. No application source, active migration, hosted schema/policy/function/data, migration ledger, or package was changed. No commit or push was made. Existing worktree changes were preserved.


## 20. Editor gateway and transaction boundary review (pass 11)

### 20.1 Source examined

Read-only hosted catalog inspection of project `ojtmfokjcirvjvhnbnos` returned the definitions and ACLs for the creator approval RPC, both `editor_mutation_gateway_v1` overloads, key editor leaf functions, and runtime-intent functions. The matching repository source on branch `feat/vendrith-ecc-v1` was also inspected. No hosted function was invoked for mutation and no database object or row was changed.

### 20.2 Confirmed findings

1. `approve_vendrith_creator_action_v1(uuid)` is SECURITY INVOKER (not SECURITY DEFINER), has `search_path=public, pg_temp`, and EXECUTE for authenticated but not anon. It checks authenticated non-anonymous identity, proposal ownership and pending state, ties the proposal to the user's session/context, restricts this flow to playable context, and checks map visibility through the caller's RLS.
2. Both hosted `editor_mutation_gateway_v1` overloads are SECURITY INVOKER and executable by authenticated users, not anon. One overload supports the creator-approval operation set (`create/move/rotate/scale/delete`); the other also exposes editor operations such as duplicate, paste, and selection transforms. The approval RPC calls the 13-argument overload with its restricted operation value. This is not by itself an authorization bypass: the exposed gateway runs as the caller and the underlying map-object RLS policies restrict writes to maps owned by `auth.uid()`. Still, duplicate public overloads complicate review and should be documented or consolidated only after a call-site inventory.
3. Hosted `map_objects` RLS policies enforce map ownership for SELECT, INSERT, UPDATE and DELETE. The editor gateway and geometry pipeline functions inspected are invoker-mode, so their ordinary table access remains subject to the caller's privileges and RLS. Do not convert these functions to SECURITY DEFINER merely to make them work.
4. Proposal table privileges/policies previously inspected still permit authenticated owners to UPDATE their own proposal rows, including server-owned state columns. This means a user can self-transition a pending proposal to `approved` unless a separately verified trigger or column boundary prevents it. The safe fixture pattern from pass 10 blocks direct state writes, but is not yet integrated into the production transition function.
5. Runtime intent creation/claim/finish remains a separate RPC chain after approval. The local and hosted contract previously inspected has only the owner SELECT policy and client SELECT grant on `vendrith_runtime_intents`, while the invoker-mode enqueue/claim/finish functions write the table. The disposable PostgreSQL reproduction returned SQLSTATE 42501 for enqueue, claim and finish under that policy shape. This is a strong contract mismatch and a likely functional blocker for the current user-authenticated RPC flow; it was not re-triggered against production.
6. Approval and enqueue are separate API calls/transactions. Even after the runtime RLS/grant mismatch is corrected, an enqueue failure can leave the proposal approved without an intent. The existing duplicate enqueue implementation also returns `ok:true` with a null `intent_id` after `ON CONFLICT DO NOTHING` because it only returns the ID from the INSERT, rather than selecting the existing intent.

### 20.3 Transaction and authorization conclusions

- Keep approval and editor mutation SECURITY INVOKER unless a complete least-privilege design demonstrates why elevated execution is required. RLS is an important part of the current editor ownership boundary.
- Treat the current direct proposal UPDATE grant as a P1 state-integrity gap; prepare a coordinated change that first supplies a narrow server-owned status transition, then removes client UPDATE. Do not revoke UPDATE in isolation while the existing invoker approval function still needs to update status/approval metadata.
- Preferred target: a single reviewed transaction boundary that verifies owner/session/context, invokes the authorized editor mutation, transitions proposal state, and creates exactly one runtime intent/outbox row. If architectural constraints require separate processing, introduce explicit durable repair/reconciliation semantics and make retries return the existing intent ID.
- Before migration, test with two real roles and RLS enabled: cross-user/cross-map operations, direct gateway calls, direct proposal status mutation, runtime insert/update RPC behavior, rollback when the editor mutation raises an exception, a gateway function that returns a failure result, duplicate enqueue, and concurrent approval/claim attempts.
- Review the two gateway overloads and every called leaf/validation function, including whether a JSON failure return can occur after any write. PostgreSQL automatically rolls back an exception that escapes a function statement; a returned `{ok:false}` is not itself a rollback signal.

### 20.4 Pass 11 boundary

This pass used read-only hosted catalog/ACL queries and source inspection only. No hosted mutation RPC, DDL, migration application, data write, commit, or push was performed. The Desktop Commander device stopped responding during the pass, so this section must be confirmed as appended to the local audit file after connectivity recovers; do not infer successful local persistence from this note alone.


## 21. Pass 11 transaction and concurrency fixture results

The workspace connection recovered. The pass 11 review in §20 is present in this file. Two isolated PostgreSQL 17 Docker fixtures were run and removed; temporary SQL and output files were deleted by their cleanup traps.

### 21.1 Exception rollback versus returned failure

**PASS — escaping exception rolls back the function statement.** A fixture approval function wrote a journal row, paused, and raised an exception. After catching the failed statement in the test harness, the journal row was absent and the proposal remained `pending`.

**PASS — a returned `{ok:false}` is not an automatic rollback.** A second fixture function wrote a journal row and returned a JSON failure result instead of raising. The journal row persisted and the proposal transitioned to `failed`. This is expected PostgreSQL behavior and illustrates why every editor gateway failure contract must state whether it can return failure after making any write. The test uses a simulated gateway; it does not assert that the real editor gateway has this behavior.

### 21.2 Duplicate enqueue

**PASS — reproduced existing duplicate-ID bug in fixture.** The first enqueue returned an intent ID. The second call hit `ON CONFLICT(proposal_id) DO NOTHING` and returned `ok:true` with `intent_id:null`. The database still contained exactly one intent. The production source has the same insert/return-only shape, so the fix should select and return the existing owner-matched intent when the insert conflicts, and should validate the intent belongs to the same proposal/user.

### 21.3 Concurrent approval and runtime claim

**PASS — concurrent approval serialized in fixture.** Two independent authenticated sessions attempted to approve the same pending proposal at the same time. Exactly one returned `ok:true`; the other returned `PROPOSAL_NOT_PENDING`. Exactly one journal row and one intent were created.

**PASS — concurrent claim serialized in fixture.** Two independent authenticated sessions attempted to claim the same queued intent at the same time. Exactly one returned `ok:true`; the other returned `NOT_CLAIMABLE`. The intent ended in `processing`.

These results confirm the locking / conditional-update pattern for the fixture implementation. They do not certify all production transitions, lease expiration, retries, or crash recovery.

### 21.4 Audit status and implementation gate

The transaction/concurrency portion of pass 11 is now complete in a disposable PostgreSQL fixture. The audit document is confirmed updated locally. `git diff --check` and final worktree/temporary-resource checks are still required after this append.

**No production mutation was performed.** No hosted RPC was invoked for mutation; no DDL, policy, grants, rows, migration ledger, package installation, commit, or push was changed. The current working-tree edits remain preserved.

Before creating an active migration, the next implementation review must design a single, least-privilege server transaction/outbox boundary and include regression tests for: direct client state manipulation; owner/session/context checks; editor exceptions and JSON failures; duplicate enqueue returning the stable intent ID; two concurrent approvals; two concurrent claims; cross-user and cross-map access; retry/reconciliation; and the live runtime-intent grant/RLS mismatch. Reconcile the canonical migration stream and hosted dependencies before applying any migration.


## 22. Pass 12 — transaction remediation design draft

Created `docs/audits/VENDRITH_AI_TRANSACTION_REMEDIATION_DESIGN_PASS12_2026-10-15.md` as a design-only artifact. It records the target atomic approval/intent contract, proposal state boundary, runtime-intent retry behavior, gateway failure contract, required role/RLS regression tests, and migration-stream reconciliation gate.

The design intentionally does not select a privileged-function or trigger-based state-transition implementation before the complete editor gateway call graph and effective-role behavior are reviewed. It also does not authorize migration-history repair or any production schema change. Local `database/migrations`, local `supabase/migrations`, and the hosted migration ledger must first be reconciled side by side.

Validation: `git diff --check` passed. Existing worktree changes were preserved. Disposable pass 11 containers and temporary test files were removed. No production RPC mutation, DDL, data write, active migration, package install, commit, push, or deployment occurred.


## 23. Pass 13 — read-only migration/gateway inventory

Created `docs/audits/VENDRITH_AI_MIGRATION_GATEWAY_INVENTORY_PASS13_2026-10-15.md` (103 lines). It records the local migration inventory (23 files under `database/migrations`, 3 under `supabase/migrations`) against the 555-entry hosted ledger, whose latest entry is `20261008211645 vendrith_phase4_final_audit_hardening_v1`. Local Oct 9 AI migration versions and Oct 11/12 save-slot migrations do not match exact hosted version/name entries; schema-equivalence must be reconciled object-by-object before migration work.

Read-only live catalog review confirmed:
- Both `editor_mutation_gateway_v1` overloads are SECURITY INVOKER and executable by authenticated; the 22-argument overload exposes broader selection/duplicate/paste operations beyond the 13-argument approval path.
- `editor_batch_selection_duplicate_leaf_v2` can insert duplicates in a loop and return JSON `ok:false` after a later item fails, without raising. Earlier inserts are not automatically rolled back. This is a concrete failure-after-write path.
- The proposal and runtime-intent tables have broad live ACLs, including TRUNCATE and other privileges beyond the intended proposal migration. The live default-privilege catalog and reconstructed baseline both show broad default grants for public-schema tables to anon/authenticated and other roles.
- Proposal owner UPDATE policy allows client writes to server-owned state fields; runtime-intent has only owner SELECT policy while invoker-mode enqueue/claim/finish need writes; retry is SECURITY DEFINER and needs separate verification.
- Approval and enqueue are separate RPC statements; duplicate enqueue can return `ok:true` with a null intent ID on conflict.
- `editor_delete_object_leaf_v1` ignores the JSON result of `remove_map_object_footprint`; paste still needs complete write-path verification.

No production mutation, DDL, migration application, migration-ledger repair, package installation, commit, push, or deployment occurred. `git diff --check` was clean at the read-only inventory checkpoint. Foundation 11-table schema decisions remain untouched.


## 24. Pass 14 — migration reconciliation matrix and editor-leaf review

Created `docs/audits/VENDRITH_AI_MIGRATION_RECONCILIATION_MATRIX_PASS14_2026-10-15.md` (68 lines). The matrix maps all 26 local SQL files to exact hosted ledger names where present, likely equivalent migration families, reconstructed baseline, or uncertain/local candidate status. It explicitly does not infer “not applied” from a missing exact filename, and it does not authorize version renaming or migration-ledger insertion.

Key results:
- Most AI migration names appear in the hosted ledger under earlier 2026-10-08 versions, whereas local timestamped files use 2026-10-09 versions. The runtime-intent base, runtime persistence, reconciliation, and distributed rate-limit migrations need object-by-object mapping.
- The two local Save/Load candidate function names were absent from live function lookup, supporting continued non-application pending review.
- Live `editor_batch_selection_duplicate_leaf_v2` confirms a partial-write risk: it may return failure JSON after earlier duplicates were inserted.
- Live `editor_batch_selection_transform_leaf_v2` raises inside the write loop and catches the exception outside, giving a stronger rollback shape; disposable regression tests remain required.
- `editor_delete_object_leaf_v1` ignores JSON failure from `remove_map_object_footprint`, which itself may return failure after a navigation refresh issue. Delete should not continue silently on that contract.
- Paste performs preflight checks, but the complete write/finalization path remains open for line-by-line review.

No production mutation, DDL, migration application, migration-ledger repair, package installation, commit, push, or deployment occurred. The Foundation 11-table specification and ERD remain unchanged.

## 25. Pass 15 — editor leaf atomicity review and disposable fixture

Created `docs/audits/VENDRITH_AI_EDITOR_LEAF_ATOMICITY_PASS15_2026-10-15.md`. Read-only live definitions confirmed that selection duplicate can return failure JSON after earlier inserts, delete ignores the JSON result from footprint removal, and paste ignores return values from OBB/footprint synchronization helpers. The transform leaf has a stronger exception-and-rollback shape, but actual-function integration regression remains required.

A new disposable PostgreSQL 17 fixture passed three control-flow checks: (1) a later duplicate failure returned JSON while the first insert remained; (2) an exception in a transform-style protected block rolled back both writes; (3) a delete-style caller ignored a helper's `ok:false` JSON and proceeded. The fixture was minimal and does not substitute for tests against the complete production function graph. The temporary container and SQL file were removed; the two older stopped containers were left untouched.

**Next gate:** add disposable integration tests using the actual SQL function definitions and representative roles/RLS, with injected failure on the second duplicate, footprint/navigation refresh, paste synchronization, and command-group finalization. Confirm object, geometry, navigation and command-journal writes roll back together. Then complete migration-stream reconciliation and the AI roadmap before creating any active migration or installing candidate packages.

No hosted mutation, DDL, migration application, ledger repair, package installation, deployment, commit, or push occurred. Foundation 11-table specification and ERD remain unchanged.

## 26. Pass 16 — paste failure contract follow-up

Created `docs/audits/VENDRITH_AI_EDITOR_LEAF_ATOMICITY_PASS16_2026-10-15.md`. Further source review found `editor_paste_leaf_v2` also fails to validate the JSON result from `begin_map_editor_command_group`, ignores OBB/footprint sync results, and ignores command-group update/close results. The reconstructed local helper `sync_map_object_footprint` can return `ok:false` when a navigation refresh helper reports failure, so a paste call may proceed after a partial navigation projection and still return `ok:true`.

A disposable PostgreSQL 17 fixture passed a minimal reproduction: group creation returned failure JSON and footprint sync returned failure JSON, yet the caller-style function inserted an object and partial geometry record and returned `ok:true` with a null group ID. The fixture was removed after testing. It models the actual caller control flow but is not a full import of the production schema or function graph.

**Gate remains open:** before any migration, add actual-function integration tests with injected failures at paste item 2, OBB/footprint/navigation sync, command-group update/close, duplicate item 2, and delete footprint refresh. Require exception-driven rollback and verify object, geometry, navigation, and command-journal state together. Migration stream reconciliation is still required. No production mutation, migration, dependency install, deployment, commit, or push occurred; Foundation 11-table specification and ERD remain unchanged.


## 27. Pass 17 — reconstructed paste/helper source-level integration check

Created `docs/audits/VENDRITH_AI_EDITOR_LEAF_ATOMICITY_PASS17_2026-10-15.md`. Extracted the full local reconstructed SQL bodies for `editor_paste_leaf_v2`, `sync_map_object_obb_v1`, `sync_map_object_footprint`, `begin_map_editor_command_group`, and `close_map_editor_command_group`, and ran those bodies in a new disposable PostgreSQL 17 fixture with minimal table stubs and an injected navigation-refresh failure.

**PASS — reproduced the unchecked failure contract using the extracted function bodies.** With a map owned by a different user, the actual reconstructed command-group function returned failure JSON and no group ID. Paste ignored that result; the actual OBB helper wrote geometry; the actual footprint helper propagated injected navigation-refresh failure JSON; paste ignored that too and returned `ok:true`, `group_id:null`, and `objects_created:1`. Assertions confirmed one object and one geometry row persisted and no command-group row existed. The disposable container and SQL were cleaned up; older stopped containers were untouched.

**Evidence limit:** this is an integration check of the exact function bodies in the reconstructed local baseline, using minimal stubs. It is not a full import of the schema and does not prove those exact definitions are currently deployed. The next gate is to reconcile source against hosted definitions and test the duplicate/delete leaves with their actual helper bodies, then complete migration-stream reconciliation and the AI roadmap.

No hosted mutation, production DDL/data change, migration application, migration-ledger repair, package installation, deployment, commit, or push occurred. Foundation 11-table specification and ERD remain unchanged.


## 28. Pass 18 — duplicate/delete leaf source-level integration check

Created `docs/audits/VENDRITH_AI_EDITOR_LEAF_ATOMICITY_PASS18_2026-10-15.md`. Executed the reconstructed local function bodies for `editor_batch_selection_duplicate_leaf_v2`, `editor_duplicate_legacy_bridge_v1`, `editor_delete_object_leaf_v1`, and `remove_map_object_footprint` in a disposable PostgreSQL 17 fixture, with controlled test doubles for the gateway and navigation-refresh dependency.

**PASS — duplicate item 2 failure leaves earlier write.** The first gateway call duplicated one object; the second returned injected failure JSON. The actual duplicate leaf returned `ok:false` with `created_before_failure:1`, but the first duplicate remained (3 objects including the two originals).

**PASS — delete ignores footprint refresh failure.** The actual footprint helper received injected navigation-refresh failure JSON. The actual delete leaf ignored it, removed the object and geometry row, and returned `ok:true`. The fixture did not model the complete navigation projection schema, so this confirms unchecked-result control flow rather than all resulting hosted side effects.

The disposable container and SQL were cleaned; pre-existing stopped containers were not touched. No hosted mutation, production DDL/data change, migration application, ledger repair, package installation, deployment, commit, or push occurred. The next gates are canonical migration-stream/hosted-definition reconciliation and AI roadmap finalization. Foundation 11-table specification and ERD remain unchanged.


## 29. Pass 19 — hosted function source and migration-ledger reconciliation

Created `docs/audits/VENDRITH_AI_HOSTED_SQL_RECONCILIATION_PASS19_2026-10-15.md`. Read-only hosted catalog checks confirmed the inspected editor functions are SECURITY INVOKER and verified that the known atomicity issues exist in live function definitions: paste ignores command-group/geometry-helper JSON failures, selection duplicate can return failure JSON after earlier writes, and delete ignores footprint-removal failure JSON. The 13-argument mutation gateway has a second unchecked delete path.

Normalized `pg_proc.prosrc` source hashes and lengths match the reconstructed local baseline for nine inspected definitions. Two definitions remain unresolved by hash: the 13-argument `editor_mutation_gateway_v1` and `sync_map_object_obb_v1`; neither should be declared reconciled until a literal diff is completed.

Hosted migration ledger: 555 entries, first version `20260815041801`, latest `20261008211645`. Editor gateway sequence is recorded around `20260831130103`–`20260831133321`; hosted Vendrith AI session/proposal sequence appears at `20261008174537`–`20261008184816`. Local timestamped AI files on Oct 9 do not share the same version identifiers as the hosted Oct 8 entries, and several local runtime-intent/reconciliation/rate-limit migrations lack exact-name ledger entries. The two Save/Load migrations dated Oct 11 and Oct 12 also lack exact ledger entries and remain unapplied candidates pending full object/privilege/order reconciliation.

No production mutation, DDL, migration application, ledger repair, package installation, deployment, commit, or push occurred. Foundation 11-table specification and ERD remain unchanged. Next: literal diff the two unresolved definitions, then reconcile uncertain AI migrations and Save/Load contracts before finalizing the AI roadmap.


## 30. Pass 19 hash-normalization correction

A follow-up comparison confirmed that the two initially differing function hashes (`editor_mutation_gateway_v1` with 13 arguments and `sync_map_object_obb_v1`) differed only because the hosted `prosrc` representation retained a leading whitespace character. When the same leading character is included in the local normalized body, the normalized hashes match. Therefore **all 11 inspected hosted function definitions/signatures match the reconstructed local baseline after whitespace normalization**. The earlier statement in §29 that those two definitions remained unreconciled is superseded by this correction; no semantic mismatch was identified.

The migration-ledger caveats in §29 still apply: local timestamped AI migrations and Save/Load migrations require object-level reconciliation before any application or ledger repair. No production mutation occurred.


## 31. Pass 20 — AI runtime migration object reconciliation

Created `docs/audits/VENDRITH_AI_RUNTIME_MIGRATION_OBJECT_RECONCILIATION_PASS20_2026-10-15.md`. Read-only catalog checks show:
- `vendrith_runtime_intents` and `enqueue_vendrith_runtime_intent_v1` exist; hosted function source hash exactly matches the local runtime-intent migration body.
- The three `world_runtime_*` tables and six runtime persistence RPCs exist, but live RPC source hashes differ from the old local persistence migration. Hosted ledger contains later Oct 4–5 world-runtime evolution while those migration SQL files are absent from the local migration inventory. The local migration stream is therefore incomplete/outdated for this family; do not replay the old file.
- The local runtime-intent reconciliation audit table and `reconcile_vendrith_runtime_intent_v1` are absent from the hosted catalog; this remains a local-only, not-applied candidate.
- The private Web AI rate-limit table and consume RPC exist; hosted function source hash matches the local rate-limit migration body even though the exact local filename is absent from the ledger.

No production state changed. The next gates remain recovery/reconciliation of missing trusted world-runtime SQL history, review of the not-applied reconciliation migration, Save/Load object reconciliation, and AI roadmap finalization. Foundation 11-table specification and ERD remain unchanged.


## 32. Pass 21 — Save/Load candidate object reconciliation

Created `docs/audits/VENDRITH_MAP_EDITOR_SAVE_LOAD_CANDIDATE_RECONCILIATION_PASS21_2026-10-15.md`. Hosted catalog has the underlying save-slot/version tables, existing `map_editor_save_slot_v1` and `map_editor_load_save_slot_v1` RPCs, legacy slot-claim function, and commit merge/identity helpers. The exact new candidate RPCs `map_editor_save_game_slot_atomic_v1` and `map_editor_load_save_slot_validated_v1` are absent from the hosted catalog, and their local migration filenames have no exact hosted ledger entry. This confirms the two new files remain unapplied candidates; it does not mean the legacy save/load pathway is absent.

No hosted mutation or migration application occurred. Before any application, verify the legacy RPC definitions and privileges against the candidate contracts, then test transaction rollback, concurrency, snapshot reuse, owner checks, and malformed/stale version references against the correct disposable schema. Foundation 11-table specification and ERD remain unchanged.


## 33. Pass 22 — legacy Save/Load authorization review

Created `docs/audits/VENDRITH_MAP_EDITOR_LEGACY_SAVE_LOAD_AUTHORIZATION_PASS22_2026-10-15.md`. Hosted `map_editor_save_slots` has RLS enabled but not FORCE RLS; the table has broad anon/authenticated grants including TRUNCATE, while policies target authenticated roles. The legacy Save and Load RPCs are SECURITY DEFINER and authenticated-executable. The canonical-World access helper permits non-owner access to the configured shared World. The Save RPC upserts by `(map_id,slot_number)` without an owner predicate on conflict; the Load RPC filters by map/slot but not `created_by`. Alongside the canonical-World SELECT policy, this creates a credible cross-user slot isolation risk if that World is shared between users.

This is a high-priority authorization finding requiring a two-user disposable regression test and an explicit product decision about per-user versus shared save slots. The new candidate RPCs add ownership checks but may conflict with shared-world access semantics, so do not apply them blindly. No hosted mutation occurred. Foundation 11-table specification and ERD remain unchanged.


## 34. Pass 23 — private Save Slot decision and disposable regression

The project owner chose private per-user Save Slots. Created `supabase/migrations/20261010190000_map_editor_private_save_slots_v1.sql` as a local, unapplied candidate. It enforces non-null `created_by`, changes the unique key to `(map_id, created_by, slot_number)`, removes the canonical-World cross-user SELECT policy, tightens owner-scoped RLS, removes direct client write/TRUNCATE access, and disables the legacy Save/Load RPC entry points that do not scope rows by owner. The atomic Save candidate now uses the matching owner-scoped conflict key. The validated Load candidate already filters by `created_by`.

A temporary PostgreSQL 17 fixture passed two-user assertions: each user saw only their own slot; direct authenticated INSERT/TRUNCATE privileges were absent; legacy Save/Load RPC execution was denied. The test was a minimal policy/privilege fixture, not a full migration-chain integration test. Its temporary container and fixture file were removed.

No hosted database state changed. Remaining gates: apply the full candidate chain only to a correctly bootstrapped disposable database; test atomic Save/Load and World+Exterior rollback/concurrency; and decide whether a user may save private slots against a shared canonical World. Current Save/Load candidates require the World map itself to be owned by the current user. Foundation 11-table specification and ERD remain unchanged.


## 35. Pass 24 — private slots on shared canonical World

Created `docs/audits/VENDRITH_MAP_EDITOR_PRIVATE_SAVE_SLOT_SHARED_WORLD_PASS24_2026-10-15.md`. This supersedes the open design question in §34: private Save Slots are per-user, while authorized users may save/load their own slots on the shared canonical World. The candidate policies now combine `created_by = auth.uid()` with `map_editor_can_access_v1(map_id)` rather than requiring ownership of the map row. Atomic Save and validated Load use the same shared-World access rule; the slot row and Exterior identities remain owner-scoped. Canonical World versions are shared history, so the version author is not required to match the private slot owner.

**PASS — clean disposable PostgreSQL 17 chain.** Applied the reconstructed baseline, private-slot migration, atomic Save migration, and validated Load migration in order, then ran Load assertions, full-schema Save/rollback/ownership/RLS assertions, and full-schema concurrency assertions. The shared-World user test succeeds, same-number slots coexist per user, direct RLS SELECT shows each user only their own row, and concurrent Save returns one commit plus one `VERSION_CONFLICT`. The separate stub atomic Save/concurrency suite passed as well. Existing app contract tests passed 38/38.

This remains a local candidate only. No hosted DDL/data change, migration-ledger repair, package installation, commit, push, or deployment occurred. Full browser-based authenticated two-user verification and the broader migration-stream/AI-roadmap gates remain open. Foundation 11-table specification and ERD remain unchanged.


## 36. Pass 25 — hosted World Runtime migration source gap and roadmap refresh

Created `docs/audits/VENDRITH_AI_RUNTIME_MIGRATION_SOURCE_GAP_PASS25_2026-10-15.md`. A fresh read-only Supabase migration-ledger query confirmed the 13 hosted World Runtime migration entries spanning `20261004015904` through `20261005015501`. The repository/reachable Git history contains only the old base persistence migration, whose RPC bodies do not match the current hosted definitions; the other 12 historical SQL files were not found. Current catalog inspection recorded the seven hosted RPC signatures, source hashes/lengths, SECURITY DEFINER/empty-search-path settings, EXECUTE grants, table columns, RLS state and direct table ACLs. These current-state facts are useful for a catalog reconstruction but do not recreate the exact historical migrations or intermediate DDL.

**Decision:** do not replay the old local runtime persistence migration, invent original migration sources, or repair the hosted ledger. First search trusted archives/handoff exports; if exact sources are unavailable, create a separately labeled current-catalog reconstruction and test it in a disposable PostgreSQL environment. Hosted database remained read-only.

Updated `docs/ai/VENDRITH_AI_ROADMAP.md` to a 2026-10-15 evidence-based phase/status table and gated execution plan. It prioritizes reported Creator AI Preview 503 and Save/Load browser verification, migration source recovery, durable runtime-intent/editor mutation atomicity, then read-only project intelligence and staged mutation tools. roadmap.sh AI Engineer/AI Agents/API Security references are linked as guidance only. Deferred packages remain uninstalled. No production mutation, package installation, commit, push, or deployment occurred; Foundation 11-table specification and ERD remain unchanged.


## 37. Pass 26 — trusted archive search and runtime RPC authorization finding

Created `docs/audits/VENDRITH_AI_RUNTIME_CATALOG_RECONSTRUCTION_PASS26_2026-10-15.md`. Searched the repository, available Git branches/refs and history, and three available handoff archives for the 12 missing hosted World Runtime migration sources. No exact SQL sources or matching runtime function/table identifiers were found in those archives; only the obsolete local base persistence migration remains. The new report documents the current hosted table columns, constraints, indexes, RLS/direct grants, seven RPC signatures and current definition hashes as a clearly labeled catalog snapshot, not as executable SQL or historical migration replay.

**High-priority finding:** read-only inspection of current hosted definitions indicates `acquire_world_runtime_lease_v1`, `read_latest_world_runtime_checkpoint_v1`, and `read_world_runtime_mutations_v1` do not verify caller access to the target World; `append_world_runtime_mutation_batch_v1` and `save_world_runtime_checkpoint_v1` rely on the caller's lease without independently establishing World authorization. Because these are SECURITY DEFINER RPCs, direct table ACL/RLS restrictions do not correct missing checks inside the functions. Treat runtime use as blocked until a disposable two-user authorization matrix proves private-World isolation and shared canonical-World behavior, followed by a reviewed forward-only candidate. `read_world_runtime_mutation_by_id_v1` uses a separate map-owner predicate and should be reconciled with the intended shared-World access policy. A follow-up read-only query confirmed `public.worlds` has no `created_by` column; the existing `map_editor_can_access_v1(map_id)` authorizes owner maps or maps pointing to canonical World UUID `3695d0b0-788e-42fa-9345-cc3197d0c94d`. Runtime authorization must explicitly resolve World IDs through that map access contract.

Updated `docs/ai/VENDRITH_AI_ROADMAP.md`: Gate B records the completed archive search and the current-state reconstruction; Gate C now prioritizes the runtime authorization issue and two-user regression tests. No production DDL/DML, migration application, ledger repair, package installation, deployment, commit, or push occurred. Foundation 11-table specification and ERD remain unchanged.
