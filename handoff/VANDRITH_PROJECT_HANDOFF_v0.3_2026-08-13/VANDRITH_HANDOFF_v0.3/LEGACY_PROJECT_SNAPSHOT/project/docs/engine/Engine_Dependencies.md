# Engine Dependencies

> The Vendrith World — dependency map between engines.
>
> The authoritative source for engine dependencies is
> `docs/architecture/Engine_Dependency_Graph.md`. This document is a summary
> reference; any conflict between this document and the Engine Dependency Graph is
> resolved in favor of the Graph.

## Principle
Dependencies are one-way and traceable. No circular dependencies.
An engine may depend only on engines that are already stable.

## Canonical Engine List

The project has 10 core engines. The complete list with domains and dependencies is
in `docs/architecture/Engine_Dependency_Graph.md` §2.

| Order | Engine | Depends On |
|-------|--------|------------|
| 1 | Time Engine | — |
| 2 | World Engine | Time |
| 3 | Life Engine | Time, World |
| 4 | Energy Engine | Time, Life |
| 5 | Activity Engine | Time, Life, Energy, World |
| 6 | Inventory Engine | Life, World |
| 7 | Dialogue Engine | Life, World |
| 8 | NPC AI Engine | Life, Activity, Energy, World, Dialogue, Inventory |
| 9 | Quest Engine | Activity, Life, NPC AI, World |
| 10 | Save Engine | All engines (save/load interfaces only) |

## Dependency Direction

```
Time Engine
   ↓
World Engine        ←── Time
   ↓
Life Engine         ←── Time, World
   ↓
Energy Engine       ←── Time, Life
   ↓
Activity Engine     ←── Time, Life, Energy, World
   ↓
Inventory Engine    ←── Life, World
Dialogue Engine     ←── Life, World
   ↓
NPC AI Engine       ←── Life, Activity, Energy, World, Dialogue, Inventory
   ↓
Quest Engine        ←── Activity, Life, NPC AI, World
   ↓
Save Engine         ←── All above (serialization only)
```

## Rules
- Engines never import each other's internals.
- Engines communicate through typed public interfaces only.
- Each engine is runnable and testable in isolation.
- Save Engine depends on all others for serialization, but none depend on Save.
- Infrastructure services (Event Bus, Logger, Configuration, Utilities) are
  injected, not shown as engine-to-engine dependencies.

## Dependency Matrix

| Engine | Depends On | Depended On By |
|--------|-----------|----------------|
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

## Status
Synchronized with `docs/architecture/Engine_Dependency_Graph.md` as of Phase 0.4.6.
Engine Documentation v1.0.
