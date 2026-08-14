# Engine Dependency Graph

> The Vendrith World — the official dependency map of every core engine.
>
> This document is the only authoritative source describing how engines depend on
> each other. Future engine blueprints must follow this document. It translates the
> Architecture Manifesto and Architecture Principles into a concrete, permanent
> contract for engine relationships.

---

## 1. Core Principles

### One-Way Dependencies
Dependencies always point in one direction. An engine may depend only on engines
that are already stable — engines built and approved earlier in the build order.
The dependency graph is a directed acyclic graph (DAG), never a cycle.

### Circular Dependencies Are Forbidden
No engine may depend — directly or transitively — on an engine that depends on it.
A circular dependency makes a system impossible to construct in isolation, test in
isolation, or replace independently. This is a permanent architectural rule, not a
guideline.

### Interface-Based Communication
Engines communicate with each other exclusively through typed public interfaces
(e.g., `TimeEngineInterface`, `LifeEngineInterface`). An engine never imports
another engine's concrete class, internal state, or private helpers. When an
engine's implementation is rewritten, every consumer is unaffected because it
depends on the contract, not the implementation.

### Event-Driven Communication
When an engine's state changes in a way other systems should react to, it emits an
event through the event bus. Other engines and the application layer subscribe to
the events they care about. Engines do not poll each other for state. They do not
call each other's mutation methods directly except through the declared dependency
interface. The event naming format — `domain:subject:action` — is defined in
`08_Naming_Rules.md` and is permanent.

### Implementations Are Never Referenced Directly
At the composition root (the Application Layer), concrete engine implementations are
instantiated and wired together. Everywhere else in the codebase, engines are
referenced by their interface. No engine, UI component, or persistence module
imports a concrete engine class. This is what makes every engine replaceable.

---

## 2. Canonical Engine List

The following ten engines are the planned core engines for The Vendrith World.

| Order | Engine | Domain | Depends On |
|-------|--------|--------|------------|
| 1 | Time Engine | Time progression, day/night, calendar | — |
| 2 | World Engine | Regions, environment, weather, world state | Time |
| 3 | Life Engine | Living entities, attributes, aging, mortality | Time, World |
| 4 | Energy Engine | Energy/fatigue, regeneration, depletion | Time, Life |
| 5 | Activity Engine | Actions, tasks, crafting, travel, rest | Time, Life, Energy, World |
| 6 | Inventory Engine | Items, equipment, containers, ownership | Life, World |
| 7 | Dialogue Engine | Conversations, dialogue trees, responses | Life, World |
| 8 | NPC AI Engine | Decision-making, behavior, goals for NPCs | Life, Activity, Energy, World, Dialogue, Inventory |
| 9 | Quest Engine | Quest tracking, objectives, rewards | Activity, Life, NPC AI, World |
| 10 | Save Engine | Serialization and deserialization of all state | All engines (save/load interfaces only) |

Additional engines may be added later without changing existing dependency rules.
A new engine declares its dependencies on existing engine interfaces and registers
at the composition root. No existing engine is modified to accommodate it. See
Section 6.

---

## 3. Official Dependency Graph

### Topological Build Order

Engines are designed and built in dependency order. An engine is only added when
every engine it depends on is stable.

```
1. Time Engine
2. World Engine
3. Life Engine
4. Energy Engine
5. Activity Engine
6. Inventory Engine
7. Dialogue Engine
8. NPC AI Engine
9. Quest Engine
```

The Save Engine is built last and is defined separately in Section 4.

### Dependency Flow Diagram

```
                    Time Engine
                   /     |      \
                  v      v       v
           World Engine  |       |
              |    |     |       |
              v    v     v       |
         Life Engine    |       |
         /    |    \    |       |
        v     v     v  v       |
  Energy Eng  |     |   |       |
     |        v     |   |       |
     |  Activity Eng |   |       |
     |     /    |     |  |       |
     |    v     v     v |       |
     |  Inventory Eng  | |       |
     |  Dialogue Eng   | |       |
     |     |     |     | |       |
     |     v     v     v v       |
     |   NPC AI Engine           |
     |        |                  |
     |        v                   |
     |   Quest Engine             |
     |                            |
     v                            v
              Save Engine (depends on all, through save/load interfaces)
```

### Dependency Edges

Each edge lists the dependent engine, the interface it consumes, and the purpose
of the dependency.

**Time Engine** — no engine dependencies.
- *Depended on by:* World, Life, Energy, Activity, NPC AI (indirectly)

