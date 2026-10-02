# Vendrith AI Roadmap

> Roadmap implementasi AI untuk World of Vendrith.
> Status snapshot: 2026-10-02.
> Prinsip utama: AI mengusulkan dan membantu; manusia tetap menjadi otoritas akhir.

## Progress Overview

| Phase | Area | Status |
|---|---|---:|
| 1 | AI Core Foundation | 🟢 100% |
| 2 | Live Creator AI | 🟡 80% |
| 3 | Project Intelligence | 🟡 30% |
| 4 | Creator AI Tools | ⚪ 10% |
| 5 | World Builder AI | ⚪ 5% |
| 6 | NPC AI | ⚪ 0% |
| 7 | Dialogue AI | ⚪ 0% |
| 8 | Runtime AI | 🟡 25% |
| 9 | Quest/Event AI | ⚪ 0% |
| 10 | AI Memory | 🟡 20% |
| 11 | Verification & Self-Repair | 🟡 20% |
| 12 | Full Vendrith AI Integration | ⚪ 0% |

> Persentase adalah estimasi kemajuan arsitektur/implementasi, bukan persentase produk akhir.

## Phase 1 — AI Core Foundation
Status: 🟢 100%

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
Status: 🟡 80%

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
- real model response path
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
The runtime-policy export fix is committed as 828d9dbf34ba60b9ed3fff7b73be44e0ab0c39f1. The latest Vercel deployment list still shows the older failed deployment from 0db3631; therefore deployment success is not yet claimed.

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

## Implementation Order
1. Finish Phase 2
2. Complete Project Intelligence
3. Build Creator AI tools
4. Connect World Builder AI
5. Add Region AI
6. Add NPC AI
7. Add Dialogue AI
8. Connect Runtime AI
9. Add Quest/Event AI
10. Expand AI Memory
11. Add verification/self-repair
12. Complete full Vendrith AI integration