# Engine Blueprint Standard v1.0

> The Vendrith World — the permanent standard every Engine Blueprint must follow.
>
> This document defines the mandatory structure, content, and quality bar for every
> engine blueprint in the project. No engine is implemented until its blueprint
> follows this standard and is approved by the Lead Architect.
>
> After approval, this document becomes LOCKED. Future changes require an ADR,
> Architecture Review, and Lead Architect Approval.
>
> **Canonical References:**
> - Architecture Manifesto: `docs/architecture/Architecture_Manifesto.md`
> - Architecture Principles: `docs/architecture/Architecture_Principles.md`
> - Engine Dependency Graph: `docs/architecture/Engine_Dependency_Graph.md`
> - Event Bus Architecture: `docs/architecture/Event_Bus_Architecture.md`
> - Persistence Architecture: `docs/architecture/Persistence_Architecture.md`
> - Testing Architecture: `docs/architecture/Testing_Architecture.md`
> - Architecture Review (ADR + LOCK): `docs/architecture/Architecture_Review.md`
> - Engine Rules: `docs/rules/03_Engine_Rules.md`
> - Coding Rules: `docs/rules/02_Coding_Rules.md`
> - Naming Rules: `docs/rules/08_Naming_Rules.md`
> - AI Rules: `docs/rules/07_AI_Rules.md`

---

## 1. Overview

### Purpose
This standard defines the mandatory chapters, content requirements, and approval
process for every engine blueprint. An engine blueprint is the design document that
precedes implementation. It declares what the engine does, what it does not do, how
it communicates, how it saves and loads, how it is tested, and how it fits into the
simulation. No engine code is written until its blueprint is approved.

### Goals
- Ensure every engine is designed before it is implemented.
- Enforce a consistent structure across all 10+ engine blueprints.
- Guarantee that every blueprint addresses dependencies, interfaces, events,
  state, lifecycle, persistence, error handling, performance, security, and testing.
- Provide a verifiable completion checklist and a review checklist for the Lead
  Architect.
- Make the blueprint the single source of truth for the engine's contract.

### Scope
This standard applies to every engine in The Vendrith World: the 10 canonical
engines (Time, World, Life, Energy, Activity, Inventory, Dialogue, NPC AI, Quest,
Save) and any future engine added through the Future Engine Integration process
defined in the Engine Dependency Graph §6.

### Owner
Lead Architect. The Lead Architect owns this standard, approves blueprints, and
authorizes any changes to this standard.

### Status
Draft — pending Lead Architect approval. After approval, this document is LOCKED.

### Version
v1.0 — established in Phase 0.5.0.

---

## 2. Philosophy

### Why This Engine Exists
Every blueprint must open with a clear statement of why the engine exists. What
domain does it own? What problem does it solve? What would the simulation lack
without it? This is not a feature list — it is the reason the engine has a place in
the architecture.

### What Problem It Solves
The blueprint must identify the specific simulation problem the engine addresses.
This connects the engine to the Architecture Manifesto's principle of Engine First:
the simulation is the source of truth, and each engine owns one domain of that
simulation. The problem statement ensures the engine's scope is justified, not
assumed.

### Core Design Principles
The blueprint must declare which Architecture Principles and Architecture Manifesto
principles most directly govern the engine. Every engine is:
- **Independent** — constructable and testable in isolation (Manifesto §3, Principles §5).
- **Interface-driven** — communicates through typed public interfaces (Manifesto §2, Principles §6).
- **Event-driven** — publishes state changes through the Event Bus (Manifesto §2, Event Bus Architecture).
- **Replaceable** — consumers depend on the interface, not the implementation (Manifesto §6, Principles §6).
- **Offline-first** — runs locally without network (Manifesto §9, Persistence Architecture §5).

---

## 3. Responsibilities

### What This Engine MUST Do
The blueprint must list every responsibility the engine owns. Each responsibility
is a single sentence. Responsibilities are the engine's permanent contract — they
define what the engine is accountable for.

Rules:
- Each responsibility is a single domain concern. No responsibility spans two
  domains.
- Responsibilities are testable. Each responsibility maps to at least one unit test.
- Responsibilities are stable. They do not change without an ADR.
- Responsibilities are exclusive. If a responsibility belongs to another engine,
  it is listed in Non Responsibilities (§4).

---

## 4. Non Responsibilities

### What This Engine Is NEVER Allowed to Do
The blueprint must explicitly list what the engine does not do. This is as important
as the responsibilities list — it defines the boundary.

Permanent non-responsibilities for every engine:
- Does not render UI. The Presentation Layer renders; engines produce state.
- Does not read from or write to the database directly. The Persistence Layer owns
  storage; engines produce and consume snapshots.
- Does not receive player input directly. Player input flows through the
  Presentation Layer → Application Layer → engine interface.
- Does not import another engine's concrete implementation. Engines communicate
  through interfaces and the Event Bus.
