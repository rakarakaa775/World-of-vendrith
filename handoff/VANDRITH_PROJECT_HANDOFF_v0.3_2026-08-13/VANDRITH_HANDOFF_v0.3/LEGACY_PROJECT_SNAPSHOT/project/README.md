# The Vendrith World

> An Open World Medieval Fantasy Life Simulation RPG.

The Vendrith World is a persistent, systemic medieval fantasy life-simulation RPG.
The world runs on independent simulation engines — time, life, activity, and more —
and gameplay emerges from the interaction of those systems rather than from
hand-authored scripts.

---

## Current Phase

**Phase 0.5.10.6 — Save Engine Blueprint v1.0 (COMPLETE — READY FOR LOCK)**

**Status:**
- All 10 engine blueprints complete (21 chapters each)
- NPC AI Engine Blueprint v1.0 — LOCKED
- Quest Engine Blueprint v1.0 — LOCKED
- Save Engine Blueprint v1.0 — READY FOR LOCK
- All tracking documents synchronized
- Build verification passed

**Blueprint Completion: 10/10 (100%)**

| # | Engine | Blueprint | Status |
|---|--------|-----------|--------|
| 1 | Time Engine | Time Engine Blueprint v1.0 | LOCKED |
| 2 | World Engine | World Engine Blueprint v1.0 | LOCKED |
| 3 | Life Engine | Life Engine Blueprint v1.0 | LOCKED |
| 4 | Energy Engine | Energy Engine Blueprint v1.0 | LOCKED |
| 5 | Activity Engine | Activity Engine Blueprint v1.0 | LOCKED |
| 6 | Inventory Engine | Inventory Engine Blueprint v1.0 | LOCKED |
| 7 | Dialogue Engine | Dialogue Engine Blueprint v1.0 | LOCKED |
| 8 | NPC AI Engine | NPC AI Engine Blueprint v1.0 | LOCKED |
| 9 | Quest Engine | Quest Engine Blueprint v1.0 | LOCKED |
| 10 | Save Engine | Save Engine Blueprint v1.0 | READY FOR LOCK |

**Next Milestone:**
Phase 0.6 — Engine Implementation (first engine code, starting with Time Engine)

---

## Documentation Overview

The project documentation is organized into 11 domains, with 57 total documents:

| Domain | Path | Purpose | Status |
|--------|------|---------|--------|
| Rules | `docs/rules/` | 8 Rule Books + index — standards for every contributor and system | Complete (LOCKED) |
| Architecture | `docs/architecture/` | Manifesto, Principles, Engine Dependency Graph, Event Bus, Persistence, Testing, Review | Complete (LOCKED) |
| Engine | `docs/engine/` | Engine Template, build order, dependency map, Blueprint Standard (21 ch), Checklist, Template | Complete (synchronized v1.0 + Standard v1.0) |
| UI | `docs/ui/` | UI Prototype Standard | Complete (Standard v1.0) |
| Database | `docs/database/` | Schema, ERD, Migration Log | Placeholder |
| Assets | `docs/assets/` | Pipeline, Checklist, Style Guide | 2 complete, 1 placeholder |
| Project | `docs/project/` | Phases, Workflow, Foundation, Milestones, Goals, Vision, Doc Status/Map/Glossary | 7 complete, 2 placeholders |
| Progress | `docs/progress/` | Changelog, Sprint Log, Completed Features, Known Issues, Current Phase | Complete |
| Roadmap | `docs/roadmap/` | Master Roadmap + milestone plans (v0.1, v0.2, Early Access, Release) | 1 complete, 4 placeholders |
| AI | `docs/ai/` | Project State, Current Sprint, Current Task, Development Context, Next Task | Complete |
| Blueprint | `docs/engine/blueprints/` | 10 Engine Blueprints (21 chapters each) | Complete (LOCKED) |
| World | `docs/world/` | World Bible | Placeholder |

Key reference documents:
- **Documentation Status:** `docs/project/Documentation_Status.md` — completion tracker
- **Documentation Map:** `docs/project/Documentation_Map.md` — visual hierarchy
- **Documentation Glossary:** `docs/project/Documentation_Glossary.md` — terminology
- **Foundation v1.0:** `docs/project/Foundation_v1.0.md` — foundation lock document

---

## Architecture Overview

The Vendrith World uses a 5-layer architecture with 10 independent simulation engines:

**Layers (top to bottom):**
1. Presentation — React UI, player input
2. Application — orchestration, gameplay state
3. Engine — 10 independent simulation systems
4. Persistence — save/load, storage interface
5. Infrastructure — Event Bus, Logger, Configuration, Utilities

