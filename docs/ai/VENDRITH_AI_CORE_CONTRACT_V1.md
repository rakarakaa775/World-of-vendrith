# Vendrith AI Core Contract v1

Status: FOUNDATION / ARCHITECTURE CONTRACT

## 1. Purpose

Vendrith AI is one AI core with three operating surfaces:

- **Creator AI** — helps people build and debug games.
- **Engine AI** — observes and orchestrates engine systems.
- **Game AI** — drives bounded runtime intelligence such as NPC behavior, dialogue, events, and life simulation.

The AI model is not the engine authority. The engine, game rules, policy layer, and verification layer remain authoritative.

## 2. Core flow

```
Request
  ↓
Context / Observation
  ↓
Evidence
  ↓
Plan / Decision
  ↓
Policy
  ↓
Approval (when required)
  ↓
Execution
  ↓
Verification
  ↓
State + Memory
```

Read-only reasoning may stop before approval. Any mutation must pass the relevant policy boundary.

## 3. Three surfaces

### Creator AI

Used by the person making a game.

Responsibilities:

- understand project structure and engine APIs
- explain systems
- inspect evidence
- diagnose bugs
- propose fixes
- generate implementation plans
- execute approved project changes
- verify changes

### Engine AI

Runs with the engine and observes engine state.

Responsibilities:

- coordinate bounded runtime systems
- react to world-state changes
- request or select valid system actions
- keep decisions tied to current state/version
- never bypass engine rules

Engine AI does **not** replace deterministic systems such as the calendar, physics, save system, rendering, or persistence.

### Game AI

Runs as part of a game created with Vendrith.

Responsibilities:

- NPC decisions
- dialogue selection/generation within game constraints
- world events
- life/schedule behavior
- contextual reactions to season, weather, relationships, quests, and location

Game AI must operate through explicit runtime actions. It cannot directly mutate arbitrary engine state.

## 4. Runtime state

Runtime AI receives a bounded observation containing:

- world identity
- clock/tick
- day/time/season
- weather
- active region
- active events
- state version
- evidence/facts relevant to the decision

A state version is required so stale decisions can be rejected.

## 5. Action boundary

Runtime AI proposes typed actions such as:

- change an NPC behavior state
- choose an allowed dialogue template
- schedule an event
- request a bounded world-system transition
- update a permitted life-simulation state

It does not receive arbitrary database, filesystem, shell, or engine-internal mutation access.

## 6. Deterministic systems remain authoritative

Examples:

- Calendar System determines when a season changes.
- Weather System determines valid weather transitions.
- Quest System determines quest state.
- Physics System determines physical outcomes.
- Save System determines persistence.
- Asset/License Policy determines whether an asset may be used.

AI may observe these systems and propose bounded reactions.

## 7. Model independence

The AI core depends on ports, not a specific model vendor.

A model provider may be:

- hosted API
- local model
- self-hosted model
- small runtime model
- another OpenAI-compatible provider

Changing the model must not change the policy, evidence, verification, or engine authority.

## 8. Memory

Memory is project/game memory, not personal memory.

Useful records include:

- architecture decisions
- previous verified diagnoses
- asset decisions
- license/provenance decisions
- runtime events
- NPC/world state history where explicitly configured
- verification results
- improvement history

Memory must not become an unrestricted source of authority. Current verified state wins over stale memory.

## 9. Safety and failure behavior

If observation is incomplete, the AI must report uncertainty.

If a decision is stale, the engine must reject or re-evaluate it.

If an action fails, the failure must be observable and verifiable.

If the model is unavailable, deterministic engine systems must continue operating wherever possible.

## 10. Initial implementation boundary

Phase 1 implements the contracts and keeps runtime execution disabled by default.

Phase 2 connects the existing Creator AI conversation to a real ModelProvider.

Phase 3 adds project evidence/context retrieval.

Phase 4 adds Engine/Game runtime adapters with deterministic system boundaries.

Phase 5 adds optional advanced capabilities such as MCP, skills, sub-agents, browser tools, or sandboxed code execution.

## 11. Non-goals

Vendrith AI Core is not:

- a replacement for the game engine
- an unrestricted autonomous coding agent
- an unrestricted terminal agent
- a general-purpose chatbot embedded without game context
- a single LLM responsible for every simulation rule

## 12. Acceptance criteria

The v1 contract is considered implemented when:

1. Creator, Engine, and Game surfaces are represented explicitly.
2. Runtime observation and action contracts are typed.
3. Runtime actions carry risk and reason metadata.
4. Runtime decisions reference an observation and state version.
5. Verification remains a separate boundary.
6. Model providers remain replaceable.
7. Runtime execution is disabled until an explicit adapter is installed.
8. Tests cover stale-state and action-boundary behavior.