**World Engine** — depends on:
- `TimeEngineInterface` — world state advances with time (weather cycles, day/night, seasonal changes).
- *Depended on by:* Life, Activity, Inventory, Dialogue, NPC AI, Quest

**Life Engine** — depends on:
- `TimeEngineInterface` — living entities age with time.
- `WorldEngineInterface` — entities exist within the world and its regions.
- *Depended on by:* Energy, Activity, Inventory, Dialogue, NPC AI, Quest

**Energy Engine** — depends on:
- `TimeEngineInterface` — energy regenerates and depletes over time.
- `LifeEngineInterface` — energy belongs to living entities.
- *Depended on by:* Activity, NPC AI

**Activity Engine** — depends on:
- `TimeEngineInterface` — activities have duration measured in time.
- `LifeEngineInterface` — activities are performed by living entities.
- `EnergyEngineInterface` — activities cost or restore energy.
- `WorldEngineInterface` — activities occur in world locations.
- *Depended on by:* NPC AI, Quest

**Inventory Engine** — depends on:
- `LifeEngineInterface` — inventory is owned by living entities.
- `WorldEngineInterface` — items exist in the world (ground, containers, shops).
- *Depended on by:* NPC AI

**Dialogue Engine** — depends on:
- `LifeEngineInterface` — dialogue occurs between living entities.
- `WorldEngineInterface` — dialogue context references world state (location, factions).
- *Depended on by:* NPC AI

**NPC AI Engine** — depends on:
- `LifeEngineInterface` — the NPC's own attributes and state.
- `ActivityEngineInterface` — available actions the NPC can choose from.
- `EnergyEngineInterface` — the NPC's current energy constrains decisions.
- `WorldEngineInterface` — environmental awareness (location, weather, threats).
- `DialogueEngineInterface` — the NPC can initiate or respond to conversations.
- `InventoryEngineInterface` — the NPC can manage items and equipment.
- *Depended on by:* Quest

**Quest Engine** — depends on:
- `ActivityEngineInterface` — quest objectives involve activities (travel, craft, kill).
- `LifeEngineInterface` — quest givers and targets are living entities.
- `NPCAIEngineInterface` — NPCs drive quest progression (assign, monitor, complete).
- `WorldEngineInterface` — quest objectives reference world locations and state.
- *Depended on by:* Save Engine (save/load only)

### Dependency Matrix

| Engine | Depends On | Depended On By |
|--------|------------|----------------|
| Time | — | World, Life, Energy, Activity |
| World | Time | Life, Activity, Inventory, Dialogue, NPC AI, Quest |
| Life | Time, World | Energy, Activity, Inventory, Dialogue, NPC AI, Quest |
| Energy | Time, Life | Activity, NPC AI |
| Activity | Time, Life, Energy, World | NPC AI, Quest |
| Inventory | Life, World | NPC AI |
| Dialogue | Life, World | NPC AI |
| NPC AI | Life, Activity, Energy, World, Dialogue, Inventory | Quest |
| Quest | Activity, Life, NPC AI, World | Save (save/load only) |
| Save | All engines (save/load interfaces) | — |

---

## 4. Save Engine

The Save Engine is defined separately because its dependency pattern is unique.

### Rules
- **Save Engine depends on all engines only through Save/Load interfaces.** Each
  engine defines a `save()` method that returns a serializable snapshot of its state
  and a `load(data)` method that restores state from a snapshot. The Save Engine
  calls these methods. It does not read engine internals directly.
- **No engine may depend on Save Engine.** The dependency is strictly one-way: Save
  depends on engines, never the reverse. An engine does not know whether a save is
  in progress, when the last save occurred, or what format was used. It only knows
  how to produce and consume its own snapshot.
- **Save Engine never owns gameplay logic.** It does not decide what a "day" means,
  how energy is calculated, or whether a quest is complete. It serializes what the
  engines produce and restores it on load. Gameplay rules live in the engines; the
  Save Engine is a transport layer for state.
- **Save format is versioned.** Each snapshot includes a format version. When the
  format changes, a migration path is documented before the old format is retired.
  Old saves are migrated, never discarded.

### Position in the Graph
```
All Engines
     |
     v (save/load interfaces only)
Save Engine
     |
     v
Persistence Layer (Supabase, local storage)
```

The Save Engine is the bridge between the Engine Layer and the Persistence Layer.
It is built last, after every other engine is stable, so it can serialize all
prior state.

---

## 5. Infrastructure Dependencies

