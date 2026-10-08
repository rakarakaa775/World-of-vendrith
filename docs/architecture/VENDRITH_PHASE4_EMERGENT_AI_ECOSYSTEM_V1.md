# VENDRITH PHASE 4 — EMERGENT WORLD & FULL AI ECOSYSTEM V1

Status: IN PROGRESS  
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
- [ ] Wire the consumer to the canonical Game/Engine Runtime executor and durable runtime mutation/audit path.

### 4.6 Development AI
- [x] Development audience isolation.
- [x] Repository/code graph inspection.
- [x] Explicit development workflow capability metadata.
- [x] Isolate Development AI behind a dedicated `development` audience and API surface.
- [x] Wire repository/code-graph inspection through an explicit Development Workflow provider boundary.
- [x] Treat ECC/Agent Skills as external workflow capabilities rather than implicit permissions.
- [ ] Connect ECC/Agent Skills through an explicit high-risk development workflow.
- [ ] Require approval for repository mutation, database mutation, deployment, and destructive operations.
- [ ] Verify mutation results before reporting success.

### 4.7 Final audit / exit gate
- [ ] Cross-surface audience isolation audit.
- [ ] Tool capability/approval audit.
- [ ] Prompt-injection resistance audit.
- [ ] Session isolation audit.
- [ ] Runtime autonomy safety audit.
- [ ] Memory authority audit.
- [ ] Production provider/auth audit.
- [ ] Full tests/typecheck/build.
- [ ] Production smoke test.
- [ ] Phase 4 sign-off.

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

Phase 4.2 is implemented with server-owned session IDs, persisted Web/Creator messages, authenticated ownership via RLS, and bounded retention. The current implementation target is **4.6 Development AI**. Development AI now has a dedicated authenticated API surface and only receives development-audience tools. Repository/code-graph inspection is exposed through an explicit workflow-provider boundary. Execute/high-risk requests fail closed until an approved ECC/Agent Skills mutation workflow is connected.
