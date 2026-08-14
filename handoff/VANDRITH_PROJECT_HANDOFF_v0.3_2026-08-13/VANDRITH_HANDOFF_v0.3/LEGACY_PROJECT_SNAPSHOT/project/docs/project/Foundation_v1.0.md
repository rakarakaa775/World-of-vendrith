# Foundation v1.0

> The Vendrith World — Foundation Version v1.0
>
> Status: **LOCKED**

---

## Project
The Vendrith World — Open World Medieval Fantasy Life Simulation RPG

## Foundation Version
v1.0

## Status
LOCKED

---

## What Foundation v1.0 Contains

### 1. Folder Structure
A complete, professional project layout:
- `docs/` — all project documentation, organized by domain.
- `src/assets/` — asset folders (inbox, registry, core, expansions, generated, archive).
- `public/` — static public assets.
- `supabase/` — Supabase project configuration (placeholder for future use).

The folder structure is fixed. New folders require Lead Architect approval and documentation.

### 2. Documentation
A full documentation system spanning every project domain:
- **Rules** (`docs/rules/`) — eight Rule Books plus an official index.
- **Roadmap** (`docs/roadmap/`) — master roadmap and milestone placeholders.
- **Progress** (`docs/progress/`) — phase, sprint log, completed features, changelog, known issues.
- **AI** (`docs/ai/`) — project state, current sprint, current task, development context, next task.
- **Engine** (`docs/engine/`) — engine template, build order, dependency map.
- **Database** (`docs/database/`) — schema template, ERD template, migration log.
- **Assets** (`docs/assets/`) — pipeline, checklist, style guide.
- **Project** (`docs/project/`) — phases, workflow, milestones, goals, vision, Foundation v1.0.
- **Architecture** (`docs/architecture/`) — added in Phase 0.4. Manifesto, Principles, Engine Dependency Graph, Event Bus, Persistence, Testing, Architecture Review. All LOCKED.
- **Blueprint** (`docs/blueprint/`) — placeholder for future system designs.
- **World** (`docs/world/`) — placeholder for the World Bible.

### 3. Rule Books
Eight permanent, locked Rule Books defining the standards for the entire project:
1. Project Rules — decisions, breaking changes, documentation standards, sprint discipline.
2. Coding Rules — TypeScript standards, imports, file organization, error handling, testing.
3. Engine Rules — philosophy, independence, lifecycle, template, dependencies, events, testing, persistence, versioning.
4. Database Rules — philosophy, naming, schema, migrations, integrity, performance, security, backup, documentation.
5. Asset Rules — philosophy, pipeline, registry, folders, licensing, naming, quality, AI-generated assets.
6. UI Rules — philosophy, layering, state, components, responsive design, accessibility, theme, performance.
7. AI Rules — philosophy, working memory, documentation-first, escalation, single source of truth, Git workflow, collaboration.
8. Naming Rules — general principles, folders, files, code, database, engines, events, assets, documentation.

The official index is at `docs/rules/README.md`.

### 4. GitHub Integration
The project is structured for Git-based collaboration:
- Small, focused commits — one logical change each.
- Documentation updated in the same change as code.
- No commits with failing builds.
- GitHub sync after every completed task.

### 5. Progress System
A living record of project state:
- `Current_Phase.md` — the active phase and its exit criteria.
- `Sprint_Log.md` — chronological log of completed sprints.
- `Completed_Features.md` — what has been built and verified.
- `Changelog.md` — notable changes, newest first.
- `Known_Issues.md` — active issues and watch items.

### 6. AI Workspace
Working memory for AI-assisted development:
- `Project_State.md` — snapshot of the project's current state.
- `Current_Sprint.md` — the active sprint and its focus.
- `Current_Task.md` — the single task in progress.
- `Development_Context.md` — standing context loaded before any task.
- `Next_Task.md` — the proposed next task, pending Lead Architect sign-off.

