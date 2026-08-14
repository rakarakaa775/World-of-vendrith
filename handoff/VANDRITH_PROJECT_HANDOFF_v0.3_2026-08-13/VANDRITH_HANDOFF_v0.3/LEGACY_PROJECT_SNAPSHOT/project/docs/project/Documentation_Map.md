# Documentation Map

> The Vendrith World — visual hierarchy of the entire documentation tree.
>
> Shows every folder, every document, and the relationships between domains.

---

## Tree View

```
The Vendrith World/
│
├── README.md                              # Project overview, current status, next milestone
│
└── docs/
    │
    ├── rules/                             # Standards (8 Rule Books + index) — LOCKED
    │   ├── README.md                      #   Index — links to all 8 Rule Books
    │   ├── 01_Project_Rules.md            #   Decisions, breaking changes, sprint discipline
    │   ├── 02_Coding_Rules.md             #   TypeScript, imports, file org, error handling
    │   ├── 03_Engine_Rules.md             #   Engine philosophy, lifecycle, template, events
    │   ├── 04_Database_Rules.md           #   Schema, migrations, integrity, security
    │   ├── 05_Asset_Rules.md              #   Pipeline, registry, licensing, naming
    │   ├── 06_UI_Rules.md                 #   Layering, state, components, accessibility
    │   ├── 07_AI_Rules.md                 #   AI philosophy, working memory, escalation
    │   └── 08_Naming_Rules.md             #   Folders, files, code, DB, events, assets
    │
    ├── architecture/                      # Architecture v1.0 — LOCKED
    │   ├── Architecture_Manifesto.md      #   12 philosophical principles
    │   ├── Architecture_Principles.md     #   12 technical principles, 5 layers
    │   ├── Engine_Dependency_Graph.md     #   ★ Authoritative engine list & dependency map
    │   ├── Event_Bus_Architecture.md      #   Tick-based simulation, pub/sub, typed payloads
    │   ├── Persistence_Architecture.md    #   Save/load, offline-first, migration, validation
    │   ├── Testing_Architecture.md         #   3-layer pyramid, determinism, CI, coverage
    │   └── Architecture_Review.md         #   Audit, Go/No-Go (GO), ADR template, LOCK procedure
    │
    ├── engine/                            # Engine Documentation v1.0 + Blueprint Standard
    │   ├── Engine_Template.md             #   9-section template for every engine blueprint
    │   ├── Engine_Order.md                #   Canonical 10-engine build order
    │   ├── Engine_Dependencies.md         #   Dependency matrix (references Dependency Graph)
    │   │   └── → docs/architecture/Engine_Dependency_Graph.md
    │   ├── Engine_Blueprint_Standard_v1.0.md  # ★ 21-chapter permanent standard (Technical + Visual Prototype)
    │   ├── Blueprint_Checklist.md        #   Reusable completion checklist (includes Visual Prototype items)
    │   └── Blueprint_Template.md          #   Clean reusable 21-chapter template
    │
    ├── ui/                                # UI Prototype Standard v1.0
    │   └── UI_Prototype_Standard.md       #   Permanent standard for every Visual Prototype chapter
    │
    ├── database/                          # Database documentation (templates)
    │   ├── Schema.md                      #   PLACEHOLDER — first persistence milestone
    │   ├── ERD.md                          #   PLACEHOLDER — first persistence milestone
    │   └── Migration_Log.md               #   PLACEHOLDER — first persistence milestone
    │
    ├── assets/                            # Asset documentation
    │   ├── Asset_Pipeline.md              #   Inbox → Review → Registry → Core/Expansion → Archive
    │   ├── Asset_Checklist.md             #   Review checklist
    │   └── Asset_Style_Guide.md           #   PLACEHOLDER — before first asset production
    │
    ├── project/                           # Project documentation
    │   ├── Development_Phases.md          #   Phase definitions (0 through 6)
    │   ├── Development_Workflow.md        #   Sprint workflow, commit standards
    │   ├── Foundation_v1.0.md             #   Foundation lock document — LOCKED
    │   ├── Milestones.md                  #   Milestone definitions
    │   ├── Project_Goals.md               #   PLACEHOLDER — Phase 3
    │   ├── Project_Vision.md              #   PLACEHOLDER — Phase 3
    │   ├── Documentation_Status.md        #   ★ This system's completion tracker
    │   ├── Documentation_Map.md           #   ★ This document — visual hierarchy
    │   └── Documentation_Glossary.md      #   ★ Project terminology definitions
    │
    ├── progress/                           # Progress tracking
    │   ├── Current_Phase.md               #   Active phase and exit criteria
    │   ├── Sprint_Log.md                  #   Chronological sprint log
    │   ├── Completed_Features.md          #   Verified completed features
    │   ├── Changelog.md                   #   Notable changes, newest first
    │   └── Known_Issues.md                #   Active issues and watch items
    │
    ├── roadmap/                           # Release roadmap
    │   ├── Master_Roadmap.md              #   ★ Phase overview (0 through 6)
    │   ├── Playable_v0.1.md               #   PLACEHOLDER — Phase 3
    │   ├── Playable_v0.2.md               #   PLACEHOLDER — Phase 4
    │   ├── Early_Access.md                #   PLACEHOLDER — Phase 5
    │   └── Release.md                     #   PLACEHOLDER — Phase 6
    │
    ├── ai/                                # AI agent working memory
    │   ├── Project_State.md               #   Current project snapshot
    │   ├── Current_Sprint.md              #   Active sprint context
    │   ├── Current_Task.md                #   Single task in progress
    │   ├── Development_Context.md         #   Standing context loaded before any task
    │   └── Next_Task.md                   #   Proposed next task
    │
    ├── blueprint/                         # System blueprints
    │   └── README.md                      #   PLACEHOLDER — Phase 0.5+
    │
    └── world/                             # World Bible
        └── README.md                      #   PLACEHOLDER — Phase 3+
```

