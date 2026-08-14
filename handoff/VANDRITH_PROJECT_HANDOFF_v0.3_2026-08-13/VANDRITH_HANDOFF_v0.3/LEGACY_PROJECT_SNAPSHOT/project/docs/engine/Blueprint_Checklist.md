# Blueprint Checklist

> The Vendrith World — reusable checklist for every engine blueprint.
>
> Copy this checklist into every engine blueprint. An Engine Blueprint cannot be
> approved until every item is checked.
>
> Standard: `docs/engine/Engine_Blueprint_Standard_v1.0.md`

---

## Structure
- [ ] All 20 chapters are present and in order.
- [ ] Chapter numbering is sequential (1 through 20).
- [ ] No chapter is empty or marked "TBD".

## 1. Overview
- [ ] Purpose is stated.
- [ ] Goals are listed.
- [ ] Scope is defined.
- [ ] Owner is named.
- [ ] Status is declared.
- [ ] Version is declared.

## 2. Philosophy
- [ ] Why this engine exists is explained.
- [ ] What problem it solves is stated.
- [ ] Core design principles are referenced.

## 3. Responsibilities
- [ ] Every responsibility is a single sentence.
- [ ] Each responsibility maps to at least one unit test.
- [ ] No responsibility spans two domains.

## 4. Non Responsibilities
- [ ] All permanent non-responsibilities are listed.
- [ ] Engine-specific non-responsibilities are listed.

## 5. Dependencies
- [ ] Required engines match the Engine Dependency Graph exactly.
- [ ] Each dependency lists the interface consumed and its purpose.
- [ ] Optional dependencies (if any) are declared.
- [ ] Infrastructure services are listed.
- [ ] Forbidden dependencies are stated.

## 6. Public Interface
- [ ] The typed public interface is declared.
- [ ] Commands are listed with typed parameters.
- [ ] Queries are listed with typed return values.
- [ ] Published events are listed with payload types and trigger conditions.
- [ ] Consumed events are listed with payload types and handler behavior.

## 7. Internal State
- [ ] Owned state is declared.
- [ ] Temporary state is declared (if any).
- [ ] Persistent state is declared with snapshot interface.
- [ ] Calculated state is declared with inputs.
- [ ] No hidden mutable globals.
- [ ] All state is typed.

## 8. Lifecycle
- [ ] Construction (dependency injection) is defined.
- [ ] Initialization (event subscription, initial state) is defined.
- [ ] Registration at composition root is defined.
- [ ] Tick behavior is defined.
- [ ] Update (non-tick) behavior is defined (if applicable).
- [ ] Pause behavior is defined.
- [ ] Resume behavior is defined.
- [ ] Shutdown (unsubscribe, release resources) is defined.
- [ ] Dispose (no leaked references) is confirmed.

## 9. Tick Behaviour
- [ ] Execution order matches the Engine Dependency Graph.
- [ ] Input (what the engine reads) is defined.
- [ ] Processing (what the engine does) is defined.
- [ ] Output (events and state changes) is defined.
- [ ] Post-tick (queue draining) is confirmed.
- [ ] Determinism is confirmed.

## 10. Event Communication
- [ ] All published events use `domain:subject:action` format.
- [ ] All published events have typed payloads.
- [ ] All consumed events have typed payloads.
- [ ] Event timing (synchronous, queued) is defined.
- [ ] No recursive event loops.
- [ ] The domain segment matches the engine's canonical name.

## 11. Save & Load
- [ ] Snapshot interface is declared with `engineName` and `snapshotVersion`.
- [ ] `save()` method is defined (returns snapshot, no side effects).
- [ ] `load(snapshot)` method is defined (restores state, recomputes calculated).
- [ ] Migration path is declared.
- [ ] `validate(snapshot)` method is defined.
- [ ] Snapshot is serializable (no functions, no class instances, no circular refs).

## 12. Error Handling
- [ ] Recoverable errors are listed with recovery behavior.
- [ ] Fatal errors are listed with escalation behavior.
- [ ] Logging category and levels are declared.
- [ ] Fallback / graceful degradation is defined.

## 13. Performance
- [ ] Target tick time is declared.
- [ ] Memory budget is declared.
- [ ] Optimization rules are referenced.
- [ ] Scalability bounds and growth rates are declared.

## 14. Security
- [ ] Input validation rules are declared.
- [ ] Data ownership rules are confirmed.
- [ ] Offline rules are confirmed.
- [ ] Future multiplayer behavior is declared.

## 15. Testing
- [ ] Unit test strategy is defined.
- [ ] Integration test strategy is defined.
- [ ] Replay test strategy is defined.
- [ ] Performance test strategy is defined.
- [ ] Regression test policy is confirmed.

## 16. Documentation
- [ ] All required documents are listed.
- [ ] All cross-references are listed and valid.
- [ ] ADR process is referenced.
- [ ] Update rules are declared.

## 17. Future Expansion
- [ ] Plugin support is declared.
- [ ] Additional features are listed.
- [ ] Replacement strategy is confirmed.
- [ ] Backward compatibility is confirmed.

## 21. Visual Prototype
- [ ] Visual Prototype completed.
- [ ] Desktop layout defined.
- [ ] Tablet layout defined.
- [ ] Mobile layout defined.
- [ ] Widget list complete.
- [ ] User interaction documented.
- [ ] No gameplay logic inside UI.

## Final
- [ ] The blueprint follows the Blueprint Template structure.
- [ ] The blueprint passes the Review Checklist (Standard §19).
- [ ] The Lead Architect has signed off.
- [ ] The blueprint status is set to LOCKED.
