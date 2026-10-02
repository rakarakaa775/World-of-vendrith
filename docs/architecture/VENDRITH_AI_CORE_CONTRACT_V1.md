# Vendrith AI Core Contract v1

## Purpose

Vendrith AI is one AI core exposed through three surfaces:

- **Creator** — helps people build, inspect, debug, and understand games and the engine.
- **Engine** — orchestrates engine-level intelligence such as world state transitions and system coordination.
- **Game** — provides runtime intelligence for world, NPC, dialogue, event, and life systems.

The AI model is replaceable. The engine remains the authority over deterministic game state and allowed actions.

## Core rule

`observe → reason/plan → propose → policy → execute → verify → remember`

A model response is never authority by itself.

## Capabilities

### Creator

- project explanation
- code and dependency analysis
- bug investigation
- asset/provenance analysis
- game-building plans
- approved project mutations
- verification and diagnostics

### Engine

- observe engine state
- propose system actions
- coordinate world/event/life intelligence
- request verification
- never bypass engine rules

### Game

- world intelligence
- NPC intelligence
- dialogue intelligence
- event intelligence
- life/schedule intelligence

Runtime AI may propose actions, but the engine validates the state version, action type, risk, and game rules before execution.

## Authority boundaries

1. **Game/engine systems own deterministic state.**
2. **AI owns proposals and contextual reasoning.**
3. **Policy decides whether a proposal may execute.**
4. **Verification confirms the result.**
5. **Memory records project/game knowledge only when the relevant persistence boundary allows it.**

## Model providers

The core must depend on the existing `ModelProviderPort`, not on a specific vendor. Provider adapters may be cloud, local, or test implementations.

## Runtime state safety

Every runtime decision references:

- observation id
- state version
- action id
- intelligence domain
- risk class
- reason/evidence

A stale decision must be rejected.

## Risk classes

- **safe** — may execute without human approval when the engine permits it.
- **game-rule** — normal runtime game action; execution requires the engine/game runtime to authorize the action.
- **high-risk** — requires explicit creator/operator approval and must not be silently executed by runtime AI.

## Memory

Vendrith memory is project/game memory, not personal memory. Candidate memory includes:

- architecture decisions
- engine rules
- game design decisions
- asset/license decisions
- previous audits
- verified implementation results
- known problems
- runtime world facts when the game explicitly persists them
- improvement history

## Non-goals

Vendrith AI is not:

- a replacement for the engine
- an unrestricted terminal
- an unrestricted database administrator
- an autonomous deployment authority
- a license authority without evidence
- a single monolithic LLM responsible for every game system

## Initial implementation order

1. Connect a real `ModelProviderPort` to Creator AI in read-only mode.
2. Replace the hardcoded project snapshot responses with evidence-backed agent responses.
3. Add project/game context and durable run tracing.
4. Add runtime world/NPC/dialogue/event adapters.
5. Add controlled skills/tools and optional MCP adapters.
6. Add sandboxed code/browser capabilities only behind policy, approval, and verification.
