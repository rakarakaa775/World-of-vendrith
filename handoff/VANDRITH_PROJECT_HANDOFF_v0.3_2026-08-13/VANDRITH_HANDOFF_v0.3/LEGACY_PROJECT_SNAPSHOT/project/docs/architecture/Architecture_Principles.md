# Architecture Principles

> The Vendrith World — the permanent technical architecture of the project.
>
> The Architecture Manifesto explains *why* the project is built the way it is.
> This document explains *how*. These principles are the concrete technical rules
> that every future engine, UI, database layer, save system, and AI assistant must
> follow. They translate the manifesto's philosophy into structural decisions.
>
> These principles are permanent. Any exception requires approval from the Lead
> Architect.

---

## 1. Layered Architecture

The project is organized into five permanent layers. Each layer has a clear
responsibility and may only communicate with the layer directly below it.

```
Presentation Layer
       ↓
Application Layer
       ↓
Engine Layer
       ↓
Persistence Layer
       ↓
Infrastructure Layer
```

### Presentation Layer
- **Responsibility:** Renders game state to the player and captures player intent.
- **What lives here:** React components, HUDs, menus, screens, input handlers.
- **What does not live here:** Simulation logic, state ownership, database access.
- The Presentation Layer reads engine state through the Application Layer and
  dispatches player intents back through it. It never touches engines or
  persistence directly.

### Application Layer
- **Responsibility:** Orchestrates the flow between the UI and the engines.
- **What lives here:** Use cases, command handlers, view models, event subscriptions
  that feed the UI.
- **What does not live here:** Simulation rules, rendering, database queries.
- The Application Layer receives intents from the Presentation Layer, calls the
  appropriate engine interfaces, and exposes reactive state for the UI to consume.
  It is the only layer the UI talks to.

### Engine Layer
- **Responsibility:** Runs the simulation. Holds and mutates game state.
- **What lives here:** Time Engine, World Engine, Life Engine, Energy Engine,
  Activity Engine, Inventory Engine, Dialogue Engine, NPC AI Engine, Quest Engine,
  Save Engine, and all future engines. The authoritative engine list is in
  `docs/architecture/Engine_Dependency_Graph.md`.
- **What does not live here:** Rendering, database access, player input handling.
- Engines expose typed public interfaces. They communicate with each other through
  declared dependencies and events. They are independently constructable and
  testable in isolation.

### Persistence Layer
- **Responsibility:** Serializes and deserializes engine state. Owns the database
  client.
- **What lives here:** Save Manager, Supabase client, local storage adapters,
  migration runners.
- **What does not live here:** Simulation logic, gameplay rules.
- The Persistence Layer calls engine save/load interfaces. Engines do not call the
  Persistence Layer. This is the only layer that talks to Supabase.

### Infrastructure Layer
- **Responsibility:** Provides cross-cutting platform services.
- **What lives here:** Event bus, logging, configuration, timing, platform APIs.
- **What does not live here:** Domain logic, game state.
- Infrastructure services are injected into engines and the application layer. They
  have no knowledge of game concepts.

### Rules
- No layer may bypass another. The Presentation Layer never calls the Engine Layer
  directly. The Engine Layer never calls the Persistence Layer directly.
- Layers are directional: a higher layer may depend on the layer directly below it,
  never on a layer above it, and never on a non-adjacent layer below it except as
  explicitly permitted by the Dependency Direction section.
- The number of layers is fixed at five. New systems are placed into an existing
  layer, not into a new one.

---

## 2. Dependency Direction

Dependencies always point downward.

```
Presentation → Application → Engine → Persistence → Infrastructure
```

- An upper layer may depend on the layer directly below it.
- A lower layer may never depend on an upper layer.
- A layer may not skip a layer to depend on a non-adjacent one, except:
  - The Engine Layer may depend on Infrastructure (event bus, logging, timing) —
    this is the only permitted skip, because infrastructure services are
    cross-cutting and injected, not imported as domain dependencies.
- **Circular dependency is permanently forbidden.** No engine, module, or layer may
  depend — directly or transitively — on a system that depends on it.
- Dependencies between engines are one-way and declared in the engine's design doc
  and in `docs/engine/Engine_Dependencies.md`. An engine may depend only on engines
  that are already stable.

This rule exists because circular dependencies make systems impossible to reason
about, test in isolation, or replace. The downward direction is what makes every
other principle in this document possible.

---

## 3. Separation of Concerns

Each module owns exactly one responsibility.

- **UI never owns simulation.** A React component does not decide whether a day
  passes or whether energy depletes. It displays the result and forwards the
  player's intent.
- **Simulation never owns rendering.** An engine does not know whether a HUD is
  visible, what color a bar is, or whether a menu is open. It produces state; the UI
  consumes it.