- Does not depend on Save Engine. The dependency is one-way: Save depends on engines.
- Does not create circular dependencies. Dependencies are one-way and traceable.

Engine-specific non-responsibilities must also be listed. For example, the Time
Engine does not manage weather (that is the World Engine's domain).

---

## 5. Dependencies

### Required Engines
The blueprint must list every engine this engine depends on, with the interface
consumed and the purpose of the dependency. This must match the Engine Dependency
Graph exactly. Any conflict is resolved in favor of the Graph.

Format:
```
| Engine | Interface | Purpose |
|--------|-----------|---------|
| Time Engine | TimeEngineInterface | Time progression drives this engine's tick |
```

### Optional Engines
If the engine may optionally depend on another engine (e.g., a future engine not
yet in the canonical list), the blueprint declares it. Optional dependencies must
not create circular references and must point to engines earlier in the build order.

### Infrastructure
The blueprint must list the infrastructure services the engine uses. These are
injected, not imported as engine dependencies:
- Event Bus — for publishing and subscribing to events.
- Logger — for categorized, leveled logging.
- Configuration — for runtime tuning parameters.
- Utilities — for shared helpers with no domain logic.

### Forbidden Dependencies
The blueprint must explicitly state what the engine may never depend on:
- No engine may depend on Save Engine.
- No engine may depend on the Presentation Layer or Application Layer.
- No engine may depend on the Persistence Layer directly.
- No engine may import another engine's concrete class.
- No engine may create a circular dependency (direct or transitive).

---

## 6. Public Interface

### Public API
The blueprint must define the engine's typed public interface. This is the contract
every consumer depends on. The interface is the only thing exposed — no internals,
no private state, no implementation details.

```typescript
interface <Domain>EngineInterface {
  // Commands — mutate engine state
  // Queries — read engine state (return data, never expose internal references)
}
```

### Commands
Commands are methods that mutate the engine's state. Every command must:
- Have typed parameters (no `any`).
- Return void or a typed result (never expose internal state references).
- Be idempotent where possible — calling the same command with the same input
  produces the same result.
- Validate input and reject invalid commands with a typed error.

### Queries
Queries are methods that read the engine's state. Every query must:
- Return typed data (serializable where possible).
- Never return a reference to internal mutable state. Return a copy or a read-only
  view.
- Have no side effects. A query never mutates state.

### Events
The blueprint must list every event the engine publishes and every event it
subscribes to. Events use the `domain:subject:action` format defined in
`08_Naming_Rules.md` and the Event Bus Architecture.

Published events format:
```
| Event Name | Payload Type | When Published |
|------------|-------------|---------------|
| time:tick:started | TimeTickStartedPayload | At the start of each tick |
```

Consumed events format:
```
| Event Name | Payload Type | Handler Behavior |
|------------|-------------|-------------------|
| time:tick:started | TimeTickStartedPayload | Advance world state by one tick |
```

### Interfaces
The blueprint must declare the engine's interface type and any sub-interfaces
(e.g., a save/load sub-interface, a configuration sub-interface). All interfaces
are typed and exported from the engine's design doc.

---

## 7. Internal State

### Owned State
State the engine exclusively owns and manages. No other engine reads or writes
this state directly. Other engines access it only through the public interface or
events.

### Temporary State
State that exists only within a tick and is discarded after the tick completes.
Examples: intermediate calculation buffers, per-tick event queues. Temporary state
is never persisted.

### Persistent State
State that survives across ticks and must be saved and loaded. This state is
included in the engine's snapshot. The blueprint must declare the snapshot interface:

```typescript
interface <Domain>Snapshot {
  snapshotVersion: number;
  // persistent fields
}
```

### Calculated State
State derived from other state (owned or external). Calculated state is never
persisted — it is recomputed on load. The blueprint must list what is calculated
and from what inputs.

Rules:
- No hidden mutable globals. All state is declared in the state shape.
- No state is exposed by reference. Queries return copies or read-only views.
- State is serializable. No functions, no class instances, no circular references
  in persistent state.
- State shape is typed. Every field has an explicit type.

---

## 8. Lifecycle

The blueprint must define every phase of the engine's lifecycle. The composition
root (Application Layer) controls the lifecycle — engines do not manage each other.

### Construction
The engine is constructed with its dependencies injected:
- Required engine interfaces (from the Dependencies section).
- Infrastructure services (Event Bus, Logger, Configuration, Utilities).
- No global lookups, no singletons, no module-level mutable state.

### Initialization
After construction, `initialize()` is called. During initialization the engine:
- Subscribes to events on the Event Bus.
- Loads initial configuration.
- Sets up initial state (default values, starting conditions).
- Performs any one-time setup that cannot happen in the constructor.

### Registration
The engine is registered at the composition root. The composition root:
- Instantiates the concrete engine implementation.
- Injects dependencies.
- Calls `initialize()`.
- Registers the engine in the engine registry for the Application Layer to use.

### Tick
The engine executes once per tick, in topological order (matching the Engine
Dependency Graph). See §9 for tick behavior.

### Update
Non-tick updates (if any) — reactions to events, commands, or external stimuli
that occur outside the tick cascade. The blueprint must declare what triggers
updates and what they do.

### Pause
When the simulation is paused, the engine stops ticking. The blueprint must
declare what state is preserved during pause and what cleanup (if any) occurs.

### Resume
When the simulation resumes, the engine resumes ticking. The blueprint must
declare what state is restored and whether any re-initialization is needed.

### Shutdown
When the application is closing, `shutdown()` is called. During shutdown the engine:
- Unsubscribes from all Event Bus subscriptions.
- Releases all resources (timers, listeners, references).
- Produces a final snapshot if a shutdown save is requested.
- No handler remains registered after shutdown.

### Dispose
After shutdown, `dispose()` is called. The engine is dereferenced and eligible for
garbage collection. No state survives disposal. The blueprint must confirm that no
leaked timers, listeners, or references remain.

---

## 9. Tick Behaviour

### Execution Order
The engine's position in the tick cascade, as defined by the Engine Dependency
Graph topological order. The blueprint must state the engine's position and confirm
it matches the Graph.

### Input
What the engine reads at the start of its tick:
- Events published by earlier engines in this tick (drained from the queue).
- Queries to dependency interfaces (e.g., current time from TimeEngineInterface).
- Its own owned state from the previous tick.

### Processing
What the engine does during its tick:
- Advance its simulation state.
- Evaluate conditions and transitions.
- Produce calculated state.
- Queue events for publication.

### Output
What the engine produces during its tick:
- Events published to the Event Bus (queued, drained before the next engine runs).
- State changes visible through queries.

### Post Tick
What happens after the engine's tick completes:
- Queued events are drained by the Event Bus before the next engine runs.
- The engine's state is stable and observable for the next engine's tick.
- No engine may re-enter an earlier engine's tick.

Rules:
- One execution per tick. No engine runs twice in a single tick.
- No mid-tick re-entry. Events published during a tick are queued and processed
  in the next pass or next tick.
- Deterministic. The same inputs always produce the same outputs.

---

## 10. Event Communication

### Published Events
Every event the engine publishes, with:
- Event name (`domain:subject:action` format).
- Typed payload interface.
- When the event is published (trigger condition).
- The domain segment must match the engine's canonical name.

### Consumed Events
Every event the engine subscribes to, with:
- Event name.
- Typed payload interface.
- Handler behavior (what the engine does when it receives the event).

### Event Timing
When events are published and when they are delivered:
- Simulation events are dispatched synchronously within the tick.
- Events published during an engine's tick are queued and drained before the next
  engine runs.
- No recursive event loops. A handler may not trigger its own handler synchronously.

### Payload Rules
- Every payload is a strongly typed interface. No `any`, no `unknown` cast.
- Payloads are serializable (data only — no functions, no class instances, no
  circular references).
- Each event name has exactly one payload type. The payload type is declared in the
  blueprint.
- Payloads carry only what subscribers need. No dumping of entire engine state.

---

## 11. Save & Load

### Snapshot
The engine's serializable state. The blueprint must define the snapshot interface:

```typescript
interface <Domain>Snapshot {
  engineName: string;       // e.g., "TimeEngine"
  snapshotVersion: number;  // format version for migration
  // persistent fields
}
```

Rules:
- The snapshot contains only the engine's own state. No references to other
  engines' internal state. Cross-engine references use identifiers (e.g., entity IDs).
- The snapshot is serializable. No functions, no class instances, no circular
  references.
- The snapshot is self-describing: `engineName` and `snapshotVersion` are always
  present.

### Serialization
The `save()` method:
- Returns the engine's complete persistent state as a typed snapshot.
- Is called by the Save Engine in topological order.
- Does not modify engine state. It is a read-only operation.
- Is deterministic: the same state always produces the same snapshot.

### Deserialization
The `load(snapshot)` method:
- Restores the engine's state from a typed snapshot.
- Is called by the Save Engine in topological order (before any engine that depends
  on this one).
- Replaces all persistent state. No partial load.
- Recomputes calculated state after loading persistent state.

### Migration
The blueprint must declare the snapshot's version and the migration path:
- When the snapshot format changes, `snapshotVersion` increments.
- A migration function transforms a snapshot at version N to version N+1.
- Migrations are pure functions (no side effects, no engine state access).
- Old snapshots are migrated, never discarded. Migration failure retains the
  original snapshot.

### Validation
The blueprint must declare a `validate(snapshot)` method:
- Confirms the snapshot is structurally sound (required fields present, values in
  range, types correct).
- Is called by the Save Engine before load.
- Returns a typed validation result (valid or invalid with reasons).
- Does not modify the snapshot. Validation is non-destructive.

---

## 12. Error Handling

### Recoverable Errors
Errors the engine can handle without crashing the simulation:
- Invalid command input (rejected with a typed error).
- Missing optional dependency (engine degrades gracefully).
- Snapshot validation failure (engine rejects the load, previous state preserved).

The blueprint must list each recoverable error, the condition, and the recovery
behavior.

### Fatal Errors
Errors that prevent the engine from functioning:
- Required dependency unavailable at construction.
- Snapshot corruption that cannot be migrated.
- Internal invariant violation.

Fatal errors are:
- Logged at `error` level under the engine's category (e.g., `[time]`, `[life]`).
- Reported to the Application Layer, which decides whether to pause the simulation.
- Never silently swallowed. Every fatal error is surfaced.

### Logging
The engine uses the injected Logger. Rules:
- Category: the engine's domain name (e.g., `[time]`, `[inventory]`).
- Levels: `error`, `warn`, `info`, `debug` (per Architecture Principles §9).
- Production builds emit `error` and `warn`. Development adds `info`. `debug` is
  opt-in.
- No sensitive data in logs. No credentials, tokens, or player personal data.
- Format: `[category] level: message`.

### Fallback
When a non-critical system fails, the engine degrades gracefully:
- The simulation continues.
- The player is informed where it matters.
- The engine transitions to a known safe state.
- The failure is logged for diagnosis.

---

## 13. Performance

### Target Tick Time
The blueprint must declare the engine's target tick time budget. The tick cascade
must complete within a frame budget (e.g., 16ms for 60fps). Each engine declares
its share of that budget.

### Memory Budget
The blueprint must declare the engine's expected memory footprint:
- Baseline memory (steady-state operation).
- Peak memory (worst-case during a tick).
- Growth rate (how memory scales with entity count, world size, etc.).

### Optimization Rules
Per Architecture Principles §10:
- Correctness first. The engine is built to be correct and readable.
- Measure before optimizing. No optimization without evidence.
- Maintainability over micro-optimization. A readable O(n log n) algorithm is
  preferred over an opaque O(n) one unless measurement proves otherwise.
- Hot paths are documented. Optimized code includes a comment explaining why and
  the measurement that justified it.

### Scalability
The blueprint must declare how the engine scales:
- How does tick time grow with entity count, world size, or activity volume?
- What is the expected upper bound (e.g., 10,000 entities, 1,000 concurrent
  activities)?
- What happens if the bound is exceeded (graceful degradation, not crash)?

---

## 14. Security

### Validation
The engine validates all input:
- Commands validate parameters before mutating state.
- Events validate payloads before processing.
- Snapshots validate structure before loading.
- Invalid input is rejected with a typed error. No silent acceptance of bad data.

### Data Ownership
- Each engine owns its state. No engine reads or writes another engine's state
  directly.
- Cross-engine references use identifiers (entity IDs), not copied data.
- The `playerId` in saves identifies the owner. The Persistence Layer enforces
  ownership; engines do not.

### Offline Rules
Per Manifesto §9 and Persistence Architecture §5:
- The engine runs without a network connection.
- The engine never calls Supabase or any cloud service directly.
- The engine produces and consumes snapshots locally.
- The simulation never blocks on a network request.

### Future Multiplayer Rules
The blueprint must declare how the engine would behave in a multiplayer future:
- The engine's simulation logic does not change. It remains deterministic.
- Network events arrive as a separate event category, dispatched outside the
  simulation tick.
- The engine validates network events against its payload interfaces before
  processing.
- The engine does not need to know whether an event is local or remote.

---

## 15. Testing

### Unit Tests
Per Testing Architecture §3:
- The engine is tested in isolation with all dependencies mocked.
- No real network, no real database, no real UI.
- Mock Event Bus records published events and supports deterministic replay.
- Tests are deterministic (mock time, seeded randomness).
- Every responsibility (§3) has at least one unit test.

### Integration Tests
Per Testing Architecture §4:
- The engine is wired with real engines it depends on through a real Event Bus.
- Tests verify communication contracts: events are received with correct payloads
  in the correct order.
- Tests use mock external boundaries (network, disk, cloud).
- Tests are deterministic.

### Replay Tests
Per Testing Architecture §5:
- A recorded simulation session is replayed and the engine's output is compared to
  a golden recording.
- Same inputs must always produce identical outputs. Divergence is a test failure.
- Replay covers save snapshots: save at intervals, load each save, assert state
  matches.

### Performance Tests
Per Testing Architecture §10:
- Tick time is measured for the engine in isolation and as part of the cascade.
- Memory usage is tracked over a sustained run.
- Results are compared across builds to detect regressions.
- Tests use seeded inputs and mock time.

### Regression Tests
Per Testing Architecture §13:
- Every fixed bug becomes a permanent regression test.
- The regression test reproduces the bug with the smallest possible input.
- The test is named after the bug or the behavior that was broken.
- The test lives at the lowest layer that reproduces the bug.

---

## 16. Documentation

### Required Documents
Every engine must have:
1. **Engine Blueprint** — the design document following this standard. Stored at
   `docs/engine/blueprints/<EngineName>_Blueprint.md`.
2. **Interface Declaration** — the typed public interface, included in the blueprint.
3. **Snapshot Interface** — the save/load snapshot type, included in the blueprint.
4. **Event Catalog** — all published and consumed events, included in the blueprint.
5. **Testing Strategy** — unit, integration, replay, performance, and regression
   testing approach, included in the blueprint.

### Cross References
The blueprint must cross-reference:
- Architecture Manifesto (`docs/architecture/Architecture_Manifesto.md`)
- Architecture Principles (`docs/architecture/Architecture_Principles.md`)
- Engine Dependency Graph (`docs/architecture/Engine_Dependency_Graph.md`)
- Event Bus Architecture (`docs/architecture/Event_Bus_Architecture.md`)
- Persistence Architecture (`docs/architecture/Persistence_Architecture.md`)
- Testing Architecture (`docs/architecture/Testing_Architecture.md`)
- Engine Rules (`docs/rules/03_Engine_Rules.md`)
- Coding Rules (`docs/rules/02_Coding_Rules.md`)
- Naming Rules (`docs/rules/08_Naming_Rules.md`)
- Engine Template (`docs/engine/Engine_Template.md`)
- Blueprint Checklist (`docs/engine/Blueprint_Checklist.md`)
- Blueprint Template (`docs/engine/Blueprint_Template.md`)
- This Standard (`docs/engine/Engine_Blueprint_Standard_v1.0.md`)

### ADR
Any change to an approved (LOCKED) blueprint requires an Architecture Decision
Record. The ADR must explain:
- What is changing and why.
- What alternatives were considered.
- What the consequences are.
- Why the change does not violate the architecture.

The ADR template is defined in `docs/architecture/Architecture_Review.md`.

### Update Rules
- Before approval: the blueprint is a draft. Anyone may propose changes.
- After approval (LOCKED): changes require an ADR, Architecture Review, and Lead
  Architect approval.
- The blueprint is updated in the same change as the code. Documentation is never
  stale.
- The blueprint's version is incremented on every approved change.

---

## 17. Future Expansion

### Plugin Support
The blueprint must declare whether the engine supports plugin extensions:
- Can a plugin subscribe to this engine's events? (Yes, through the Event Bus.)
- Can a plugin publish events this engine consumes? (Yes, if the event is declared.)
- Can a plugin replace this engine? (Yes, by implementing the same interface.)
- Does the engine need to be modified to support a plugin? (No. The composition root
  registers the plugin.)

### Additional Features
Features the engine may gain in future phases without changing its core contract:
- New commands or queries (additive, interface-breaking changes require ADR).
- New events (additive, no ADR needed for new published events).
- New configuration parameters (additive).
- New calculated state (additive, no persistence change).

### Replacement Strategy
The engine is replaceable. The blueprint must confirm:
- Consumers depend on the interface, not the implementation.
- A new implementation is wired at the composition root.
- No consumer is modified when the implementation changes.
- The interface contract is honored by the replacement.

### Backward Compatibility
- Snapshot format changes require migration. Old snapshots are never discarded.
- Interface changes require an ADR and a migration path for consumers.
- Event name changes require a new event and deprecation of the old one.
- The engine's `snapshotVersion` increments on format changes.

---

## 18. Completion Checklist

An Engine Blueprint cannot be approved until every item is checked.

### Structure
- [ ] All 21 chapters are present and in order.
- [ ] Chapter numbering is sequential (1 through 21).
- [ ] No chapter is empty or marked "TBD".

### Overview (§1)
- [ ] Purpose is stated.
- [ ] Goals are listed.
- [ ] Scope is defined.
- [ ] Owner is named.
- [ ] Status is declared.
- [ ] Version is declared.

### Philosophy (§2)
- [ ] Why this engine exists is explained.
- [ ] What problem it solves is stated.
- [ ] Core design principles are referenced.

### Responsibilities (§3)
- [ ] Every responsibility is a single sentence.
- [ ] Each responsibility maps to at least one unit test.
- [ ] No responsibility spans two domains.

### Non Responsibilities (§4)
- [ ] All permanent non-responsibilities are listed.
- [ ] Engine-specific non-responsibilities are listed.

### Dependencies (§5)
- [ ] Required engines match the Engine Dependency Graph exactly.
- [ ] Each dependency lists the interface consumed and its purpose.
- [ ] Optional dependencies (if any) are declared.
- [ ] Infrastructure services are listed.
- [ ] Forbidden dependencies are stated.

### Public Interface (§6)
- [ ] The typed public interface is declared.
- [ ] Commands are listed with typed parameters.
- [ ] Queries are listed with typed return values.
- [ ] Published events are listed with payload types and trigger conditions.
- [ ] Consumed events are listed with payload types and handler behavior.

### Internal State (§7)
- [ ] Owned state is declared.
- [ ] Temporary state is declared (if any).
- [ ] Persistent state is declared with snapshot interface.
- [ ] Calculated state is declared with inputs.
- [ ] No hidden mutable globals.
- [ ] All state is typed.

### Lifecycle (§8)
- [ ] Construction (dependency injection) is defined.
- [ ] Initialization (event subscription, initial state) is defined.
- [ ] Registration at composition root is defined.
- [ ] Tick behavior is defined.
- [ ] Update (non-tick) behavior is defined (if applicable).
- [ ] Pause behavior is defined.
- [ ] Resume behavior is defined.
- [ ] Shutdown (unsubscribe, release resources) is defined.
- [ ] Dispose (no leaked references) is confirmed.

### Tick Behaviour (§9)
- [ ] Execution order matches the Engine Dependency Graph.
- [ ] Input (what the engine reads) is defined.
- [ ] Processing (what the engine does) is defined.
- [ ] Output (events and state changes) is defined.
- [ ] Post-tick (queue draining) is confirmed.
- [ ] Determinism is confirmed.

### Event Communication (§10)
- [ ] All published events use `domain:subject:action` format.
- [ ] All published events have typed payloads.
- [ ] All consumed events have typed payloads.
- [ ] Event timing (synchronous, queued) is defined.
- [ ] No recursive event loops.
- [ ] The domain segment matches the engine's canonical name.

### Save & Load (§11)
- [ ] Snapshot interface is declared with `engineName` and `snapshotVersion`.
- [ ] `save()` method is defined (returns snapshot, no side effects).
- [ ] `load(snapshot)` method is defined (restores state, recomputes calculated).
- [ ] Migration path is declared.
- [ ] `validate(snapshot)` method is defined.
- [ ] Snapshot is serializable (no functions, no class instances, no circular refs).

### Error Handling (§12)
- [ ] Recoverable errors are listed with recovery behavior.
- [ ] Fatal errors are listed with escalation behavior.
- [ ] Logging category and levels are declared.
- [ ] Fallback / graceful degradation is defined.

### Performance (§13)
- [ ] Target tick time is declared.
- [ ] Memory budget is declared.
- [ ] Optimization rules are referenced.
- [ ] Scalability bounds and growth rates are declared.

### Security (§14)
- [ ] Input validation rules are declared.
- [ ] Data ownership rules are confirmed.
- [ ] Offline rules are confirmed.
- [ ] Future multiplayer behavior is declared.

### Testing (§15)
- [ ] Unit test strategy is defined.
- [ ] Integration test strategy is defined.
- [ ] Replay test strategy is defined.
- [ ] Performance test strategy is defined.
- [ ] Regression test policy is confirmed.

### Documentation (§16)
- [ ] All required documents are listed.
- [ ] All cross-references are listed and valid.
- [ ] ADR process is referenced.
- [ ] Update rules are declared.

### Future Expansion (§17)
- [ ] Plugin support is declared.
- [ ] Additional features are listed.
- [ ] Replacement strategy is confirmed.
- [ ] Backward compatibility is confirmed.

### Final
- [ ] The blueprint follows the Blueprint Template structure.
- [ ] The blueprint passes the Blueprint Checklist.
- [ ] The blueprint passes the Review Checklist (§19).
- [ ] The Lead Architect has signed off.

---

## 19. Review Checklist

For the Lead Architect. The blueprint is not approved until every item is confirmed.

### Architecture Compliance
- [ ] The engine's dependencies match the Engine Dependency Graph exactly.
- [ ] No circular dependencies (direct or transitive).
- [ ] Dependencies point only to engines earlier in the topological build order.
- [ ] The engine communicates through interfaces, not concrete implementations.
- [ ] The engine uses the Event Bus for reactive communication.
- [ ] The engine does not import the Presentation, Application, or Persistence
      layers.
- [ ] The engine does not depend on Save Engine.
- [ ] Infrastructure services are injected, not globally imported.

### Interface Quality
- [ ] The public interface is fully typed (no `any`).
- [ ] Commands and queries are clearly separated.
- [ ] Queries have no side effects.
- [ ] Commands validate input.
- [ ] The interface exposes behavior, not internal state.

### Event Compliance
- [ ] All events use `domain:subject:action` format.
- [ ] All payloads are typed and serializable.
- [ ] The domain segment matches the engine's canonical name.
- [ ] No recursive event loops are possible.
- [ ] Published and consumed events are complete and consistent.

### State Design
- [ ] Owned, temporary, persistent, and calculated state are clearly separated.
- [ ] No hidden mutable globals.
- [ ] Persistent state is serializable.
- [ ] Calculated state is not persisted.
- [ ] State is not exposed by reference.

### Lifecycle Completeness
- [ ] Every lifecycle phase is defined (construction through disposal).
- [ ] Initialization subscribes to events.
- [ ] Shutdown unsubscribes from all events and releases resources.
- [ ] No leaked timers, listeners, or references after disposal.

### Save & Load
- [ ] Snapshot interface includes `engineName` and `snapshotVersion`.
- [ ] `save()` is read-only and deterministic.
- [ ] `load()` replaces all persistent state and recomputes calculated state.
- [ ] `validate()` is non-destructive.
- [ ] Migration path is declared.

### Testing Coverage
- [ ] Every responsibility has at least one unit test.
- [ ] Integration tests verify cross-engine communication.
- [ ] Replay tests verify determinism.
- [ ] Round-trip save tests are defined.
- [ ] Error paths are tested.

### Performance
- [ ] Tick time budget is reasonable and within the frame budget.
- [ ] Memory budget is declared and reasonable.
- [ ] No premature optimization.
- [ ] Scalability bounds are declared.

### Security
- [ ] All input is validated.
- [ ] No direct database access.
- [ ] No network calls in the simulation path.
- [ ] No sensitive data in logs or snapshots.

### Documentation
- [ ] All 21 chapters are present and complete.
- [ ] All cross-references are valid.
- [ ] No chapter is empty or marked "TBD".
- [ ] The blueprint follows the Blueprint Template.

### Visual Prototype
- [ ] Visual Prototype chapter is complete.
- [ ] Desktop, tablet, and mobile layouts are defined.
- [ ] Widget list and button list are complete.
- [ ] User interaction flow is documented.
- [ ] No gameplay logic, engine logic, backend, or database in the UI mockup.

### Final Decision
- [ ] **GO** — The blueprint is approved. It is LOCKED. Implementation may begin.
- [ ] **NO-GO** — The blueprint is rejected. Issues are listed. The blueprint must
      be revised and resubmitted.

---

## 20. Lock Policy

### After Approval
Once the Lead Architect signs the Review Checklist with a GO decision:
1. The blueprint is LOCKED.
2. The blueprint's status changes from "Draft" to "LOCKED".
3. The blueprint is added to the locked documents list.
4. Implementation may begin.

### Future Changes
Any change to a LOCKED blueprint requires:
1. **ADR** — An Architecture Decision Record explaining what is changing, why,
   what alternatives were considered, and what the consequences are. The ADR
   template is in `docs/architecture/Architecture_Review.md`.
2. **Architecture Review** — The change is reviewed for architectural compliance.
   The review verifies that the change does not violate the Architecture Manifesto,
   Architecture Principles, Engine Dependency Graph, Event Bus Architecture,
   Persistence Architecture, or Testing Architecture.
3. **Lead Architect Approval** — The Lead Architect approves or rejects the change.
   Approval is for the specific case only and does not set a precedent.

### What Cannot Change Without ADR
- The engine's dependencies (must match the Engine Dependency Graph).
- The engine's public interface (breaking changes require ADR + consumer migration).
- The engine's event names (breaking changes require new event + deprecation).
- The engine's snapshot format (requires migration path).
- The engine's responsibilities (adding or removing a responsibility requires ADR).

### What Can Change Without ADR
- Implementation details behind the interface (the blueprint's contract is unchanged).
- Internal optimizations (documented with measurement, per Architecture Principles §10).
- New published events (additive, no ADR needed).
- New configuration parameters (additive).
- Clarifications and corrections that do not change the contract.

### Version Increments
- The blueprint's version increments on every approved change.
- The snapshot's `snapshotVersion` increments on every format change.
- The interface's version is tracked through the blueprint's version.

---

## 21. Visual Prototype

### Purpose
Every engine blueprint must include a Visual Prototype chapter. The visual
prototype is a UI mockup that shows how the player interacts with this engine's
state. It is a design artifact, not an implementation. It defines what the player
sees, what they can do, and how information flows — before any UI code is written.

The visual prototype exists because a blueprint that defines only the technical
contract is incomplete. The player experiences the simulation through the UI. If
the UI is designed after the engine is built, the engine's interface may not serve
the player's needs. By designing the visual prototype alongside the technical
blueprint, the engine's public interface is validated against real player flows
before implementation begins.

**Important Rule:** This is ONLY a UI Mockup. No gameplay. No engine logic. No
backend. No database. No implementation. The visual prototype describes what the
UI looks like and how the player interacts with it. It does not define how the
engine works (that is chapters 1-20) or how the UI is implemented (that is a future
UI phase).

### Screen Objective
_(One paragraph: what the player is trying to accomplish on this screen. What
game question does this screen answer? What does the player need to see and do
here?)_

### Page Layout
_(Describe the overall page structure. Which panels are visible? Where are they
positioned? What is the visual hierarchy? Use an ASCII wireframe or a structured
description.)_

```
┌─────────────────────────────────────────────────┐
│  Header / Navigation                            │
├──────────┬──────────────────────┬───────────────┤
│  Panel A │  Main Content        │  Panel B      │
│          │                      │               │
│          │                      │               │
├──────────┴──────────────────────┴───────────────┤
│  Footer / Status Bar                            │
└─────────────────────────────────────────────────┘
```

### Panels
_(List every panel on the screen. For each panel: name, purpose, what data it
displays, and which engine queries or events feed it.)_

| Panel | Purpose | Data Source | Position |
|-------|---------|-------------|----------|
| _(name)_ | _(what it shows)_ | _(engine query or event)_ | _(layout position)_ |

### Widgets
_(List every interactive widget on the screen. For each widget: name, type, what
it displays, and what player action it captures.)_

| Widget | Type | Displays | Captures |
|--------|------|----------|----------|
| _(name)_ | _(button, slider, list, etc.)_ | _(what it shows)_ | _(what the player does)_ |

### Buttons
_(List every button. For each button: label, action it triggers, and the engine
command it dispatches.)_

| Button | Label | Dispatches |
|--------|-------|-----------|
| _(name)_ | _(visible text)_ | _(engine command)_ |

### Indicators
_(List every non-interactive indicator. Indicators display state without player
interaction.)_

| Indicator | Type | Displays | Source |
|-----------|------|----------|--------|
| _(name)_ | _(bar, icon, badge, etc.)_ | _(what it shows)_ | _(engine query or event)_ |

### Status Displays
_(List every status display area. Status displays aggregate multiple pieces of
information into a readable summary.)_

| Status Display | Location | Shows | Updates When |
|----------------|----------|-------|---------------|
| _(name)_ | _(panel)_ | _(summary content)_ | _(engine event)_ |

### Navigation
_(How the player navigates to and from this screen. What leads here? Where does
each action go? What breadcrumbs or back-button behavior exists?)_

| From | To | Trigger |
|------|----|---------|
| _(source screen)_ | _(destination screen)_ | _(button, link, or event)_ |

### Information Flow
_(Describe how information moves through the screen. What engine state feeds the
UI? What player intents flow back to the engine? How do events update the display?)_

```
Engine State → Engine Query → UI Display
                                ↓
                          Player Action
                                ↓
                          UI Intent → Engine Command → Engine State Change
                                ↓
                          Engine Event → UI Re-render
```

### User Interaction Flow
_(Step-by-step description of the primary player flow on this screen. What does the
player do first? What happens? What feedback do they see? Walk through the complete
happy path.)_

1. _(Player does X)_
2. _(UI dispatches intent Y to engine)_
3. _(Engine processes and emits event Z)_
4. _(UI re-renders to show result)_

### Desktop Layout
_(Describe the layout on desktop (1280px+). How are panels arranged? What uses
the available space? How many columns?)_

### Tablet Layout
_(Describe the layout on tablet (768px-1279px). What panels collapse, stack, or
hide? How does the layout adapt?)_

### Mobile Layout
_(Describe the layout on mobile (<768px). What panels are hidden, tabbed, or
stacked? How does the player navigate with limited screen space?)_

### Accessibility Notes
_(How does this screen meet accessibility requirements? Keyboard navigation,
screen reader support, contrast, focus management, reduced motion. Per
`docs/rules/06_UI_Rules.md` §6.)_

### Theme Notes
_(How does this screen use the project's theme? Color tokens, spacing, typography.
What visual tone does it set? Per `docs/rules/06_UI_Rules.md` §7.)_

### Animation Notes
_(What animations or transitions enhance the experience? Hover states, panel
transitions, state-change feedback. Animations must respect reduced-motion
preferences.)_

### Future Expansion
_(How might this screen grow in future phases? What panels or widgets might be
added? What must the layout accommodate without redesign?)_

---

## Closing Statement

This standard is the permanent contract between every engine blueprint and the
project's architecture.

Every engine in The Vendrith World — the 10 canonical engines and all future
additions — must follow this standard. No engine is implemented until its blueprint
passes the Completion Checklist, the Review Checklist, and the Lead Architect's
sign-off. After approval, the blueprint is LOCKED and changes require an ADR.

Every engine blueprint contains two mandatory parts: a Technical Blueprint
(chapters 1-20) and a Visual Prototype (chapter 21). Both are required. No
blueprint is approved without both.

The standard ensures that every engine is designed before it is built, that every
engine honors the architecture, and that every engine is independently testable,
replaceable, and persistent. It translates the Architecture Manifesto's philosophy
and the Architecture Principles' rules into a concrete, verifiable process. The
Visual Prototype chapter extends this to the player's experience: the UI is
designed alongside the engine, not after it.

Any change to this standard — adding a chapter, changing a checklist item, modifying
the lock policy — requires Lead Architect approval and an update to this document
before any blueprint is affected.
