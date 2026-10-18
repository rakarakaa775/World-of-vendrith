# Vendrith AI Roadmap

> Roadmap implementasi AI untuk World of Vendrith.
> Status snapshot: 2026-10-15.
> Evidence sources: repository tests/audits, read-only hosted catalog/ledger checks, and user-reported preview behavior. A green local test does not imply a hosted deployment or production migration is complete.
> Prinsip utama: AI mengusulkan dan membantu; manusia tetap menjadi otoritas akhir.

## Current Progress Overview — 2026-10-15

| Phase | Area | Current status | Evidence / blocker |
|---|---|---|---|
| 1 | AI Core Foundation | Complete in code | Core contract, runtime policy, bounded tool loop, state-version validation and regression tests are present. |
| 2 | Live Creator AI | **Partially working; tool-request HTTP 400 unresolved** | User confirms basic chat returned a response on `gemini-3.5-flash-lite`; a prompt explicitly requesting project evidence through tools now returns `Direct AI provider failed (400)` with no further detail. Inspect the deployed commit, tool schemas/request shape, and sanitized provider error path before changing keys or providers. |
| 3 | Project Intelligence | In progress | Repository, documentation, code graph and asset evidence tools exist; confirm tool invocation and evidence-grounded answers in the deployed UI. |
| 4 | Creator AI Tools | Gated | Mutation proposals and approval boundaries exist, but no new mutation tools should be enabled until authorization, rollback and verification contracts pass. |
| 5 | World Builder AI | In progress / gated | World Builder UI is available, but the AI-to-editor execution path must remain proposal-first and deterministic engine state remains authoritative. |
| 6 | NPC AI | Not started | Depends on verified project/world data contracts and the later NPC runtime phase. |
| 7 | Dialogue AI | Not started as an AI capability | Existing deterministic dialogue engine is not the same as model-driven dialogue AI. |
| 8 | Runtime AI | Core code present; persistence history gap and authorization risk open | Hosted objects exist, but 12 historical source files remain missing. Pass26 found missing World authorization checks in several SECURITY DEFINER RPCs; treat runtime use as blocked until two-user tests and a reviewed forward-only fix pass. |
| 9 | Quest/Event AI | Not started | Requires stable world-state observations and policy-validated proposals. |
| 10 | AI Memory | Partial | Improvement memory/strategy history exist; define explicit memory scope, retention and precedence before expanding. |
| 11 | Verification & Self-Repair | Partial | CI and SQL contracts exist; self-repair must remain a proposal requiring approval, with deterministic verification and rollback. |
| 12 | Full Vendrith AI Integration | Gated | Requires Phase 2 availability, project evidence, authorization, runtime persistence reconciliation, and nonproduction E2E gates. |

Statuses describe evidence and blockers, not a percentage of product completion.

## Execution Plan — Gate Order

### Gate A — Stabilize the current Creator AI and Save/Load release path

- [ ] Reproduce the latest reported HTTP 400 on a request that includes project tools; capture deployment commit, provider/model, request ID, and sanitized provider error details. Never log API keys or prompt secrets.
- [ ] Verify a successful real model response and one read-only project-tool call in the UI; confirm tool results are returned to the model and relevant claims cite repository evidence.
- [ ] Keep `execute` and high-risk actions blocked at the API boundary. A successful model response is not authorization to mutate project state.
- [ ] Run the existing full app test/typecheck/build/CI checks for the candidate branch.
- [ ] Complete a two-user authenticated browser test for private Save Slots on the shared canonical World in a nonproduction environment.

### Gate B — Reconcile the hosted migration stream (no replay or ledger repair)

- [x] Search the repository, reachable Git history/refs, and three available handoff archives for the 12 missing local SQL source files; no exact sources were found. Document current-state catalog reconstruction and its evidence limits in `docs/audits/VENDRITH_AI_RUNTIME_CATALOG_RECONSTRUCTION_PASS26_2026-10-15.md`.
- [ ] Continue comparing hosted catalog definitions, function signatures/source hashes, ACLs, constraints, and effective table privileges using consistent hash representation; current-state reconstruction does not replace historical migration sources.
- [ ] Treat the local `20261009015200_vendrith_runtime_persistence_v1.sql` as historical/obsolete relative to hosted Oct 4–5 evolution; never replay it over the hosted functions.
- [ ] Keep `20261009015300_vendrith_runtime_intent_reconciliation_v1.sql` and all Save/Load candidates unapplied until their contracts and ordering are reconciled.
- [ ] Do not edit hosted migration ledger entries to make filenames match. No production DDL or migration application is authorized by this roadmap.

