# Next Task

> Proposed next task for the AI agent. Requires Lead Architect sign-off.

## Proposed
Phase 0.5.1 — Time Engine Blueprint. Design the first engine blueprint following
the Engine Blueprint Standard v1.0 (`docs/engine/Engine_Blueprint_Standard_v1.0.md`),
using the Blueprint Template (`docs/engine/Blueprint_Template.md`) and the Blueprint
Checklist (`docs/engine/Blueprint_Checklist.md`). The blueprint must contain both a
Technical Blueprint (chapters 1-20) and a Visual Prototype (chapter 21), following
the UI Prototype Standard (`docs/ui/UI_Prototype_Standard.md`).

## Prerequisites
- Phase 0.4 — Architecture complete and LOCKED. (Done.)
- Phase 0.4.6 — Engine Documentation synchronized with Architecture v1.0. (Done.)
- Phase 0.4.7 — Documentation system polished and finalized. (Done.)
- Phase 0.5.0 — Engine Blueprint Standard v1.0 created. (Done.)
- Phase 0.5.0.1 — Visual Prototype Standard v1.0 created. (Done.)
- Engine Blueprint Standard v1.0 LOCKED by Lead Architect. (Pending.)
- UI Prototype Standard v1.0 LOCKED by Lead Architect. (Pending.)
- Lead Architect approval to begin Phase 0.5.1.

## Why
The Engine Blueprint Standard v1.0 (21 chapters) and UI Prototype Standard v1.0 are
complete. Before any engine is implemented, each engine needs a detailed blueprint
that follows the standard — including both the Technical Blueprint and the Visual
Prototype. The Time Engine is first in the topological build order, has no
dependencies, and is the heartbeat of the tick-based simulation cascade. Every other
engine depends on it (directly or transitively). Its blueprint must be approved
before the World Engine blueprint can begin.

## Scope
- Design the Time Engine blueprint following all 21 chapters of the standard.
- Technical Blueprint (chapters 1-20): purpose, responsibilities, non-responsibilities,
  dependencies (none — Time is the root engine), typed public interface (commands,
  queries), published events (e.g., `time:tick:started`, `time:day:changed`,
  `time:hour:advanced`), internal state, lifecycle, tick behavior, save/load, error
  handling, performance, security, testing strategy.
- Visual Prototype (chapter 21): screen objective, page layout, panels, widgets,
  buttons, indicators, status displays, navigation, information flow, user interaction
  flow, desktop/tablet/mobile layouts, accessibility notes, theme notes, animation
  notes, future expansion.
- Complete the Blueprint Checklist.
- Pass the Review Checklist.
- Obtain Lead Architect GO decision and LOCK the blueprint.

## Constraints
- No engine code, no gameplay, no schema, no UI implementation.
- Blueprint documentation only.
- Must follow the Engine Blueprint Standard v1.0 (21 chapters) without exception.
- Visual Prototype must follow the UI Prototype Standard v1.0.
- Must be consistent with all eight Rule Books and all six architecture documents.
- Must follow the Decision Rules in `docs/rules/01_Project_Rules.md`.
- Must use the Blueprint Template structure.
- Must pass the Blueprint Checklist.

## Out of Scope
- Engine implementation (that is Phase 1+).
- Database schema (that is the first persistence milestone).
- Gameplay behavior and content (later phases).
- UI component implementation (later phases).
- Other engine blueprints (those follow in topological order).

## Recommended First Task
Begin with the **Time Engine blueprint** — the first engine in the topological
order, with no dependencies. It is the foundation of the tick-based simulation and
the heartbeat of the Event Bus cascade. Every subsequent engine depends on it. The
blueprint must include both the Technical Blueprint (chapters 1-20) and the Visual
Prototype (chapter 21).