---

## Domain Relationships

```
                    ┌─────────────────────────────────────────────┐
                    │              docs/rules/ (8 books)           │
                    │         Standards for every domain           │
                    └──────────────────────┬──────────────────────┘
                                           │ governs
                    ┌──────────────────────▼──────────────────────┐
                    │          docs/architecture/ (6 docs)         │
                    │     ★ Engine Dependency Graph               │
                    │     (authoritative engine list)              │
                    └──────────────────────┬──────────────────────┘
                                           │ defines engines
                    ┌──────────────────────▼──────────────────────┐
                    │           docs/engine/ (6 docs) + docs/ui/ (1 doc)  │
                    │     Engine Template, Order, Dependencies     │
                    │     (references Dependency Graph)            │
                    └──────────────────────┬──────────────────────┘
                                           │ will drive
              ┌────────────────────────────┼────────────────────────────┐
              ▼                            ▼                            ▼
    ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
    │  docs/blueprint/  │          │  docs/database/   │          │  docs/assets/    │
    │  Engine blueprints│          │  Schema, ERD     │          │  Pipeline, style │
    │  (Phase 0.5+)     │          │  (Phase 1+)      │          │  (Phase 3+)      │
    └─────────────────┘          └─────────────────┘          └─────────────────┘

    ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
    │  docs/world/      │          │  docs/roadmap/    │          │  docs/project/    │
    │  World Bible      │          │  Phase path       │          │  Phases, workflow, │
    │  (Phase 3+)       │          │  (0 through 6)    │          │  Foundation, goals │
    └─────────────────┘          └─────────────────┘          └─────────────────┘

    ┌─────────────────┐          ┌─────────────────┐
    │  docs/progress/   │          │  docs/ai/         │
    │  Phase, sprint,   │◄─────────│  State, sprint,   │
    │  changelog, issues│  tracks   │  task, context    │
    └─────────────────┘          └─────────────────┘
```

---

## Key Relationships

| Source | References | Relationship |
|--------|-----------|--------------|
| `docs/engine/Engine_Dependencies.md` | `docs/architecture/Engine_Dependency_Graph.md` | Summarizes the authoritative graph |
| `docs/engine/Engine_Order.md` | `docs/architecture/Engine_Dependency_Graph.md` | Summarizes the authoritative build order |
| `docs/engine/Engine_Template.md` | `docs/rules/03_Engine_Rules.md` | Implements the engine template rule |
| `docs/architecture/Architecture_Review.md` | All architecture documents | Audit and governance record |
| `docs/project/Foundation_v1.0.md` | All documentation domains | Foundation lock inventory |
| `docs/project/Documentation_Status.md` | All documentation domains | Completion tracker |
| `docs/project/Documentation_Map.md` | All documentation domains | This document |
| `docs/project/Documentation_Glossary.md` | All documentation domains | Terminology reference |
| `docs/rules/README.md` | All 8 Rule Books + all domains | Index and cross-reference hub |
| `docs/ai/Development_Context.md` | All architecture + engine docs | Standing context for AI agent |
| `docs/progress/Current_Phase.md` | `docs/ai/Next_Task.md` | Phase exit criteria and next phase |
| `docs/roadmap/Master_Roadmap.md` | All roadmap milestone docs | Phase overview linking to details |
| `README.md` | `docs/project/Foundation_v1.0.md` | Project overview linking to foundation |

---

## Legend
- **★** — Authoritative or central document for its domain
- **LOCKED** — Cannot be changed without ADR + Lead Architect approval
- **PLACEHOLDER** — Document exists with standardized header but content deferred
- **→** — Cross-reference to another document