### Gate C — Complete durable AI workflow correctness (runtime blocked pending authorization fix)

- [x] Reproduce the current hosted cross-World authorization failure on disposable PostgreSQL using read-only-captured hosted RPC definitions. See `docs/audits/VENDRITH_AI_RUNTIME_WORLD_ACCESS_HARDENING_PASS27_2026-10-15.md`.
- [x] Draft and test a local-only forward candidate adding `map_editor_can_access_v1` checks to all seven runtime RPCs; private-World isolation and authorized shared canonical World read/write tests pass on the modeled disposable schema. Candidate remains outside `supabase/migrations`.
- [ ] Review candidate against a full disposable schema reconstructed from trusted migrations and test grants, anonymous JWTs, duplicate/unknown map mappings, expired/foreign leases, idempotent retries, and concurrency before considering production approval.
- [ ] Resolve the separately reproduced ambiguity in hosted `renew_world_runtime_lease_v1` (`holder_id` output parameter versus unqualified update column); candidate qualifies the target alias and disposable owner-renewal test passes.
- [ ] Test runtime intent finish ambiguity/reconciliation so retries cannot duplicate a mutation.
- [ ] Review SECURITY DEFINER RPCs, search paths, EXECUTE grants, direct table grants and owner checks as one call graph.
- [ ] Fix editor leaves that can return `ok:false` after earlier writes or ignore helper failure JSON; require transaction rollback for object, geometry, navigation and command-journal changes.
- [ ] Verify persisted proposal → validation → approval → execution → audit → deterministic verification. In-memory approval state is workflow metadata, never authorization.

### Gate D — Build evidence-backed Project Intelligence and read-only tools

- [ ] Make project manifest, schema map, dependency graph, asset/license registry and world/region/NPC/dialogue/event references inspectable through bounded read-only tools.
- [ ] Add tool-level tests for scope, ownership, timeouts, result size, untrusted repository content and prompt injection.
- [ ] Require evidence for repository-specific answers and show uncertainty when evidence is missing.

### Gate E — Enable mutations and future AI features incrementally

- [ ] Start with one low-risk, reversible editor proposal type and a complete verification/undo path.
- [ ] Expand terrain/world tools only after deterministic schema validation, canonical World/Region separation, coordinate bounds and asset-license checks pass.
- [ ] Only then plan NPC memory/personality, dialogue, quest/event generation, and runtime AI expansion.
- [ ] Keep external package candidates deferred until a phase has a written need, security/license review, compatibility test, pinned version and lockfile change approval.

## Roadmap Reference Use

