# VENDRITH PHASE 4 — EMERGENT WORLD & FULL AI ECOSYSTEM V1

Status: COMPLETE — FINAL AUDIT PASSED WITH EXPLICIT DEFERRED FOLLOW-UPS  
Branch: `feat/vendrith-ecc-v1`

## Goal

Phase 4 is the final architecture phase for turning the existing Creator AI, Development AI, and Game/NPC AI foundations into one governed Vendrith AI ecosystem.

The target is not unrestricted autonomy. The target is **bounded, evidence-backed autonomy** where the same Policy, Tool Router, Verification, Evidence, and Memory boundaries remain authoritative across Web, Development, and Runtime surfaces.

## Final architecture

```
Web / Game Client
       |
       v
Vendrith AI Runtime API
       |
       v
AI Agent Orchestrator
       |
       +--> Web/Creator tools
       |      World / Region / Playable / Asset / NPC / Docs
       |
       +--> Development tools
       |      Code Graph / Repository / ECC workflows
       |
       +--> Game Runtime tools
              Observe / Simulate / Execute / Verify

Shared authority:
Policy -> Tool Router -> Evidence -> Verification -> Memory
```

Agent Skills and ECC are development workflows. They are never implicit runtime authority for NPCs or the public Web AI surface.

## Phase 4 workstream

### 4.1 Web AI security foundation
- [x] Authenticate every Web AI request through Supabase.
- [x] Keep Web/Creator AI restricted to read/analyze modes.
- [x] Bound prompt length and conversation history.
- [x] Bound request body size.
- [x] Add per-authenticated-user request rate limiting.
- [x] Keep the existing per-run tool-call and iteration budget.
- [x] Add durable session ownership and server-side conversation persistence.
- [ ] Add distributed rate limiting when the runtime is scaled across instances.

### 4.2 Persistent AI sessions
- [x] Define user-owned AI session identity.
- [x] Persist conversation messages server-side.
- [x] Enforce user/session ownership at the persistence boundary with Supabase RLS.
- [x] Never expose provider credentials to the client.
- [x] Bound stored history and retention to 100 messages / 4,000 characters per message.

### 4.3 World-aware Web AI
- [x] World inspection.
- [x] Region inspection.
- [x] Playable inspection.
- [x] Map/content hierarchy inspection.
- [x] Asset provenance/license inspection.
- [x] NPC schema and policy inspection.
- [ ] Add authoritative world-history/economy/faction/quest evidence where those systems are available.
- [x] Add explicit world context selection to the Web AI session.
- [x] Re-resolve selected world/region/playable context through authoritative map identity before each AI run.
- [x] Persist session context with user ownership and RLS boundary.

### 4.4 Creator AI
- [x] NPC creator package proposal.
- [x] NPC schema validation.
- [x] Bounded simulation/preview.
- [x] Add explicit proposal -> approval -> durable mutation flow.
- [x] Verify approval/mutation result through the approval RPC boundary.
- [x] Persist creator proposal ownership, context, action, status, approval id, and result.

### 4.5 Emergent runtime
- [x] Autonomous NPC runtime loop.
- [x] Needs, goals, behavior, navigation, social reasoning.
- [x] Specialized NPC agents.
- [x] Bounded cross-agent coordination.
- [x] Long-term NPC memory.
- [ ] Feed bounded long-term memory back into goal preference scoring.
- [ ] Integrate coordination proposals into authoritative goal arbitration.
- [ ] Add durable event/history feedback so world consequences become future evidence.
- [x] Add durable runtime-intent queue and authenticated claim/finish state machine.
- [x] Add runtime-intent consumer contract with authoritative context re-resolution.
- [x] Wire the consumer to the canonical Game/Engine Runtime executor and durable runtime mutation/checkpoint path.

