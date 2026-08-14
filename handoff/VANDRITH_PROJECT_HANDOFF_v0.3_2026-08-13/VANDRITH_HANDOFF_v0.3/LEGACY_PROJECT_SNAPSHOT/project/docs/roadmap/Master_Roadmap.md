# Master Roadmap

The long-term path for The Vendrith World. Phases are sequential; each must be
signed off before the next begins.

---

## Phase 0 — Foundation  *(complete — v1.0 LOCKED)*
Project structure, documentation, standards, README, Rule Books, AI workspace,
asset pipeline, progress system, GitHub integration.
No gameplay, engines, schema, or auth.

### Foundation Items — All Complete
- [x] Foundation
- [x] Documentation
- [x] Documentation Polish (Phase 0.4.7 — numbering, cross-references, placeholders, status/map/glossary)
- [x] GitHub Integration
- [x] Project Rules
- [x] Coding Rules
- [x] Engine Rules
- [x] Database Rules
- [x] Asset Rules
- [x] UI Rules
- [x] AI Rules
- [x] Naming Rules

---

## Phase 0.4 — Architecture  *(complete — LOCKED)*
Architecture Manifesto, Architecture Principles, Engine Dependency Graph, Event Bus
Architecture, Persistence Architecture, Testing Architecture, Architecture Review.
All 6 architecture documents LOCKED. GO decision issued.
No engine code, no gameplay, no schema.

### Architecture Items — All Complete
- [x] Architecture Manifesto
- [x] Architecture Principles
- [x] Engine Dependency Graph
- [x] Event Bus Architecture
- [x] Persistence Architecture
- [x] Testing Architecture
- [x] Architecture Review (Go/No-Go: GO)
- [x] ADR template established
- [x] LOCK Procedure defined

---

## Phase 0.5 — Engine Blueprint Master  *(in progress)*
Design detailed blueprints for each of the 10 core engines using the Engine Blueprint
Standard v1.0, in topological build order. No engine code — blueprints only.

### Phase 0.5.0 — Engine Blueprint Standard v1.0  *(complete)*
- [x] `docs/engine/Engine_Blueprint_Standard_v1.0.md` — 20-chapter permanent standard
- [x] `docs/engine/Blueprint_Checklist.md` — reusable completion checklist
- [x] `docs/engine/Blueprint_Template.md` — clean reusable template
- [x] All tracking documents updated
- [x] Documentation audit passed
- [x] Build verification passed

### Phase 0.5.0.1 — Visual Prototype Standard v1.0  *(complete)*
- [x] Chapter 21 (Visual Prototype) added to Engine Blueprint Standard v1.0
- [x] `docs/ui/UI_Prototype_Standard.md` — 16-section permanent standard
- [x] Blueprint Template updated with Chapter 21
- [x] Blueprint Checklist updated with Visual Prototype items
- [x] Completion Checklist and Review Checklist updated
- [x] All tracking documents updated
- [x] Documentation audit passed
- [x] Build verification passed

### Phase 0.5.1 — Time Engine Blueprint  *(next)*
- [ ] Time Engine blueprint following the standard
- [ ] Lead Architect approval and LOCK

### Phase 0.5.2 — World Engine Blueprint
- [ ] World Engine blueprint following the standard
- [ ] Lead Architect approval and LOCK

### Phase 0.5.3 — Life Engine Blueprint
- [ ] Life Engine blueprint following the standard
- [ ] Lead Architect approval and LOCK

### Remaining Engine Blueprints (0.5.4 — 0.5.10)
- [ ] Energy, Activity, Inventory, Dialogue, NPC AI, Quest, Save
- [ ] Each blueprint follows the standard, is approved, and is LOCKED

No engine code in Phase 0.5. Blueprint documentation only.

---

## Phase 1 — First Engine Design
Design and document the first simulation engine (TBD).
No gameplay integration yet.

## Phase 2 — Engine Implementation
Build the first engine in isolation with tests.
No UI, no gameplay.

## Phase 3 — Playable v0.1
Minimal playable vertical slice. See `Playable_v0.1.md`.

## Phase 4 — Playable v0.2
Expanded slice with additional systems. See `Playable_v0.2.md`.

## Phase 5 — Early Access
Broadened content and systems. See `Early_Access.md`.

## Phase 6 — Release
Full release. See `Release.md`.

---

## Principles
- One focus per phase.
- Foundation before feature.
- Every phase is reviewable and reversible.
- No phase begins until the previous is signed off.