Use roadmap.sh as a high-level skills/checklist reference, not as a Vendrith implementation specification:
- [AI Engineer Roadmap](https://roadmap.sh/ai-engineer)
- [AI Agents Roadmap](https://roadmap.sh/ai-agents)
- [API Security Best Practices](https://roadmap.sh/api-security-best-practices)

Vendrith-specific contracts, repository evidence, tests, World Bible, deterministic engine authority and explicit owner decisions take precedence over generic roadmap content.

## Phase 1 — AI Core Foundation
Status: See the evidence-based progress table and execution gates above.

- AI Core Contract
- Creator AI / Engine AI / Game AI boundaries
- Observe → Reason/Plan → Execute → Verify
- authority boundaries
- risk classification
- approval boundary
- runtime state-version validation
- runtime authorization policy
- runtime orchestrator
- regression tests

## Phase 2 — Live Creator AI
Status: See the evidence-based progress table and execution gates above.

### Sudah ada
- Model Provider abstraction
- Vercel AI Gateway provider
- multi-iteration tool loop
- Creator Agent Orchestrator
- GitHub repository adapter
- documentation tools
- CodeGraph tools
- Asset Registry tools
- evidence collection
- /api/vendrith-ai
- /vendrith-ai workspace
- basic live model response confirmed for at least one user-reported chat; project-tool request currently fails with HTTP 400 and remains unresolved
- read/analyze and plan modes
- mutation/execute/high-risk blocked at the API boundary

### Exit criteria
- [ ] latest branch commit passes typecheck/build
- [ ] CI reports the relevant checks successfully
- [ ] Vercel deploys the fixed commit successfully
- [ ] /vendrith-ai loads from the successful deployment
- [ ] real model request returns a response
- [ ] model can invoke at least one project tool
- [ ] tool result is returned to the model
- [ ] response contains repository/asset evidence when relevant
- [ ] read-only guardrail remains enforced
- [ ] errors are surfaced cleanly in the UI

### Current blocker
User-provided live smoke-test evidence (2026-10-15): ordinary Creator AI chat returned a coherent answer and identified `gemini-3.5-flash-lite`; therefore basic chat worked for at least one request. A request asking Creator AI to read project evidence through tools returned only `Direct AI provider failed (400)`. The exact URLs were then matched to Vercel deployment metadata: the working URL points to `d5d03536` on `feat/vendrith-ecc-v1`, while the failing URL points to `b76f5c94` on the separate `fix/ai-503-retry-fallback` branch. A source comparison shows the failing branch lacks the successful branch's `7cef0017` Gemini thought-signature preservation and `5e5e6a8a` actionable provider-error handling; its provider adapter strips `thought_signature`/`extra_content.google.thought_signature` from tool calls and reduces error reporting to the short `error.message` fallback. This is a concrete code difference consistent with a tool-call HTTP 400 and unhelpful error text, but the precise provider rejection still needs confirmation. Do not continue testing on the divergent `fix/ai-503-retry-fallback` deployment as if it were the current project branch. Retest the intended `feat/vendrith-ecc-v1` deployment, and if tool calls still fail there, capture sanitized provider metadata and inspect the exact request/response. Vercel runtime log queries for `/api/vendrith-ai` returned no matching records in recent 30-minute Preview and Production windows; this is not proof that no request occurred.

### Deployment alignment check — 2026-10-15

- Vercel project: `rakarakaa775-world-of-vendrith`.
- User-verified working URL `https://rakarakaa775-world-of-vendrith-6mcw4xzgs-rakamahandika123-4779.vercel.app/` maps to READY deployment `dpl_7NipypidhLgHHPJ2Xs5zPk2whgYk`, commit `d5d03536` on `feat/vendrith-ecc-v1` (`fix(ai): retry overloaded Gemini models`).
- User-verified failing URL `https://rakarakaa775-world-of-vendrith-nxct16bem-rakamahandika123-4779.vercel.app/` maps to READY deployment `dpl_GHvqX5RjKZxzE7SoeKpTSWbe9ccH`, commit `b76f5c94` on the separate `fix/ai-503-retry-fallback` branch (`test(ai): cover provider retry and Gemini fallback`). It is not the intended `feat/vendrith-ecc-v1` branch.
- A direct Git diff shows the failing branch is missing commits on the intended branch that preserve Gemini thought signatures in tool calls (`7cef0017`) and surface actionable provider errors (`5e5e6a8a`). Its provider adapter omits thought-signature metadata and has less detailed error handling. This is a strong explanation candidate for the tool-request HTTP 400, not yet a confirmed provider-side diagnosis.
- The environment inventory showed `GEMINI_API_KEY` configured for Preview and Production; its secret value was not read. Do not change keys solely on the basis of this HTTP 400.
- `ai/adapters/direct-model-provider.test.ts` and `ai/application/tool-definitions.test.ts`: 7/7 local tests passed. Provider tests use mocks and do not prove live tool calling works.
- Vercel runtime-log queries for `/api/vendrith-ai` returned no matching records in the recent 30-minute Preview and Production windows; this does not prove no request occurred. No deployment, environment edit, commit, push, or production change was performed during this investigation.
- Next: test the read-only tool round trip on the intended `feat/vendrith-ecc-v1` deployment. If it fails, capture sanitized provider metadata. Keep Production unchanged until Preview and tool round-trip verification pass.

## Phase 3 — Vendrith Project Intelligence
Target: AI memahami project sebagai knowledge layer yang berbasis evidence.

- project manifest
- repository structure map
- code dependency graph
- asset registry
- asset license metadata
- map schema
- world schema
- region schema
- NPC schema
- dialogue schema
- event schema
- project memory

## Phase 4 — Creator AI Tools
Target: AI dapat membantu membuat konten melalui proposal → validation → approval → execution → verification.

Candidate tools: inspect_project, inspect_map, inspect_world, inspect_assets, search_assets, create_terrain, create_region, place_asset, create_npc, create_dialogue, create_event, modify_map, undo_ai_change.

## Phase 5 — World Builder AI
Target: AI membantu membangun WORLD yang berisi alam.

WORLD mencakup terrain, ground, water, rivers/lakes, mountains/hills/cliffs, natural rock formations, forests/jungles/deserts/swamps/snow dan natural vegetation.

Structures seperti bridges, docks, ships, towns, villages, roads, ports, dan landmarks berada di REGION.

Water harus dapat dibedakan antara near-shore/coastal water dan deep-sea water.

## Phase 6 — NPC AI
- identity
- personality
- memory
- goals
- relationships
- knowledge
- state

## Phase 7 — Dialogue AI
- dynamic dialogue
- dialogue memory
- relationship state
- conditional dialogue
- quest-aware dialogue
- world-aware dialogue
- multiple dialogue styles

## Phase 8 — Game Runtime AI
Flow: Game Runtime → Observation → Runtime AI → Decision → Policy → Execution → Verification

Observation mencakup player, NPC, environment, quests, events, world state, combat state, time, dan relationships.

## Phase 9 — Quest & Event AI
Pipeline: Quest → Conditions → Objectives → Events → Rewards

AI harus dapat menyusun proposal yang tetap divalidasi oleh game rules.

## Phase 10 — AI Memory
- architecture
- design decisions
- world lore
- NPC knowledge
- asset knowledge
- project preferences

Explicit current design constraints always take precedence over remembered suggestions.

## Phase 11 — Verification & Self-Repair
AI Change → Validate → Build → Tests → Schema Validation → Asset Validation → Runtime Validation → Success/Rollback

Failure path: Verification Fail → Diagnose → Repair Proposal → Approval → Retry

## Phase 12 — Full Vendrith AI Integration
- Creator AI
- Engine AI
- Game AI
- Shared AI Core
- Memory
- Tools
- Evidence
- Policies
- Verification

## Implementation Order — 2026-10-15

1. Stabilize and verify the current Creator AI Preview request + one read-only tool round trip.
2. Complete Save Slot nonproduction authenticated two-user browser verification; keep production migrations unapplied.
3. Complete the current-catalog reconstruction and keep the 12 missing historical migration sources explicitly marked unrecovered; do not replay the obsolete local base migration.
4. Complete the full-schema review and negative/positive matrix for the Pass27 World Runtime authorization candidate; do not apply it to production yet.
5. Verify runtime-intent finish/reconciliation and editor leaf transaction atomicity so retries or JSON failures cannot leave duplicate/partial mutations.
6. Reconcile the effective RPC security boundary: `SECURITY DEFINER`, empty `search_path`, EXECUTE grants, table ACLs, RLS, ownership and call graph.
7. Complete evidence-backed read-only Project Intelligence and adversarial tool tests.
8. Enable one low-risk reversible Creator AI mutation proposal with approval, audit, verification and undo.
9. Expand World/Region terrain and asset tools with canonical state, coordinate, schema and license checks.
10. Only after these gates, plan NPC AI, dialogue AI, quest/event AI and broader runtime AI features.
11. Consider external package candidates only when a phase has a concrete need and a reviewed, pinned, tested dependency plan.

### Pass28 — World Runtime candidate negative/idempotency checks (2026-10-15)

- Re-ran the Pass27 candidate only in a newly created, disposable PostgreSQL 17 container; the container was removed after the test. Hosted Supabase was not called for mutation and no production schema/data changed.
- Passed modeled fixture tests for cross-user private-World denial across all seven runtime RPCs, private-owner access, and authorized canonical shared-World access.
- Added negative/idempotency checks: exact mutation retry returns the existing sequence without duplicating the journal row; foreign lease token rejected; expired lease rejected; anonymous checkpoint read and lease acquisition rejected.
- Reproducible extra assertions: `docs/audits/candidates/pass27-disposable-tests/pass28-negative-idempotency-assertions.sql`.
- **Scope limitation:** this is a modeled fixture, not a full-schema/grant/RLS/concurrency integration test. The missing historical World Runtime migration sources mean the candidate is not ready for production application. Next gate remains recovering/reconstructing the authoritative schema and then testing effective grants, RLS, lease races/concurrency and the actual `map_editor_can_access_v1` implementation in a disposable full-schema environment.
- No package install, production migration, deployment, commit, push, or branch change.
