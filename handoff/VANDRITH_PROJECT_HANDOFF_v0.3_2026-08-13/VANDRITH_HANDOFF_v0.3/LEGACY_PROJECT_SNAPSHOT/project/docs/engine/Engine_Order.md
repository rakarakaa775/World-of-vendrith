# Engine Order

> The Vendrith World — the order in which engines are designed and built.
>
> The authoritative source for the canonical engine list and build order is
> `docs/architecture/Engine_Dependency_Graph.md` §2 and §3. This document is a
> summary reference; any conflict is resolved in favor of the Graph.

## Principle
Engines are built one at a time, each designed and documented before implementation.
An engine is only added when the engines it depends on are stable.

## Canonical Build Order

Engines are designed and built in topological dependency order. The Save Engine is
built last, after every other engine is stable, so it can serialize all prior state.

| Order | Engine | Depends On | Status |
|-------|--------|------------|--------|
| 1 | Time Engine | — | Not started |
| 2 | World Engine | Time | Not started |
| 3 | Life Engine | Time, World | Not started |
| 4 | Energy Engine | Time, Life | Not started |
| 5 | Activity Engine | Time, Life, Energy, World | Not started |
| 6 | Inventory Engine | Life, World | Not started |
| 7 | Dialogue Engine | Life, World | Not started |
| 8 | NPC AI Engine | Life, Activity, Energy, World, Dialogue, Inventory | Not started |
| 9 | Quest Engine | Activity, Life, NPC AI, World | Not started |
| 10 | Save Engine | All engines (save/load interfaces) | Not started |

## Notes
- Time is the substrate most engines tick against. It is the heartbeat of the
  tick-based simulation cascade.
- World is built second because Life, Activity, Inventory, Dialogue, NPC AI, and
  Quest all depend on it.
- Save Engine is built last so it can serialize all prior state through save/load
  interfaces. No engine depends on Save.
- Each engine is designed with a blueprint following
  `docs/engine/Engine_Template.md` before implementation begins.
- No engine code exists yet. Engine blueprints are created in Phase 0.5.

## Status
Synchronized with `docs/architecture/Engine_Dependency_Graph.md` as of Phase 0.4.6.
Engine Documentation v1.0.