- **Persistence never owns gameplay.** The Save Manager does not decide what a
  "day" means or how energy is calculated. It serializes what the engines produce
  and restores it on load.

A module that has two responsibilities is two modules. When a responsibility
changes for a different reason than the other, it belongs in its own module. This is
the Single Responsibility Principle applied to the project's architecture.

---

## 4. Composition over Inheritance

Prefer composition. Avoid deep inheritance trees. Favor interfaces and contracts.

- Systems are assembled from smaller, focused pieces — not derived from base
  classes through multiple levels.
- An engine that needs time information receives a `TimeEngineInterface`, not a
  `TimeEngine` class. It depends on the contract, not the implementation.
- Shared behavior is extracted into standalone modules and composed, not pushed up
  into a shared parent class.
- Inheritance is used only when there is a genuine, stable "is-a" relationship
  known at design time. Even then, composition is preferred.

This principle exists because deep inheritance trees couple unrelated changes: a
modification to a base class ripples to every descendant. Composition isolates
change. A module is replaced by swapping a dependency, not by rewriting a class
hierarchy.

---

## 5. Dependency Injection

Systems receive dependencies. They never search for them globally.

- An engine is constructed with its dependencies passed in — the event bus, the
  time engine interface, the logger. It does not import a singleton, reach for a
  global, or read from module-level state.
- The Application Layer assembles engines and injects their dependencies at
  startup. This is the composition root — the only place where concrete
  implementations are wired together.
- In tests, dependencies are replaced with mocks or stubs. Because dependencies
  are injected, no test needs to reach into a global registry or patch a module.

This principle exists because hidden dependencies create coupling that is
invisible at the call site. A system that finds its own dependencies cannot be
tested in isolation, cannot be replaced, and cannot be reasoned about without
reading its entire implementation. Injection makes the dependency graph explicit.

---

## 6. Interface Driven Development

Every major subsystem exposes clear interfaces. Implementations may change.
Interfaces remain stable.

- Each engine defines a typed public interface (e.g., `TimeEngineInterface`,
  `SaveEngineInterface`) declared in its design doc. The interface is the contract
  every consumer depends on.
- The implementation behind the interface may be rewritten, optimized, or replaced
  entirely. As long as the interface contract is honored, no consumer is affected.
- Interfaces are versioned through the design doc, not through the code. When an
  interface must change, the design doc is updated first, the change is reviewed, and
  the migration path is documented before any consumer is modified.
- Interfaces expose behavior, not state. An engine's internal state shape is not
  part of its public contract. Consumers call methods and subscribe to events; they
  do not read engine fields directly.

This principle exists because a stable interface is what makes a system
replaceable. When consumers depend on interfaces, the implementation is free to
evolve. When consumers depend on implementations, every change is a breaking
change.

---

## 7. Plugin Ready

Every future engine should be installable or removable with minimal impact. The
architecture should support future plugins.

- An engine is registered with the Application Layer at the composition root.
  Removing an engine means unregistering it and removing its event subscriptions —
  not editing the internals of other engines.
- An engine declares its dependencies through interfaces. Adding a new engine does
  not require modifying existing engines, as long as the new engine depends on
  existing interfaces, not on existing implementations.
- Future plugin scenarios — modding, expansion content, community systems — are
  supported by this structure: a plugin implements the same engine interfaces and
  registers through the same composition root.
- No engine is hard-wired into another engine. The dependency graph is declared, not
  implicit.

This principle exists because a platform that requires restructuring to add a new
system is not a platform. The Vendrith World is designed for years of expansion.
New engines, new worlds, and new systems should extend the project, not redesign it.

---

## 8. Error Philosophy

Fail safely. Report clearly. Never silently ignore critical failures. Prefer
graceful degradation.

- **Fail safely.** When a system encounters an error, it transitions to a known safe
  state rather than continuing with corrupted or partial state. A failed save does
  not leave the game in an ambiguous state; it preserves the last known-good state.
- **Report clearly.** Errors are surfaced with enough context to diagnose the cause:
  which system, what operation, what input. A bare `catch` that swallows the error
  and continues is not acceptable for critical paths.
- **Never silently ignore critical failures.** A critical failure — a save that
  cannot be written, an engine that cannot initialize, a migration that cannot run —
  is reported to the player and the developer. It is not buried in a log and
  forgotten.
- **Prefer graceful degradation.** When a non-critical system fails (a cloud sync
  fails, an optional asset is missing), the core simulation continues. The player is
  informed where it matters; the experience degrades gracefully where it does not.

This principle exists because how a system fails matters as much as how it succeeds.
A system that fails silently corrupts trust. A system that fails catastrophically
on every minor error is unusable. Safe failure with clear reporting is the balance.