### 4.6 Development AI
- [x] Development audience isolation.
- [x] Repository/code graph inspection.
- [x] Explicit development workflow capability metadata.
- [x] Isolate Development AI behind a dedicated `development` audience and API surface.
- [x] Wire repository/code-graph inspection through an explicit Development Workflow provider boundary.
- [x] Treat ECC/Agent Skills as external workflow capabilities rather than implicit permissions.
- [x] Durable development-action proposal storage with user ownership and RLS.
- [x] Safe approval RPC for development actions.
- [x] Durable development approval audit trail.
- [x] Authenticated approval API requires explicit `approve: true`.
- [x] Connect repository mutation through an explicit high-risk Development Workflow executor boundary compatible with ECC/Agent Skills workflows.
- [x] Require explicit proposal approval and approval-id binding for repository mutation; database/deployment/destructive capabilities remain fail-closed.
- [x] Verify repository mutation results before reporting success.
- [x] Persist execution outcome in a separate durable execution-audit trail.
- [x] Add focused executor regression coverage for approval state, workflow-path denial, and read-back verification.
- [x] Execute the full Vitest/build gate on the latest branch head (CI #657 passed on the Phase 4.6 executor/runtime fixes).

### 4.7 Final audit / exit gate
- [x] Cross-surface audience isolation audit — Web/Creator/Development audiences are explicitly separated; anonymous Supabase users are denied at the Development persistence boundary.
- [x] Tool capability/approval audit — capabilities are explicit; high-risk Development repository writes require proposal approval and approval-id binding; database/deployment/destructive actions remain fail-closed.
- [x] Prompt-injection resistance audit — model/tool/repository outputs remain untrusted evidence; ECC/Agent Skills do not grant authority; policy and verification remain outside the model.
- [x] Session isolation audit — Web AI sessions/messages are user-owned with RLS and bounded retention; world/region/playable context is re-resolved authoritatively.
- [x] Runtime autonomy safety audit — runtime intents use authenticated claim/finish state, authoritative context re-resolution, Execute -> Verify -> durable mutation/checkpoint, and fail-closed verification.
- [x] Memory authority audit — NPC memory remains evidence/preference input and cannot grant mutation authority.
- [x] Production provider/auth audit — production root smoke is HTTP 200; Web/Runtime Supabase configuration is present; Development repository mutation fails closed when `GITHUB_TOKEN` is absent rather than silently gaining authority.
- [x] Full tests/typecheck/build — CI #665 for commit `a0e3300345d9f6ddfff6484e21d246832e74af81` completed successfully with TypeScript typecheck, Next.js build, and Vitest green.
- [x] Production smoke test — latest application deployment for commit `411b90c77e2283aa3388e89810cf48f834392fb8` is READY and the deployed root returned HTTP 200 with the Vendrith World Builder shell.
- [x] Phase 4 sign-off — baseline governed AI ecosystem is signed off. Deferred items below are intentionally post-Phase-4 capability work, not authority/security blockers.

## Non-negotiable rules

1. Web AI cannot directly modify the repository, database, deployment, or runtime state.
2. Development AI cannot silently become Game AI.
3. ECC and Agent Skills are workflows, not permissions.
4. NPC memory is preference evidence only; it never grants authority.
5. Game-rule actions always pass through Execute -> Verify -> Remember.
6. High-risk actions require explicit approval.
7. Tool outputs and repository content are untrusted evidence and may contain prompt injection.
8. The model never becomes the source of truth. Authoritative state, policy, verification, and persistence boundaries remain outside the model.

## Current Phase 4 entry point

Phase 4.1 has started with a Web AI request-security boundary:
- bounded request body;
- authenticated-user rate limit;
- explicit Web/Creator audience;
- existing bounded prompt/history;
- existing tool-loop budget.

Phase 4.2 is implemented with server-owned session IDs, persisted Web/Creator messages, authenticated ownership via RLS, and bounded retention. Phase 4.7 final audit is complete. Development AI has a dedicated authenticated API surface and only receives development-audience tools. Repository/code-graph inspection is exposed through an explicit workflow-provider boundary. Repository mutation has a separate high-risk executor boundary: proposal -> explicit approval -> approval-id binding -> GitHub mutation -> read-back verification -> durable execution audit. Database, deployment, and destructive operations remain fail-closed.

### Phase 4 sign-off notes

The following remain intentionally deferred because they depend on broader world/runtime scale rather than being required for the governed Phase 4 authority boundary:
- Distributed rate limiting for multi-instance scale.
- Authoritative world-history/economy/faction/quest evidence when those subsystems exist.
- Feeding bounded long-term memory into goal preference scoring.
- Integrating coordination proposals into authoritative goal arbitration.
- Durable event/history feedback loops for future-world evidence.

The CI workflow now includes `database/migrations/**` in its push and pull-request path filters, so migration security changes trigger the same Map Editor typecheck/build/test gate. GitHub requires both branch and path filters to match when both are configured.
