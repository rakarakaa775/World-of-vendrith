# Documentation Glossary

> The Vendrith World — definitions of every important project term.
>
> Canonical reference for terminology used across all documentation.

---

## A

### ADR (Architecture Decision Record)
A structured document that records a significant architectural decision: the context,
the decision, the alternatives considered, and the consequences. ADRs are required
to modify any LOCKED document. See `docs/architecture/Architecture_Review.md` for the
template and lifecycle.

### Activity Engine
The 5th canonical engine. Manages actions, tasks, crafting, travel, and rest.
Depends on Time, Life, Energy, World. Depended on by NPC AI and Quest.

### Application Layer
The 2nd layer in the 5-layer architecture. Orchestrates engines, manages
gameplay state, and mediates between the Presentation Layer and the Engine Layer.
May use the Engine Layer and Infrastructure Layer.

### Architecture Manifesto
The philosophical foundation of the project — 12 principles that define the spirit
and intent behind every technical decision. Located at
`docs/architecture/Architecture_Manifesto.md`. LOCKED.

### Architecture Principles
The technical translation of the Architecture Manifesto — 12 concrete principles
and the 5-layer architecture. Located at
`docs/architecture/Architecture_Principles.md`. LOCKED.

### Architecture Review
The audit document that reviewed all architecture against all Rule Books, issued a
GO decision, and established the ADR template and LOCK procedure. Located at
`docs/architecture/Architecture_Review.md`.

### Asset
Any visual, audio, or data resource used in the game: sprites, models, textures,
audio files, icons, fonts. Assets flow through the Asset Pipeline from inbox to
registry to core/expansion to archive.

### Asset Pipeline
The documented flow from asset creation to integration:
Inbox → Review → Registry → Core/Expansion → Game Ready → Archive.
Defined in `docs/assets/Asset_Pipeline.md`.

---

## B

### Blueprint
A detailed design document for an engine or system, created before implementation.
Each blueprint follows the Engine Template (`docs/engine/Engine_Template.md`) and
must be approved by the Lead Architect before code is written. Blueprints are
created in Phase 0.5+.

### Build Order
The topological order in which engines are designed and built. An engine is only
added when every engine it depends on is stable. The canonical build order is:
Time → World → Life → Energy → Activity → Inventory → Dialogue → NPC AI → Quest
→ Save. Defined in `docs/architecture/Engine_Dependency_Graph.md`.

---

## C

### Canonical
The authoritative, official version of something. The canonical engine list is the
10 engines defined in the Engine Dependency Graph. Any conflict between documents
is resolved in favor of the canonical source.

### Composition Root
The single place in the application where concrete engine implementations are
instantiated and wired together. Everywhere else, engines are referenced by their
interface. This is what makes engines replaceable.

### Composition over Inheritance
A principle favoring small, composable units over deep inheritance hierarchies.
Engines are composed at the composition root, not inherited from base classes.

### Cross-Reference
A link from one document to another that establishes a relationship. All
cross-references in the documentation system must point to existing documents.
The cross-reference hub is `docs/rules/README.md`.

---

## D

### DAG (Directed Acyclic Graph)
A graph where edges point in one direction and no cycles exist. The engine
dependency graph is a DAG — dependencies always point toward earlier, stable
engines, never backward.

### Dialogue Engine
The 7th canonical engine. Manages conversations, dialogue trees, and responses.
Depends on Life and World. Depended on by NPC AI.

### Dependency Direction
The rule that dependencies always point downward in the layer hierarchy.
Presentation → Application → Engine → Persistence → Infrastructure.
The only permitted skip is Engine → Infrastructure.

### Dependency Injection
The practice of providing an engine or service with its dependencies through
their constructor or interface, rather than having it import them directly.
This makes engines testable in isolation and replaceable.

---

## E

### Energy Engine
The 4th canonical engine. Manages energy/fatigue, regeneration, and depletion.
Depends on Time and Life. Depended on by Activity and NPC AI.

