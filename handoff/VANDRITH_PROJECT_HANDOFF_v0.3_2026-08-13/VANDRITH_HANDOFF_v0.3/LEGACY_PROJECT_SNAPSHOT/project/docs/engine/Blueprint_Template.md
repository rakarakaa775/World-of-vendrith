# Blueprint Template

> The Vendrith World — clean reusable template for every engine blueprint.
>
> Copy this template. Fill in every section. No section is optional.
> No example engine. No gameplay. Template only.
>
> Standard: `docs/engine/Engine_Blueprint_Standard_v1.0.md`
> Checklist: `docs/engine/Blueprint_Checklist.md`

---

## 1. Overview

### Purpose
_(One paragraph: what this engine is responsible for.)_

### Goals
- _(Goal 1)_
- _(Goal 2)_

### Scope
_(What is in scope and what is out of scope for this blueprint.)_

### Owner
_(Lead Architect or designated owner.)_

### Status
_(Draft, In Review, LOCKED.)_

### Version
_(v1.0 — date.)_

---

## 2. Philosophy

### Why This Engine Exists
_(One paragraph: why the simulation needs this engine.)_

### What Problem It Solves
_(One paragraph: the specific simulation problem this engine addresses.)_

### Core Design Principles
- Independent — constructable and testable in isolation.
- Interface-driven — communicates through typed public interfaces.
- Event-driven — publishes state changes through the Event Bus.
- Replaceable — consumers depend on the interface, not the implementation.
- Offline-first — runs locally without network.

---

## 3. Responsibilities

_(List every responsibility. One sentence each. Each must map to a unit test.)_

- _(Responsibility 1)_
- _(Responsibility 2)_

---

## 4. Non Responsibilities

### Permanent (apply to every engine)
- Does not render UI.
- Does not read from or write to the database directly.
- Does not receive player input directly.
- Does not import another engine's concrete implementation.
- Does not depend on Save Engine.
- Does not create circular dependencies.

### Engine-Specific
- _(Non-responsibility 1)_
- _(Non-responsibility 2)_

---

## 5. Dependencies

### Required Engines
| Engine | Interface | Purpose |
|--------|-----------|---------|
| _(Engine name)_ | _(Interface name)_ | _(Why this dependency exists)_ |

### Optional Engines
_(List or "none.")_

### Infrastructure
- Event Bus — publish/subscribe event transport.
- Logger — categorized, leveled logging.
- Configuration — runtime tuning parameters.
- Utilities — shared helpers with no domain logic.

### Forbidden Dependencies
- No dependency on Save Engine.
- No dependency on Presentation, Application, or Persistence layers.
- No import of another engine's concrete class.
- No circular dependencies (direct or transitive).

---

## 6. Public Interface

```typescript
interface <Domain>EngineInterface {
  // Commands
  // _(command method signatures with typed parameters)_

  // Queries
  // _(query method signatures with typed return values)_
}
```

### Commands
| Command | Parameters | Returns | Description |
|---------|-----------|---------|-------------|
| _(name)_ | _(typed params)_ | _(void or result)_ | _(what it does)_ |

### Queries
| Query | Parameters | Returns | Description |
|-------|-----------|---------|-------------|
| _(name)_ | _(typed params)_ | _(typed result)_ | _(what it returns)_ |

### Published Events
| Event Name | Payload Type | When Published |
|------------|-------------|---------------|
| _(domain:subject:action)_ | _(PayloadInterface)_ | _(trigger condition)_ |

### Consumed Events
| Event Name | Payload Type | Handler Behavior |
|------------|-------------|-------------------|
| _(domain:subject:action)_ | _(PayloadInterface)_ | _(what the engine does)_ |

---

## 7. Internal State

### Owned State
```typescript
interface <Domain>State {
  // _(persistent and owned fields with types)_
}
```

### Temporary State
_(Per-tick state that is discarded after the tick. Or "none.")_

### Persistent State
```typescript
interface <Domain>Snapshot {
  engineName: string;
  snapshotVersion: number;
  // _(persistent fields with types)_
}
```

### Calculated State
| Calculated Field | Derived From | Recomputed When |
|-----------------|-------------|-----------------|
| _(field)_ | _(inputs)_ | _(trigger)_ |

