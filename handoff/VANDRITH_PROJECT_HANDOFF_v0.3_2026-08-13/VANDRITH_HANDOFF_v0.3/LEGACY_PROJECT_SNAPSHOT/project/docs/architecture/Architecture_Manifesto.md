# Architecture Manifesto

> The Vendrith World — the architectural philosophy of the project.
>
> This document is not a rule book. It does not prescribe naming conventions, folder
> structure, or code standards — those live in `docs/rules/`. This document explains
> *why* the project is built the way it is. It is the philosophical foundation that
> every future architectural decision should align with.

---

## 1. Engine First

Simulation always comes before presentation.

The world is governed by independent simulation engines — time, life, activity,
energy, and more. These engines are the source of truth for the game state. The UI
is a consumer of that state. It reads what the engines produce and dispatches
intents back to them. It never decides what happens; the engines do.

This principle exists because a life-simulation RPG is only as deep as the systems
that drive it. If the simulation is real, the gameplay emerges from it. If the
simulation is shallow, no amount of UI polish can compensate. We build the
simulation first, and let the presentation follow.

**Implication:** No gameplay feature is built before its engine exists. No UI
component is built before the engine API it consumes is defined.

---

## 2. Event Driven

Systems communicate through events whenever possible. Direct coupling is avoided.

When an engine's state changes, it emits an event. Other engines and the UI
subscribe to the events they care about. They do not call each other's internals.
They do not poll for changes. They react.

This principle exists because direct coupling makes systems fragile. When system A
reaches into system B's internals, a change in B breaks A. Events invert this: B
announces what happened, and A decides whether to care. Each system stays
independent, and the dependency graph stays one-way and traceable.

**Implication:** Engines expose events through their public API. Subscribers
depend on the event contract, not on the emitting engine's internals. The event
naming format defined in `08_Naming_Rules.md` — `domain:subject:action` — is the
single, permanent event contract.

---

## 3. Modular by Default

Every system should be independently replaceable. Modules should evolve without
rewriting the entire project.

An engine is a module. A manager is a module. A UI component is a module. Each has
one responsibility, a typed public interface, and no hidden dependencies on
another module's internals. A module can be swapped, upgraded, or rewritten without
forcing a rewrite of its neighbors — because its neighbors depend on its interface,
not its implementation.

This principle exists because a long-term project outlives its early decisions.
The first implementation of any system will not be the last. Modularity ensures
that replacing one system is a contained change, not a project-wide crisis.

**Implication:** Modules expose typed interfaces. Dependencies are declared and
injected, not reached for. No module imports another module's internals.

---

## 4. Documentation Before Code

Architecture is designed before implementation. Documentation is treated as part
of the product.

Before any system is built, its design is written down: its purpose, its
interface, its state shape, its lifecycle, its dependencies, its testing strategy.
The design is reviewed and approved. Only then is code written. This mirrors the
Decision Rules in `01_Project_Rules.md`: Idea → Discussion → Documentation →
Approval → Implementation.

This principle exists because code written without design accumulates technical
debt faster than it accumulates features. A design doc forces the hard questions
to be answered before the easy code is written. It also gives future contributors
a map of the system as it was intended, not just as it evolved.

**Implication:** No engine is implemented before its design doc is approved. No
schema is migrated before its documentation is updated. Documentation is updated in
the same change as the code, not as an afterthought.

---

## 5. Single Source of Truth

Every domain has exactly one authoritative source. No duplicated documentation.
No conflicting implementations.

The rules live in `docs/rules/`. The roadmap lives in `docs/roadmap/`. The database
schema lives in `docs/database/`. The engine designs live in `docs/engine/`. The
asset registry lives in `src/assets/registry/`. Each domain has one home, and that
home is the only place its truth is defined.

This principle exists because duplicated truth drifts. When the same fact lives in
two places, one of them is eventually wrong, and the wrong one is eventually
trusted. A single source of truth eliminates that failure mode.

**Implication:** When information is needed, the authoritative source is read.
When information changes, the authoritative source is updated. No shadow docs, no
parallel notes, no copy-pasted truth.

---

## 6. Replaceable Systems

Every major subsystem should be replaceable. Changing one subsystem should have
minimal impact on others.

The Time Engine could be swapped for a different implementation. The Save Engine
could be replaced with a different persistence strategy. The UI could be rebuilt
without touching the simulation. The database could be migrated without rewriting
the engines. This is not because we plan to replace these systems, but because the
*ability* to replace them is the measure of a clean architecture.

This principle exists because the systems that survive are the ones that can
adapt. A system that cannot be replaced cannot be upgraded without risk. A system
that can be replaced can be improved with confidence.

**Implication:** Subsystems depend on interfaces, not implementations. The
boundary between subsystems is a typed contract, not an implicit assumption.
Replacing a subsystem means implementing the same contract, not rewriting its
consumers.

---

## 7. Testability