---

## 9. Logging Philosophy

Logs exist to help developers. No unnecessary logging. Meaningful categories.
Consistent formatting.

- **Purpose.** A log entry helps a developer understand what happened, diagnose a
  bug, or trace a flow. If a log entry does not serve one of those purposes, it is
  removed.
- **Categories.** Every log entry is tagged with its source system: `[time]`,
  `[life]`, `[save]`, `[ui]`, `[infra]`. A developer can filter by category to follow
  a single system's behavior.
- **Levels.** Four levels: `error`, `warn`, `info`, `debug`. Production builds emit
  `error` and `warn`. Development builds add `info`. `debug` is opt-in, used for
  deep tracing, and never shipped to production.
- **Formatting.** `[category] level: message` — consistent, parseable, and
  machine-readable where possible. No ad-hoc formats per system.
- **No sensitive data.** Logs never contain credentials, tokens, or player
  personal data.

This principle exists because logging is a tool, not a habit. Unstructured,
excessive logging obscures the signal a developer needs. Categorized, leveled,
consistent logging makes a system observable without making it noisy.

---

## 10. Performance Philosophy

Optimize only after correctness. Measure before optimizing. Maintainability has
higher priority than micro-optimizations.

- **Correctness first.** A system is built to be correct and readable. Performance
  is not considered until the system works and is tested.
- **Measure before optimizing.** No optimization is made without evidence that it is
  needed — a profile, a benchmark, a frame-time spike. Intuition about performance is
  not a justification.
- **Maintainability over micro-optimization.** A readable O(n log n) algorithm is
  preferred over an opaque O(n) one, unless measurement proves the difference matters.
  The cost of a clever optimization is paid by every future contributor who must
  understand it.
- **Hot paths are documented.** When a section of code is optimized for a measured
  reason, the reason and the measurement are documented in the engine's design doc.
  Future contributors know why the code looks unusual and what constraint it serves.

This principle exists because premature optimization is the root of maintainability
problems. It trades a future cost (understandability) for a present benefit (speed)
that is often imaginary. We optimize what we can prove is slow, and we document why.

---

## 11. Scalability

Architecture must support years of expansion. New systems extend the project. They
do not redesign existing systems.

- **Additive engines.** A new engine is added to the Engine Layer, declares its
  dependencies on existing engine interfaces, and registers at the composition root.
  No existing engine is modified to accommodate it.
- **Additive content.** New world content, activities, and systems are added through
  data and configuration, not through changes to engine code. The engines are
  general; the content is specific.
- **Additive UI.** New views and screens are composed from existing components and
  wired to existing application-layer interfaces. A new feature does not require a
  new architectural pattern.
- **No rewrites for growth.** If adding a feature requires restructuring the
  architecture, the architecture was wrong, or the feature is in the wrong layer. The
  response is to revisit the design, not to restructure the project.

This principle exists because the project's success is measured over years. An
architecture that must be redesigned for each new system cannot scale. An
architecture that absorbs new systems additively can grow indefinitely.

---

## 12. Future Compatibility

Architecture should allow the following without major restructuring:

- **New Engines** — added to the Engine Layer, implementing the engine template,
  declaring dependencies on existing interfaces, registering at the composition root.
- **New Worlds** — a new world is a data set, not a codebase. Engines are
  world-agnostic; world content is loaded, not compiled.
- **New AI** — a new AI assistant reads the Rule Books, the Architecture Manifesto,
  and this document, then follows the same workflow. No architectural change is
  needed to add a contributor.
- **New Save Formats** — the Save Engine serializes through a versioned format. A
  new format is a new serializer implementing the same save/load contract. Old saves
  are migrated, not discarded.
- **New UI** — the Presentation Layer may be rebuilt (React → another framework)
  without touching the Application, Engine, or Persistence layers, as long as the
  new UI consumes the same application-layer interfaces.

This principle exists because the technologies, tools, and systems of today will
not all be the ones of tomorrow. An architecture that is locked to a specific
implementation of any layer is an architecture with an expiration date. We design
for replaceability at every boundary.

---

## Closing Statement

These principles are permanent.

They are not guidelines. They are not suggestions. They are the technical
architecture of The Vendrith World, and every future engine, UI, database layer,
save system, and AI assistant must follow them. They translate the Architecture
Manifesto's philosophy into concrete structural rules: how the layers connect, how
dependencies flow, how systems communicate, how errors are handled, and how the
project grows.

Any exception to these principles requires approval from the Lead Architect. An
exception is not a precedent — it applies to the specific case and does not weaken
the principle for the rest of the project. When in doubt, return to the Architecture
Manifesto for the *why* and to this document for the *how*.