### 7. Asset Pipeline
A documented pipeline from creation to integration:
- Inbox → Review → Registry → Core/Expansion → Game Ready → Archive.
- No asset skips review.
- Registry is the single source of truth.
- AI-generated assets tracked separately.
- Licensing recorded before any asset is promoted.

---

## Principle

Future development should build on this foundation rather than redesign it.

- The folder structure is fixed.
- The Rule Books are locked.
- The documentation system is established.
- The workflow is defined.

When changes to the foundation are necessary, they follow the Decision Rules and
Breaking Changes Policy in `01_Project_Rules.md`. A foundation change requires Lead
Architect approval and must be documented before it takes effect.

---

## Next Milestone

Phase 0.5 — Engine Blueprint Master. Design detailed blueprints for each of the 10
core engines using the Engine Template, in topological build order. No engine code —
blueprints only. First engine: Time Engine.

---

## Engine Documentation v1.0

Engine Documentation v1.0 is synchronized with Architecture v1.0 as of Phase 0.4.6.

- `docs/engine/Engine_Dependencies.md` references the Engine Dependency Graph as the
  authoritative source for engine dependencies.
- `docs/engine/Engine_Order.md` lists the canonical 10-engine build order matching
  the Engine Dependency Graph.
- `docs/engine/Engine_Template.md` defines the 9-section template every engine
  blueprint must follow.
- The canonical 10 engines: Time, World, Life, Energy, Activity, Inventory, Dialogue,
  NPC AI, Quest, Save.
- No obsolete Schedule Engine or Task Queue references remain in any document.

---

## Documentation System Complete

As of Phase 0.4.7 — Documentation Polish, the documentation system is complete:

- **53 total documents** across 10 domains.
- **36 completed** with real content.
- **12 placeholders** standardized with PLACEHOLDER blocks (Purpose, Future Owner,
  Phase, Status, Expected Completion).
- **15 locked** documents (8 Rule Books + 6 architecture + Foundation v1.0).
- **0 blocking issues.** All numbering, cross-references, and engine references verified.
- Documentation Status tracker: `docs/project/Documentation_Status.md`
- Documentation Map (visual hierarchy): `docs/project/Documentation_Map.md`
- Documentation Glossary (terminology): `docs/project/Documentation_Glossary.md`
- All cross-references verified — no orphan documents, no broken links.
- All section numbering sequential and correct.
- All engine references use the canonical 10-engine list.

---

## Engine Blueprint Standard v1.0

As of Phase 0.5.0 — Engine Blueprint Standard, the permanent standard for every
engine blueprint is established:

- `docs/engine/Engine_Blueprint_Standard_v1.0.md` — 21-chapter standard defining
  the mandatory structure, content, and approval process for every engine blueprint.
  Chapters 1-20 define the Technical Blueprint. Chapter 21 defines the Visual Prototype.
  Both are mandatory. No blueprint is approved without both.
- `docs/engine/Blueprint_Checklist.md` — reusable completion checklist copied into
  every engine blueprint (includes Visual Prototype items).
- `docs/engine/Blueprint_Template.md` — clean reusable template with all 21 chapters.
- `docs/ui/UI_Prototype_Standard.md` — permanent standard for every Visual Prototype
  chapter. Defines layout, panel, widget, card, button, status, color, spacing,
  typography, responsive, accessibility, animation, and naming rules.
- The standard references all architecture documents, all relevant Rule Books, and
  the Engine Dependency Graph as canonical sources.
- After Lead Architect approval, the standard will be LOCKED. Future changes require
  ADR + Architecture Review + Lead Architect Approval.
- Every future engine blueprint must follow this standard without exception.
- Every future engine blueprint MUST contain: Technical Blueprint (chapters 1-20)
  AND Visual Prototype (chapter 21). Both are mandatory.
- Total documents: 57 (3 new engine documents + 1 new UI document added).