Every system should be independently testable. Testing is part of design, not an
afterthought.

An engine is designed to be constructed in isolation, with its dependencies
injected and its side effects observable. It does not reach for global state. It
does not require a running database to test its simulation logic. It does not
require a UI to verify its state transitions.

This principle exists because untestable systems are unverifiable, and
unverifiable systems are unsafe to change. If a system cannot be tested in
isolation, every change to it is a gamble. Testability is what makes a system
maintainable over the long term.

**Implication:** Engines are constructed with their dependencies passed in, not
reached for. Tests live alongside the systems they test. Mocks replace external
boundaries (persistence, network), not internal logic. The testing strategy is
defined in the engine's design doc, not added after implementation.

---

## 8. Scalability

The architecture should support growth. Never optimize only for the first
playable version. Design for future expansion.

The project will grow: more engines, more systems, more content, more
contributors. The architecture must absorb that growth without restructuring. New
engines are added without rewriting existing ones. New content is added without
touching simulation code. New UI views are composed from existing components.

This principle exists because optimizing for the first playable version creates a
ceiling. The systems that get to v0.1 fastest are often the ones that cannot get
past v0.2. We design for the project this will become, not just the slice it is
today.

**Implication:** The engine list is additive. The component system is additive.
The database schema is additive. New systems extend the architecture; they do not
redefine it. Performance work is justified by evidence, not premature intuition.

---

## 9. Offline First

Core simulation should run without network access. Online services extend
functionality. They do not define it.

The simulation engines — time, life, activity, energy, schedule — run locally.
They do not require a network connection to tick, to process player actions, or to
advance state. Online services (Supabase, cloud saves, future multiplayer) extend
the experience: persisting saves, syncing across devices, sharing world state. They
are layers on top of the simulation, not dependencies of it.

This principle exists because a simulation that requires a network connection is
a simulation that can stop working at any moment. The player's world should not
pause because a server is unreachable. The core experience is local; the network
is an enhancement.

**Implication:** Engines do not call Supabase directly. The persistence layer
owns the database client and calls engine save/load interfaces. A save can be
written to local storage when the network is unavailable. The simulation never
blocks on a network request.

---

## 10. Long-Term Maintainability

Prefer maintainable systems over clever systems. Readability is more valuable than
short-term optimization.

Code is read more than it is written. A system that is easy to understand is easy
to fix, easy to extend, and easy to hand off. A system that is clever but opaque is
a liability. We choose clarity over brevity, explicit over implicit, and boring
over novel — because boring systems survive.

This principle exists because this project is built for years, not weeks. The
contributor who writes a system will not always be the one who maintains it.
Maintainability is what makes the project sustainable.

**Implication:** No clever abstractions that obscure intent. No premature
optimization that sacrifices readability. No patterns that require tribal
knowledge to understand. The codebase is written for the next contributor, not for
the current author.

---

## 11. Human Control

AI assists development. Humans own the vision. Final architectural decisions
belong to the Lead Architect.

AI accelerates implementation, documentation, and review. It does not set the
project's direction. It does not approve breaking changes. It does not decide the
architecture. An AI may propose; a human approves. This is defined in detail in
`07_AI_Rules.md`.

This principle exists because AI is a tool, not a team member. Tools do not own
projects. The vision, the priorities, and the final calls belong to the humans
responsible for the outcome.

**Implication:** AI follows the Rule Books and this manifesto. AI escalates
structural decisions to the Lead Architect. AI never makes architectural decisions
autonomously, no matter how small they seem.

---

## 12. Respect Existing Foundations

Foundation v1.0 is LOCKED. Architecture builds upon Foundation. It does not
redesign Foundation.

The folder structure, the Rule Books, the documentation system, the progress
system, and the AI workspace are established. They are not provisional. They are
not open for redesign. Future architecture works within this foundation and
extends it. When a foundation change is genuinely necessary, it follows the
Decision Rules and Breaking Changes Policy in `01_Project_Rules.md` and requires
Lead Architect approval.

This principle exists because the foundation is the project's stability. If the
foundation is open for reinterpretation, nothing built on top of it is stable. We
lock the foundation so that everything above it can be ambitious.

**Implication:** No architect, AI or human, redesigns the folder structure, the
Rule Books, or the documentation system without approval. Architecture extends;
it does not restructure.

---

## Closing Statement

The Vendrith World is designed as a long-term software platform, not merely a
single game.

The engines, the event system, the persistence layer, the UI, and the asset
pipeline are not built to ship one release. They are built to support years of
growth: new systems, new content, new contributors, and new technologies. The
architecture prioritizes independence, replaceability, and maintainability over
speed of delivery, because the project's success is measured over years, not
sprints.

Future contributors — human and AI alike — should understand this philosophy
before implementing any feature. A feature that contradicts this manifesto is a
feature that will not scale, will not maintain, and will not survive. When in
doubt, return to these principles. They are the architectural compass for
everything that follows.