---

## 8. Lifecycle

### Construction
_(Dependencies injected. No global lookups.)_

### Initialization
_(Subscribe to events. Load configuration. Set up initial state.)_

### Registration
_(Registered at composition root. Interface exposed to Application Layer.)_

### Tick
_(Executes once per tick in topological order. See §9.)_

### Update
_(Non-tick updates, if any. Or "none — all updates occur during tick.")_

### Pause
_(Stops ticking. State preserved.)_

### Resume
_(Resumes ticking. State unchanged.)_

### Shutdown
_(Unsubscribe from all events. Release all resources.)_

### Dispose
_(Dereferenced. No leaked timers, listeners, or references.)_

---

## 9. Tick Behaviour

### Execution Order
_(Position in the tick cascade. Must match Engine Dependency Graph.)_

### Input
_(What the engine reads at the start of its tick.)_

### Processing
_(What the engine does during its tick.)_

### Output
_(Events published. State changes produced.)_

### Post Tick
_(Queued events drained before next engine runs. State stable.)_

---

## 10. Event Communication

### Published Events
_(Full list with payload types and trigger conditions — same as §6.)_

### Consumed Events
_(Full list with payload types and handler behavior — same as §6.)_

### Event Timing
- Simulation events dispatched synchronously within the tick.
- Events published during tick are queued and drained before next engine.
- No recursive event loops.

### Payload Rules
- Every payload is a strongly typed interface.
- Payloads are serializable (data only).
- Each event name has exactly one payload type.

---

## 11. Save & Load

### Snapshot
_(Snapshot interface declared in §7. Confirmed here.)_

### Serialization
- `save()` returns the engine's complete persistent state.
- Read-only. No side effects. Deterministic.

### Deserialization
- `load(snapshot)` restores all persistent state.
- Recomputes calculated state after loading.
- Replaces all persistent state. No partial load.

### Migration
- Current `snapshotVersion`: _(version number)_.
- Migration path: _(describe how old snapshots are transformed)._

### Validation
- `validate(snapshot)` confirms structural soundness.
- Non-destructive. Returns typed validation result.

---

## 12. Error Handling

### Recoverable Errors
| Error | Condition | Recovery |
|-------|-----------|----------|
| _(error)_ | _(when it occurs)_ | _(what the engine does)_ |

### Fatal Errors
| Error | Condition | Escalation |
|-------|-----------|------------|
| _(error)_ | _(when it occurs)_ | _(how it is reported)_ |

### Logging
- Category: `[<domain>]`
- Levels: `error`, `warn`, `info`, `debug`.
- No sensitive data in logs.

### Fallback
_(Graceful degradation behavior for non-critical failures.)_

---

## 13. Performance

### Target Tick Time
_(Budget in milliseconds. Share of the frame budget.)_

### Memory Budget
- Baseline: _(expected steady-state memory)_
- Peak: _(worst-case memory during a tick)_
- Growth rate: _(how memory scales)_

### Optimization Rules
- Correctness first. Measure before optimizing.
- Maintainability over micro-optimization.
- Hot paths documented with measurement.

### Scalability
- Upper bound: _(max entities / items / activities)_
- Growth rate: _(how tick time scales)_
- Exceeded bound behavior: _(graceful degradation)_

---

## 14. Security

### Validation
_(All input validated: commands, events, snapshots.)_

### Data Ownership
_(Engine owns its state. Cross-engine references use IDs. playerId in saves.)_

### Offline Rules
_(Runs without network. No direct database access. No cloud calls.)_

### Future Multiplayer Rules
_(Simulation logic unchanged. Network events as separate category. Payload validation.)_

---

## 15. Testing

### Unit Tests
- Tested in isolation with all dependencies mocked.
- Every responsibility has at least one unit test.
- Deterministic (mock time, seeded randomness).

### Integration Tests
- Wired with real dependency engines through real Event Bus.
- Verifies communication contracts (events, payloads, order).

### Replay Tests
- Recorded session replayed against golden output.
- Same inputs always produce identical outputs.

### Performance Tests
- Tick time measured. Memory tracked. Regressions flagged.