**Canonical 10 Engines (build order):**
1. Time Engine — time progression, day/night, calendar
2. World Engine — regions, environment, weather
3. Life Engine — living entities, attributes, aging
4. Energy Engine — energy/fatigue, regeneration
5. Activity Engine — actions, tasks, crafting, travel
6. Inventory Engine — items, equipment, containers
7. Dialogue Engine — conversations, dialogue trees
8. NPC AI Engine — NPC decision-making, behavior, goals
9. Quest Engine — quest tracking, objectives, rewards
10. Save Engine — serialization of all state (built last)

**Key principles:**
- One-way dependencies (DAG — no cycles)
- Interface-based communication (no concrete imports)
- Event-driven (pub/sub through Event Bus, `domain:subject:action` format)
- Offline-first (core simulation runs locally)
- Each engine independently testable and replaceable

The authoritative source for engine relationships is
`docs/architecture/Engine_Dependency_Graph.md`.

---

## Foundation v1.0

The Foundation is complete and locked. It contains:
- Folder structure
- Documentation system (57 documents across 11 domains)
- Eight Rule Books (01–08)
- GitHub integration
- Progress system
- AI workspace
- Asset pipeline documentation

Future development builds on this foundation rather than redesigning it.
See `docs/project/Foundation_v1.0.md` for the full lock document.

---

## Technology Stack

| Layer       | Technology |
|-------------|------------|
| UI          | React, Tailwind CSS, Lucide React |
| Language    | TypeScript (strict) |
| Build       | Vite |
| Backend     | Supabase (PostgreSQL) |
| Version Control | GitHub |
| Environment | Replit |

---

## Folder Overview

```
The Vendrith World/
├── docs/                  # All project documentation
│   ├── ai/                # AI agent working memory
│   ├── architecture/      # Architecture manifesto and principles (LOCKED)
│   ├── engine/blueprints/  # 10 Engine Blueprints (21 chapters each, LOCKED)
│   ├── database/          # Schema, ERD, migration log (placeholders)
│   ├── engine/            # Engine template, order, dependencies, Blueprint Standard (21 ch)
│   ├── ui/                # UI Prototype Standard
│   ├── progress/          # Phase, sprint log, changelog, issues
│   ├── project/           # Phases, workflow, milestones, goals, vision, docs
│   ├── roadmap/           # Master roadmap and milestone plans
│   ├── rules/             # 8 Rule Books (01–08) — LOCKED
│   └── world/             # World Bible (placeholder)
├── public/                # Static public assets
├── src/
│   ├── assets/
│   │   ├── archive/        # Deprecated assets kept for reference
│   │   ├── core/           # Approved core-game assets
│   │   ├── expansions/     # Expansion-scoped assets
│   │   ├── generated/      # AI / procedurally generated assets
│   │   ├── inbox/          # Raw incoming assets awaiting review
│   │   └── registry/       # Asset manifest and metadata
│   └── ...                 # Source code (engines, UI, systems — to come)
└── supabase/              # Supabase project configuration (placeholder)
```

---

## Development Philosophy

- **Foundation before feature.** Structure and standards come first; gameplay comes later.
- **Modular architecture.** Each system is independent, single-responsibility, and replaceable.
- **No circular dependencies.** Dependency direction is one-way and traceable.
- **Strong typing.** TypeScript strict mode throughout; no `any` by default.
- **Documentation is code.** Docs live in the repository and evolve with the project.
- **One focus per phase.** Scope creep is the enemy; each sprint has one clear goal.
- **Reversible milestones.** Every phase is reviewable and can be rolled back.

---

## Current Status

**Phase:** Foundation (v1.0 LOCKED) + Architecture (v1.0 LOCKED) + Engine Blueprints (10/10 COMPLETE)

- [x] Folder structure created
- [x] Documentation foundation in place
- [x] All eight Rule Books complete
- [x] Foundation synchronized
- [x] Foundation v1.0 locked
- [x] Architecture Manifesto
- [x] Architecture Principles
- [x] Engine Dependency Graph
- [x] Event Bus Architecture
- [x] Persistence Architecture
- [x] Testing Architecture
- [x] Architecture Review (GO decision issued)
- [x] Engine Documentation synchronized with Architecture v1.0
- [x] Documentation system polished and finalized
- [x] Documentation Status, Map, and Glossary created
- [x] Engine Blueprint Standard v1.0 (21 chapters: Technical Blueprint + Visual Prototype)
- [x] UI Prototype Standard v1.0
- [x] All 10 Engine Blueprints complete (21 chapters each)
- [x] NPC AI Engine Blueprint v1.0 — LOCKED
- [x] Quest Engine Blueprint v1.0 — LOCKED
- [x] Save Engine Blueprint v1.0 — READY FOR LOCK
- [ ] Engine implementation *(next phase — Phase 0.6)*
- [ ] Database schema *(future milestone)*
- [ ] Authentication *(future milestone)*
- [ ] Gameplay *(future milestone)*

All 10 engine blueprints are authored with 21 chapters each. No engine
implementation, database schema, or authentication exists yet — documentation only.