All engines may use shared infrastructure services. These are Infrastructure Layer
services, not engine-to-engine dependencies. They are injected at the composition
root, not imported as domain dependencies.

| Service | Purpose | Layer |
|---------|---------|-------|
| Event Bus | Publish/subscribe event transport between engines and the application layer | Infrastructure |
| Logger | Categorized, leveled logging (see Architecture Principles §9) | Infrastructure |
| Configuration | Runtime configuration, feature flags, tuning parameters | Infrastructure |
| Utilities | Shared helpers (math, formatting, ID generation) with no domain logic | Infrastructure |

### Rules
- Infrastructure dependencies are not shown in the engine dependency graph. They
  are cross-cutting and available to every engine.
- Infrastructure services have no knowledge of game concepts. The Event Bus does
  not know what `time:day:advanced` means. The Logger does not know what an engine
  is. Configuration does not import engine types.
- Infrastructure services are injected, not imported globally. An engine receives
  the event bus, logger, and configuration in its constructor — it does not reach
  for a singleton.
- An infrastructure service may be replaced (e.g., a new logger, a different event
  bus implementation) without affecting any engine, because engines depend on the
  infrastructure interface, not the implementation.

---

## 6. Future Engine Integration

New engines are added to the project without modifying existing engines.

### Rules for Adding a New Engine
1. **Depend only on existing interfaces.** A new engine declares its dependencies
   on the public interfaces of existing engines. It never imports a concrete
   implementation.
2. **Never create circular references.** The new engine's dependencies must point
   to engines that are already stable and earlier in the build order. The new
   engine must not be depended on by any engine it depends on.
3. **Existing engines should not require modification.** A new engine is registered
   at the composition root and subscribes to existing events. If adding an engine
   requires editing an existing engine's code, the dependency graph is too tightly
   coupled and the design must be revisited.
4. **Place the engine in the correct build order.** The new engine is inserted into
   the topological order after every engine it depends on. Its position is recorded
   in the Canonical Engine List and the Dependency Matrix.
5. **Write the design doc first.** No new engine is implemented before its design
   doc — following the Engine Template in `docs/engine/Engine_Template.md` — is
   approved by the Lead Architect.
6. **Declare events.** The new engine declares what events it emits and what events
   it subscribes to, using the `domain:subject:action` format.

### Example: Adding a Weather Engine
A future Weather Engine might depend on `TimeEngineInterface` and
`WorldEngineInterface`. It would be placed after World in the build order. It would
emit events like `weather:state:changed`. No existing engine would be modified.
World might subscribe to weather events, but only if World's design doc already
anticipated it — otherwise, the Weather Engine's events are consumed by the
application layer and the UI.

---

## 7. Dependency Validation

Every engine design doc must pass this checklist before implementation begins. The
Lead Architect signs off on the checklist as part of design approval.

### Validation Checklist

- [ ] **No circular dependency.** The engine does not depend — directly or
  transitively — on any engine that depends on it.
- [ ] **Interface-based communication.** Every dependency is declared as a typed
  interface. No concrete engine class is imported.
- [ ] **Event-driven communication.** State changes that other systems should react
  to are emitted as events through the event bus. No engine polls another engine.
- [ ] **Downward dependency only.** Every dependency points to an engine earlier in
  the topological build order. No dependency points upward.
- [ ] **Save Engine isolated.** The engine defines `save()` and `load()` methods.
  It does not depend on Save Engine. Save Engine calls the engine, never the
  reverse.
- [ ] **Infrastructure separated.** Infrastructure services (event bus, logger,
  configuration, utilities) are injected, not imported as engine-to-engine
  dependencies. They are not shown in the dependency graph.
- [ ] **Design doc approved.** The engine's design doc follows the Engine Template,
  declares its dependencies, events, and testing strategy, and is signed off by the
  Lead Architect.

---

## Closing Statement

This graph is the permanent architectural contract for engine relationships.

Every engine in The Vendrith World is positioned in this graph. Every dependency is
declared, one-way, and interface-based. The graph is a directed acyclic graph — no
cycles, no upward edges, no implicit couplings. The Save Engine is isolated,
depending on all engines through save/load interfaces and depended on by none.

Future engine blueprints must follow this document. A new engine is added by
declaring dependencies on existing interfaces, registering at the composition root,
and placing itself in the correct position in the topological order. No existing
engine is modified to accommodate a new one.

Any change to this graph — adding an engine, reordering dependencies, or removing an
edge — requires Lead Architect approval and an update to this document before any
engine design or implementation begins.
