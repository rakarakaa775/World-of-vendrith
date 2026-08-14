# Engine Template

> The Vendrith World — the standard template every engine design follows.

Every engine design document must use this structure. No engine is implemented
until its design doc is approved.

## 1. Engine Name
`<Domain>Engine`

## 2. Purpose
_(One paragraph: what this engine is responsible for, and what it is NOT responsible for.)_

## 3. Dependencies
- **Depends on:** _(list of engines, or "none")_
- **Depended on by:** _(list of engines, or "none yet")_

## 4. Public Interface
_(The typed interface other layers use to interact with this engine. No internals exposed.)_

```typescript
interface <Domain>EngineInterface {
  // methods to be defined
}
```

## 5. State Shape
_(The typed shape of the engine's internal state. No hidden mutable globals.)_

```typescript
interface <Domain>State {
  // fields to be defined
}
```

## 6. Lifecycle
- **Init:** _(what happens at startup, in what order)_
- **Update / Tick:** _(what the engine does each tick, if applicable)_
- **Teardown:** _(how it cleans up — no leaked timers, listeners, or state)_

## 7. Boundaries
- Does not render UI.
- Does not read from the database directly (unless that is its sole purpose).
- Does not receive player input directly — receives commands through its interface.

## 8. Testing Strategy
_(How this engine is tested in isolation.)_

## 9. Open Questions
_(Unresolved design decisions pending Lead Architect input.)_

## Status
Template only. No engine implemented yet.