### Regression Tests
- Every fixed bug becomes a permanent regression test.
- Named after the bug. Lives at the lowest reproducing layer.

---

## 16. Documentation

### Required Documents
1. This blueprint.
2. Interface declaration (included in §6).
3. Snapshot interface (included in §7).
4. Event catalog (included in §6).
5. Testing strategy (included in §15).

### Cross References
- `docs/architecture/Architecture_Manifesto.md`
- `docs/architecture/Architecture_Principles.md`
- `docs/architecture/Engine_Dependency_Graph.md`
- `docs/architecture/Event_Bus_Architecture.md`
- `docs/architecture/Persistence_Architecture.md`
- `docs/architecture/Testing_Architecture.md`
- `docs/rules/03_Engine_Rules.md`
- `docs/rules/02_Coding_Rules.md`
- `docs/rules/08_Naming_Rules.md`
- `docs/engine/Engine_Template.md`
- `docs/engine/Blueprint_Checklist.md`
- `docs/engine/Blueprint_Template.md`
- `docs/engine/Engine_Blueprint_Standard_v1.0.md`

### ADR
Changes to a LOCKED blueprint require an ADR per `docs/architecture/Architecture_Review.md`.

### Update Rules
- Before approval: draft, anyone may propose changes.
- After approval (LOCKED): ADR + Architecture Review + Lead Architect approval.
- Blueprint updated in the same change as the code.

---

## 17. Future Expansion

### Plugin Support
- Plugins subscribe to this engine's events through the Event Bus.
- Plugins publish events this engine consumes (if declared).
- This engine is replaceable by implementing the same interface.
- No modification needed to support a plugin.

### Additional Features
_(Future features that are additive and do not change the core contract.)_

### Replacement Strategy
- Consumers depend on the interface, not the implementation.
- Replacement wired at composition root. No consumer modified.

### Backward Compatibility
- Snapshot format changes require migration. Old snapshots never discarded.
- Interface changes require ADR and consumer migration path.
- Event name changes require new event + deprecation.

---

## 18. Completion Checklist

_(Copy the full checklist from `docs/engine/Blueprint_Checklist.md` and check every item.)_

---

## 19. Review Checklist

_(For the Lead Architect. See Standard §19. Every item must be confirmed before GO.)_

### Architecture Compliance
- [ ] Dependencies match Engine Dependency Graph.
- [ ] No circular dependencies.
- [ ] Interface-based communication.
- [ ] Event Bus used for reactive communication.
- [ ] No layer violations.
- [ ] Infrastructure injected.

### Interface Quality
- [ ] Fully typed (no `any`).
- [ ] Commands and queries separated.
- [ ] Queries have no side effects.
- [ ] Commands validate input.
- [ ] Interface exposes behavior, not state.

### Event Compliance
- [ ] `domain:subject:action` format.
- [ ] Typed, serializable payloads.
- [ ] Domain matches canonical name.
- [ ] No recursive loops.
- [ ] Events complete and consistent.

### State Design
- [ ] State categories separated.
- [ ] No hidden globals.
- [ ] Persistent state serializable.
- [ ] Calculated state not persisted.
- [ ] State not exposed by reference.

### Lifecycle Completeness
- [ ] All phases defined.
- [ ] Init subscribes. Shutdown unsubscribes.
- [ ] No leaked resources.

### Save & Load
- [ ] Snapshot includes `engineName` and `snapshotVersion`.
- [ ] `save()` read-only and deterministic.
- [ ] `load()` replaces all state.
- [ ] `validate()` non-destructive.
- [ ] Migration path declared.

### Testing Coverage
- [ ] Every responsibility has a unit test.
- [ ] Integration tests verify communication.
- [ ] Replay tests verify determinism.
- [ ] Round-trip save tests defined.
- [ ] Error paths tested.

### Performance
- [ ] Tick time budget reasonable.
- [ ] Memory budget declared.
- [ ] No premature optimization.
- [ ] Scalability bounds declared.

### Security
- [ ] All input validated.
- [ ] No direct database access.
- [ ] No network calls in simulation.
- [ ] No sensitive data in logs or snapshots.

