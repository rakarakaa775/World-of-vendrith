# Development Context

> Standing context the AI agent must load before any task.

## Project
- **Name:** The Vendrith World
- **Genre:** Open World Medieval Fantasy Life Simulation RPG
- **Stack:** React, TypeScript, Vite, Tailwind CSS, Supabase, GitHub, Replit

## Phase
Phase 0.5.0.1 — Visual Prototype Standard v1.0 (COMPLETE). All architecture documents
are locked. Engine Documentation v1.0 is synchronized with Architecture v1.0.
Engine Blueprint Standard v1.0 is established (21 chapters: Technical Blueprint +
Visual Prototype). UI Prototype Standard v1.0 is established (16 sections).
Documentation system is complete (57 documents, 40 completed, 12 placeholders, 15
locked). GO decision issued. Implementation may begin.

## Rules
- See `docs/rules/` for all standards. The Rule Book index is at `docs/rules/README.md`.
- Read `Current_Task.md` and `Project_State.md` before starting work.
- Update `Sprint_Log.md` after finishing work.
- All eight Rule Books are complete: Project, Coding, Engine, Database, Asset, UI, AI, Naming.

## Architecture
- Architecture Manifesto: `docs/architecture/Architecture_Manifesto.md` — 12 philosophical principles.
- Architecture Principles: `docs/architecture/Architecture_Principles.md` — 12 technical principles, 5 layers.
- Engine Dependency Graph: `docs/architecture/Engine_Dependency_Graph.md` — 10 engines, topological build order.
- Event Bus Architecture: `docs/architecture/Event_Bus_Architecture.md` — tick-based simulation, pub/sub, typed payloads.
- Persistence Architecture: `docs/architecture/Persistence_Architecture.md` — save/load, offline-first, migration, validation.
- Testing Architecture: `docs/architecture/Testing_Architecture.md` — 3-layer pyramid, determinism, CI, coverage.
- Architecture Review: `docs/architecture/Architecture_Review.md` — audit, Go/No-Go (GO), ADR template, LOCK procedure.
- All 6 architecture documents are LOCKED. Changes require ADR + Lead Architect approval.
- Modular, independent systems. No circular dependencies. Strong TypeScript typing throughout.
- `@/` path alias maps to `src/`.
- Engines communicate through typed public APIs and events (`domain:subject:action` format).
- 5 layers: Presentation → Application → Engine → Persistence → Infrastructure.
- Engine may skip to Infrastructure (only permitted skip). All other dependencies downward only.
- UI is a thin layer over engines — never touches the database directly.
- Core simulation runs offline; online services extend, not define.

## Engine Documentation
- Engine Documentation v1.0 is synchronized with Architecture v1.0.
- `docs/engine/Engine_Dependencies.md` references the Engine Dependency Graph as authoritative.
- `docs/engine/Engine_Order.md` lists the canonical 10-engine build order.
- `docs/engine/Engine_Template.md` defines the 9-section template every engine blueprint must follow.
- `docs/engine/Engine_Blueprint_Standard_v1.0.md` defines the 21-chapter permanent standard for every engine blueprint (Technical Blueprint chapters 1-20 + Visual Prototype chapter 21).
- `docs/engine/Blueprint_Checklist.md` is the reusable completion checklist (includes Visual Prototype items).
- `docs/engine/Blueprint_Template.md` is the clean reusable 21-chapter template.
- `docs/ui/UI_Prototype_Standard.md` defines the permanent standard for every Visual Prototype chapter (16 sections).
- The canonical 10 engines: Time, World, Life, Energy, Activity, Inventory, Dialogue, NPC AI, Quest, Save.

## Documentation System
- 57 total documents across 11 domains. 40 completed, 12 placeholders, 15 locked.
- Documentation Status: `docs/project/Documentation_Status.md`
- Documentation Map: `docs/project/Documentation_Map.md`
- Documentation Glossary: `docs/project/Documentation_Glossary.md`
- All cross-references verified. No orphans, no broken links.
- All numbering sequential and correct.

## Foundation
- Foundation v1.0 is LOCKED (`docs/project/Foundation_v1.0.md`).
- Database documentation: schema, ERD, migration log (templates only).
- Asset documentation: pipeline, checklist, style guide (empty, ready for use).

## Next Objective
Phase 0.5.1 — Time Engine Blueprint. Design the first engine blueprint following the
Engine Blueprint Standard v1.0 (21 chapters: Technical Blueprint + Visual Prototype),
using the Blueprint Template, Blueprint Checklist, and UI Prototype Standard. The Time
Engine is first in the topological build order with no dependencies. It is the heartbeat
of the tick-based simulation. Documentation only — no engine code. Requires Lead
Architect sign-off and locking of the Engine Blueprint Standard v1.0 and UI Prototype
Standard v1.0.