### Engine
An independent, single-responsibility system that manages one domain of the
simulation. Engines communicate through typed public interfaces and the event bus.
They never import each other's internals. The 10 canonical engines are defined in
the Engine Dependency Graph.

### Engine Dependency Graph
The authoritative source for the canonical engine list and all engine
dependencies. Located at
`docs/architecture/Engine_Dependency_Graph.md`. LOCKED. This is the single
source of truth for engine relationships.

### Engine Documentation v1.0
The synchronized set of engine documents (Template, Order, Dependencies) that
reference the Engine Dependency Graph as authoritative. Synchronized in
Phase 0.4.6.

### Event
A typed message published on the Event Bus when an engine's state changes.
Events use the `domain:subject:action` naming format (e.g.,
`time:day:advanced`). Other engines and the application layer subscribe to
events they care about.

### Event Bus
The Infrastructure Layer service that provides publish/subscribe event transport
between engines and the application layer. The Event Bus does not know what
events mean — it is a transport layer, not a domain layer. Defined in
`docs/architecture/Event_Bus_Architecture.md`.

### Event-Driven Communication
The principle that engines react to each other through events, not by polling or
calling mutation methods directly. An engine emits an event; interested systems
subscribe and react.

---

## F

### Foundation v1.0
The locked foundation document that records the complete project structure,
documentation system, Rule Books, GitHub integration, progress system, AI
workspace, and asset pipeline. Located at
`docs/project/Foundation_v1.0.md`. LOCKED.

### Future Engine Integration
The process for adding new engines without modifying existing ones. A new engine
declares dependencies on existing interfaces, registers at the composition root,
and places itself in the correct build order. No existing engine is modified.

---

## I

### Infrastructure Layer
The 5th and bottom layer in the 5-layer architecture. Contains cross-cutting
services: Event Bus, Logger, Configuration, Utilities. These services have no
knowledge of game concepts and are injected, not imported globally.

### Interface-Based Communication
The principle that engines communicate exclusively through typed public
interfaces (e.g., `TimeEngineInterface`). No engine imports another engine's
concrete class, internal state, or private helpers.

### Inventory Engine
The 6th canonical engine. Manages items, equipment, containers, and ownership.
Depends on Life and World. Depended on by NPC AI.

---

## L

### Layer
One of the five levels in the architecture: Presentation, Application, Engine,
Persistence, Infrastructure. Dependencies flow downward only.

### Life Engine
The 3rd canonical engine. Manages living entities, attributes, aging, and
mortality. Depends on Time and World. Depended on by Energy, Activity,
Inventory, Dialogue, NPC AI, Quest.

### LOCK
A status applied to documents that cannot be changed without an ADR and Lead
Architect approval. The LOCK Procedure is defined in
`docs/architecture/Architecture_Review.md`. 15 documents are currently locked.

### LOCK Procedure
The formal process for modifying a LOCKED document: (1) write an ADR explaining
the change, (2) get Lead Architect approval, (3) update the document, (4) update
all cross-references. Defined in `docs/architecture/Architecture_Review.md`.

---

## N

### NPC AI Engine
The 8th canonical engine. Manages decision-making, behavior, and goals for NPCs.
Depends on Life, Activity, Energy, World, Dialogue, Inventory. Depended on by
Quest. The most connected engine in the dependency graph.

### Naming Convention
The standards for naming folders, files, code, database objects, engines, events,
and assets. Defined in `docs/rules/08_Naming_Rules.md`. The event naming format is
`domain:subject:action`.

---

## O

### Offline-First
The principle that the core simulation runs locally and does not require a network
connection. Online services (Supabase, cloud sync) extend the experience but do
not define it. The game is fully playable offline.

### One-Way Dependency
The rule that engine dependencies always point toward earlier, stable engines.
No engine may depend on an engine that depends on it (directly or transitively).
The dependency graph is a DAG.