### Documentation
- [ ] All 20 chapters complete.
- [ ] Cross-references valid.
- [ ] No empty chapters or "TBD".
- [ ] Follows Blueprint Template.

### Final Decision
- [ ] **GO** — Approved. LOCKED. Implementation may begin.
- [ ] **NO-GO** — Rejected. Issues listed. Revise and resubmit.

---

## 20. Lock Policy

### After Approval
- Blueprint status changes to LOCKED.
- Blueprint added to locked documents list.
- Implementation may begin.

### Future Changes Require
1. ADR (`docs/architecture/Architecture_Review.md`).
2. Architecture Review.
3. Lead Architect Approval.

### Cannot Change Without ADR
- Dependencies.
- Public interface (breaking changes).
- Event names (breaking changes).
- Snapshot format.
- Responsibilities.

### Can Change Without ADR
- Implementation details behind the interface.
- Internal optimizations (documented with measurement).
- New published events (additive).
- New configuration parameters (additive).
- Clarifications that do not change the contract.

---

## 21. Visual Prototype

> **Important Rule:** This is ONLY a UI Mockup. No gameplay. No engine logic. No
> backend. No database. No implementation.
>
> Standard: `docs/ui/UI_Prototype_Standard.md`

### Purpose
_(One paragraph: what the player is trying to accomplish on this screen and why
this visual prototype exists.)_

### Screen Objective
_(What game question does this screen answer? What does the player need to see
and do here?)_

### Page Layout
_(Overall page structure. Use an ASCII wireframe or structured description.)_

```
┌─────────────────────────────────────────────────┐
│  Header / Navigation                            │
├──────────┬──────────────────────┬───────────────┤
│  Panel A │  Main Content        │  Panel B      │
│          │                      │               │
├──────────┴──────────────────────┴───────────────┤
│  Footer / Status Bar                            │
└─────────────────────────────────────────────────┘
```

### Panels
| Panel | Purpose | Data Source | Position |
|-------|---------|-------------|----------|
| _(name)_ | _(what it shows)_ | _(engine query or event)_ | _(layout position)_ |

### Widgets
| Widget | Type | Displays | Captures |
|--------|------|----------|----------|
| _(name)_ | _(button, slider, list, etc.)_ | _(what it shows)_ | _(what the player does)_ |

### Buttons
| Button | Label | Dispatches |
|--------|-------|-----------|
| _(name)_ | _(visible text)_ | _(engine command)_ |

### Indicators
| Indicator | Type | Displays | Source |
|-----------|------|----------|--------|
| _(name)_ | _(bar, icon, badge, etc.)_ | _(what it shows)_ | _(engine query or event)_ |

### Status Displays
| Status Display | Location | Shows | Updates When |
|----------------|----------|-------|---------------|
| _(name)_ | _(panel)_ | _(summary content)_ | _(engine event)_ |

### Navigation
| From | To | Trigger |
|------|----|---------|
| _(source screen)_ | _(destination screen)_ | _(button, link, or event)_ |

### Information Flow
```
Engine State → Engine Query → UI Display
                                ↓
                          Player Action
                                ↓
                          UI Intent → Engine Command → Engine State Change
                                ↓
                          Engine Event → UI Re-render
```

### User Interaction Flow
1. _(Player does X)_
2. _(UI dispatches intent Y to engine)_
3. _(Engine processes and emits event Z)_
4. _(UI re-renders to show result)_

### Desktop Layout
_(Layout on desktop (1280px+). Panel arrangement, columns, space usage.)_

### Tablet Layout
_(Layout on tablet (768px-1279px). Panels collapse, stack, or hide.)_

### Mobile Layout
_(Layout on mobile (<768px). Panels hidden, tabbed, or stacked.)_

### Accessibility Notes
_(Keyboard navigation, screen reader, contrast, focus, reduced motion. Per
`docs/rules/06_UI_Rules.md` §6.)_

### Theme Notes
_(Color tokens, spacing, typography, visual tone. Per `docs/rules/06_UI_Rules.md` §7.)_

### Animation Notes
_(Hover states, transitions, state-change feedback. Must respect reduced-motion.)_

### Future Expansion
_(How this screen might grow. What panels or widgets might be added. What the
layout must accommodate without redesign.)_
