# 03 — Engine Rules

> The Vendrith World — engineering standards for every simulation engine.
>
> An "engine" is an independent system responsible for one domain of the simulation
> (e.g. Time, Life, Activity, Save). Engines are not gameplay — they are the substrate
> gameplay runs on. These rules are permanent and apply to every engine, present and future.

---

## 1. Engine Philosophy

Engines are the foundation of the simulation. Each one is designed to stand alone,
be trusted in isolation, and survive the full lifecycle of the project.

- **Modular.** An engine owns a single domain. Its responsibilities are cohesive and its surface area is minimal.
- **Independent.** An engine does not know about the systems that consume it. It exposes a typed public interface and nothing more.
- **Reusable.** An engine is built to be used by any gameplay layer that needs it, not coupled to a single feature.
- **Testable.** An engine is verifiable in isolation, with no UI, database, or gameplay dependency required to prove it works.
- **Replaceable.** An engine can be swapped for another implementation that satisfies the same interface, without forcing rewrites of its consumers.

---

## 2. Engine Independence

This is a permanent architectural rule. Every engine:

- Must not know the UI. Engines never import, render, or reference interface components.
- Must not know React. Engines are framework-agnostic. They expose logic and state, not views.
- Must not know Supabase directly. Engines do not hold database clients or run queries. Persistence is delegated to the official save/load interfaces.
- Must not know gameplay implementation. Engines provide substrate; gameplay consumes it. The engine never imports gameplay code.
- Must not know database implementation. Engines expose serializable state; a separate layer handles storage.
- Must communicate only through official APIs or events. No engine reaches into another engine's internals.
- Must avoid circular dependencies. Dependency direction is one-way and traceable. An engine depends only on engines that are already stable.

---

## 3. Engine Lifecycle

Every engine follows this lifecycle. Not every stage applies to every engine, but
the order is fixed when the stages are present.

```
Initialize
   ↓
Update
   ↓
Save
   ↓
Load
   ↓
Reset
```

- **Initialize.** The engine sets up its initial state, in the order defined by `Engine_Order.md`. No work happens before initialization completes.
- **Update.** The engine advances its state each tick, where applicable. Updates are deterministic and side-effect-explicit.
- **Save.** The engine exposes its serializable state through the official save interface. It never writes save files directly.
- **Load.** The engine accepts previously saved state through the official load interface and reconstructs itself from it.
- **Reset.** The engine returns to a clean initial state. No leaked timers, listeners, or residual state remain.

---

## 4. Engine Template

Every engine must follow the official Engine Template defined in
`docs/engine/Engine_Template.md`. The template requires:

- **Purpose** — one paragraph describing what the engine is and is not responsible for.
- **Dependencies** — which stable engines it depends on, and which depend on it.
- **Public API** — the typed interface other layers use to interact with the engine.
- **Internal State** — the typed shape of the engine's private state.
- **Events** — the events the engine emits and subscribes to.
- **Persistence** — how the engine's state is saved and loaded through official interfaces.
- **Testing** — how the engine is tested in isolation.
- **Future Extension** — how the engine accommodates growth without major rewrites.

No engine is implemented before its template is filled and approved.

---

## 5. Engine Dependencies

- Stable engines may be depended upon. An engine is only referenced by others after it is documented, tested, and marked stable.
- Future engines may not be referenced. An engine cannot depend on something that does not exist yet, or is not yet stable.
- Circular dependencies are forbidden. If A depends on B, B must not depend on A, directly or transitively.
- Dependencies are declared in the engine's design doc and recorded in `docs/engine/Engine_Dependencies.md`.
- An engine communicates with its dependencies only through their public APIs or events — never their internals.

---

## 6. Event Communication

- Prefer event-driven communication over direct coupling. Engines emit and subscribe to events rather than calling each other directly.
- Events are typed. Every event has a defined payload shape, declared in the engine's public API.
- Events flow one way. An emitter does not know who is listening. A listener does not know who emitted.
- Direct calls are reserved for a consumer explicitly invoking an engine's public API — never for engine-to-engine chatter.
- Event names are consistent and described in `08_Naming_Rules.md`.

---

## 7. Testing

- Every engine must be testable independently. An engine's tests run without booting the UI, the database, or gameplay.
- No UI dependency. Tests never render components or depend on React.
- No database dependency. Tests never connect to Supabase or any live store. State is constructed in memory.
- Each engine owns its own test suite. Tests live alongside the engine and are runnable in isolation.
- An engine is not marked stable until its tests pass and its public API is locked.

---

## 8. Persistence

- Engines expose state through official save/load interfaces. They never read or write save files directly.
- No engine may directly write save files. Serialization is delegated to the persistence layer; the engine only provides serializable state.
- Save and load are symmetric. What is saved is what is loaded. No implicit or hidden state crosses the boundary.
- Persistence is opt-in per engine. An engine that has no persistent state does not participate in save/load.

---

## 9. Versioning

- Engine changes must update documentation. The design doc, dependencies map, and template are revised in the same change.
- Preserve compatibility when possible. Additive changes are preferred over breaking ones.
- Breaking changes are clearly documented. The change, its reason, and its impact are recorded per the Breaking Changes Policy in `01_Project_Rules.md`.
- Public API changes are versioned. Consumers are informed before a break lands; no silent interface changes.

---

## 10. Future Expansion

- Engines must be designed to allow future extensions without major rewrites.
- Public APIs are kept minimal and stable. Growth happens through new methods and events, not by mutating existing ones.
- Internal state is shaped to accommodate foreseeable growth, but not speculative generality.
- When an engine can no longer grow without a break, the break follows the Decision Rules and Breaking Changes Policy in `01_Project_Rules.md`.