---

## P

### Persistence Architecture
The document defining how game data is saved, loaded, migrated, synchronized,
validated, and protected. Located at
`docs/architecture/Persistence_Architecture.md`. LOCKED.

### Persistence Layer
The 4th layer in the 5-layer architecture. Handles storage and retrieval of
game state. Separated from the Save Engine by a storage interface so backends are
swappable (Supabase, local storage, etc.).

### Phase
A numbered stage of development with a single focus. Phases are sequential — each
must be signed off before the next begins. Phase 0 is Foundation, Phase 0.4 is
Architecture, Phase 0.5 is Engine Blueprint Master, Phase 1+ is implementation.

### Plugin
A module that extends the application without modifying existing code. The
architecture is plugin-ready: new engines register at the composition root and
subscribe to existing events. No existing engine is modified to accommodate a
new one.

### Presentation Layer
The 1st and top layer in the 5-layer architecture. Renders the UI and receives
player input. Never touches the database directly — communicates through the
Application Layer.

---

## Q

### Quest Engine
The 9th canonical engine. Manages quest tracking, objectives, and rewards.
Depends on Activity, Life, NPC AI, World. Depended on by Save (save/load only).

---

## R

### Registry
The single source of truth for asset metadata. Every asset that enters the
project is recorded in the registry with its metadata, license, and status.
Defined in `docs/rules/05_Asset_Rules.md`.

### Rule Book
One of eight permanent, locked documents that define the standards for the
entire project. The eight Rule Books are: Project, Coding, Engine, Database,
Asset, UI, AI, Naming. Indexed at `docs/rules/README.md`.

---

## S

### Save Engine
The 10th canonical engine. Manages serialization and deserialization of all game
state. Depends on all engines through save/load interfaces only. No engine
depends on Save. Built last, after every other engine is stable.

### Simulation
The systemic, tick-based model of the game world. The simulation advances in
discrete ticks; each engine updates its state per tick and emits events. Gameplay
emerges from the interaction of simulation systems, not from hand-authored scripts.

### Single Source of Truth
The principle that each piece of information has one authoritative location. For
engine dependencies, the single source of truth is the Engine Dependency Graph.
For asset metadata, the registry. For project state, `docs/ai/Project_State.md`.

### Snapshot
A serializable representation of an engine's state at a point in time. Each
engine defines a `save()` method that returns a snapshot and a `load(data)` method
that restores state from a snapshot. The Save Engine calls these methods.

### Sprint
A focused unit of work with a single goal. Sprints are logged in
`docs/progress/Sprint_Log.md`. Each sprint has a status, focus, done list, and
notes.

---

## T

### Task Queue Engine
_(Obsolete — removed in Phase 0.4.6.)_ This engine was previously listed in
placeholder documents but was never part of the canonical engine list. All
references have been removed.

### Tick
A discrete unit of simulation time. On each tick, the Event Bus dispatches queued
events and engines update their state. The tick is the heartbeat of the
simulation cascade. The Time Engine drives the tick.

### Time Engine
The 1st canonical engine. Manages time progression, day/night cycles, and the
calendar. Has no engine dependencies. Drives the tick-based simulation. Depended
on by World, Life, Energy, Activity.

### Testing Architecture
The document defining the permanent testing strategy: a 3-layer pyramid (Unit,
Integration, Simulation Replay), determinism enforcement, CI pipeline, and
coverage policy. Located at `docs/architecture/Testing_Architecture.md`. LOCKED.

### Topological Build Order
See Build Order.

---

## W

### World Engine
The 2nd canonical engine. Manages regions, environment, weather, and world state.
Depends on Time. Depended on by Life, Activity, Inventory, Dialogue, NPC AI, Quest.

### World Bible
The canonical world-building document: lore, regions, factions, cultures, history,
characters. Currently a placeholder — created alongside the gameplay that needs
it, starting at Phase 3. Located at `docs/world/README.md`.
