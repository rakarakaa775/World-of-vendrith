# Testing Architecture

> The Vendrith World — the permanent testing strategy for the entire project.
>
> Testing is not an afterthought. It is part of architecture. This document defines
> how every engine, utility, infrastructure service, and persistence component is
> tested, how deterministic simulation is guaranteed, and how the project remains
> reliable as it grows.
>
> This is an architecture document. It defines strategy and contracts, not
> implementation. It specifies no test framework, no test files, and no test code.
> It defines the rules every test must follow.

---

## 1. Testing Philosophy

### Testing Is Part of Architecture
Testing is not bolted on after implementation. It is designed alongside the system
it verifies. The Event Bus is testable because it was designed to be. The Save Engine
is testable because it was designed to be. Every architecture document in this
project includes a testing section because testing is an architectural concern, not
a downstream task.

### Every System Must Be Testable
No system is merged unless it is testable in isolation. An engine that cannot run
without a live database, a network connection, or a rendered UI is not testable and
therefore not shippable. The architecture enforces testability by separating
concerns: engines speak to infrastructure through interfaces, infrastructure is
mocked in tests, and the simulation is deterministic.

### Testing Begins Before Implementation
A system's test contract is defined before its implementation. The engine design
doc declares what the engine's unit tests assert, what events it publishes and
subscribes to, and what its snapshot round-trip guarantees. Implementation follows
the contract. Tests are written before or alongside the code — never deferred to a
later phase.

### Testing Protects Long-Term Stability
The Vendrith World is a long-lived project. Engines will be rewritten, backends will
be replaced, features will be added years from now. Tests are the safety net that
makes change safe. A regression test prevents an old bug from returning. A replay
test prevents a determinism violation from slipping in. Coverage prevents a refactor
from silently dropping behavior. Testing is how the project stays stable while it
grows.

---

## 2. Testing Pyramid

The project uses a three-layer testing pyramid. Each layer has a distinct
responsibility and a distinct scope.

```
        ┌─────────────────────┐
        │ Simulation Replay   │   Few, slow, end-to-end
        │ Tests               │
        └─────────────────────┘
        ┌─────────────────────┐
        │ Integration Tests   │   Medium, cross-system
        └─────────────────────┘
        ┌─────────────────────┐
        │ Unit Tests          │   Many, fast, isolated
        └─────────────────────┘
```

### Unit Tests
The base of the pyramid. Many tests, each fast and isolated. A unit test verifies a
single engine, utility, or infrastructure component in isolation, with all
dependencies mocked. No real network, no real database, no real UI. Unit tests run in
milliseconds and form the first line of defense.

### Integration Tests
The middle layer. Fewer tests, each verifying that multiple systems communicate
correctly. An integration test wires real engines through a real Event Bus, or a
real Save Engine through a real Storage Adapter, and asserts that the systems
interact as designed. Integration tests use real infrastructure where it is safe to
do so and mock only external boundaries (network, disk, cloud).

### Simulation Replay Tests
The top of the pyramid. The fewest and slowest tests, each verifying that a recorded
simulation produces identical output when replayed. A replay test feeds a sequence of
ticks, events, and save snapshots to the full engine stack and asserts that the final
state matches a recorded golden output. Replay tests are the determinism gate: if the
same inputs ever produce different outputs, the simulation has lost determinism.

### Rules
- A bug is fixed at the lowest layer that can reproduce it. If a bug can be
  reproduced in a unit test, it is fixed with a unit test. Integration and replay
  tests are not a substitute for missing unit tests.
- Every layer is mandatory. A system is not considered tested if only one layer
  covers it. Engines require unit tests; cross-engine flows require integration
  tests; determinism requires replay tests.
- Tests are independent. No test depends on another test having run first. Tests can
  run in any order and in parallel.

---

## 3. Unit Testing

Every system in the project must be testable independently. A unit test verifies one
system in isolation with all dependencies mocked.

### Systems Requiring Unit Tests

| System | What Is Tested |
|--------|----------------|
| **Every Engine** | Tick logic, event handling, state transitions, snapshot save/load, interface queries. |
| **Every Utility** | Pure functions, data transformations, calculations, helpers. |
| **Every Storage Adapter** | Store, load, delete, backup, sync against an in-memory or mock backend. |
| **Every Event Bus Component** | Publish, subscribe, unsubscribe, queue ordering, priority, error handling. |
| **Every Serializer** | Serialize to format, deserialize from format, round-trip equality. |

### Rules
- **No UI.** A unit test never renders a component, touches the DOM, or depends on a
  browser environment. UI is tested separately and never blocks engine tests.
- **No network.** A unit test never makes an HTTP request, opens a WebSocket, or
  contacts a cloud service. Network calls are mocked.
- **No real database.** A unit test never connects to Supabase, IndexedDB, or any
  persistent store. Storage is mocked through the storage interface.
- **No cross-engine imports.** An engine unit test imports only the engine under test
  and its mocks. It does not import another engine's concrete implementation. If the
  engine needs another engine's state, the other engine is mocked through its
  interface.
- **Deterministic.** A unit test never depends on wall-clock time, random numbers, or
  execution order. Mock time and seeded randomness are used where needed.

---

## 4. Integration Testing

Integration tests verify that multiple systems communicate correctly when wired
together. They use real implementations where safe and mock only external
boundaries.

### Integration Test Categories

| Integration | What Is Verified |
|-------------|------------------|
| **Event Bus + Multiple Engines** | Events published by one engine are received by subscribed engines in the correct order, with correct payloads, within a tick. |
| **Persistence Layer + Storage Adapter** | A save is stored, retrieved, deleted, and backed up correctly through the storage interface. |
| **Save Engine + Multiple Engines** | `save()` collects correct snapshots from all engines; `load()` restores them in topological order. |
| **Save Engine + Persistence Layer** | A save is handed to the Persistence Layer, stored, retrieved, and handed back for load. |
| **Event Bus + Save Engine** | The Event Bus save check triggers the Save Engine at the correct point in the tick cascade. |

### Rules
- Integration tests use a real Event Bus and real engines where the systems under
  test are the engines and the bus. They mock only external boundaries: network,
  disk, cloud.
- Integration tests verify communication contracts, not gameplay correctness. A test
  asserts that the Inventory Engine received `inventory:item:added` with the correct
  payload — not that the item's gameplay effect is balanced.
- Integration tests are deterministic. They use mock time and seeded inputs. They do
  not depend on wall-clock time or network latency.
- An integration test is written when a flow crosses a system boundary. If a behavior
  lives entirely within one engine, it is a unit test, not an integration test.

---

## 5. Simulation Replay

Simulation replay is the determinism guarantee. The Event Bus dispatches events in a
defined order, the engines execute in a defined order, and the same inputs must
always produce identical outputs. Replay tests enforce this.

### Deterministic Replay
A replay test records a simulation session as a sequence of inputs:
- A starting save snapshot (the initial state of every engine).
- A sequence of ticks (the Time Engine's tick stream).
- A sequence of external events (player actions, injected as events on the bus).

The test feeds these inputs to the full engine stack — real engines, real Event Bus,
real Save Engine — and records the output:
- The final state of every engine (snapshots after the last tick).
- The sequence of events published on the bus.
- The sequence of saves taken.

### Replay Rules
- **Same inputs must always produce identical outputs.** If a replayed session ever
  produces a different event sequence, a different final state, or a different save,
  the simulation has lost determinism. This is a test failure and a build blocker.
- **Replay is isolated.** No network, no cloud, no wall-clock time. The replay harness
  controls time, randomness, and all external inputs.
- **Replay is recorded once, replayed forever.** A golden recording is captured at a
  point in time. It is replayed against every future build. If the output changes, the
  test fails and the change is investigated — either the change is a bug, or the
  change is intentional and the golden recording is updated with Lead Architect
  approval.
- **Replay covers save snapshots.** A replay test saves at intervals during the
  session, loads each save, and asserts that the loaded state matches the state at the
  save point. This verifies that save/load does not alter simulation state.

### What Replay Detects
- Non-determinism introduced by wall-clock time, random numbers, or iteration order.
- Event ordering violations — an engine receiving events out of order.
- Save/load corruption — a save that does not restore identical state.
- Silent regressions — a refactor that changes simulation output without updating
  tests.

---

## 6. Save Testing

Every engine and the Save Engine must pass round-trip testing. A round-trip test
verifies that save and load preserve state perfectly.

### Round-Trip Test
```
1. Save   — engine.save() produces snapshot A
2. Load   — engine.load(snapshot A) restores state
3. Save   — engine.save() produces snapshot B
4. Compare — snapshot A must deeply equal snapshot B
```

### Rules
- **No information may be lost.** If snapshot A and snapshot B differ, the engine's
  save or load is lossy. This is a test failure.
- **Round-trip tests run per engine.** Each engine is tested independently. The Save
  Engine's collect/combine/restore flow is tested separately with synthetic snapshots
  from all engines.
- **Round-trip tests run after migration.** A migrated save is round-trip-tested to
  confirm that migration did not introduce loss.
- **Round-trip tests include edge cases.** Empty state, maximal state, state with
  optional fields absent, state with collections at boundary sizes. An engine is not
  considered tested if only the happy path is round-tripped.

---

## 7. Migration Testing

Every migration in the pipeline must be tested. A migration test verifies that an
old save is correctly transformed and that failure does not destroy data.

### Migration Test Structure
```
1. Old Save       — a golden save at version N
2. Migration      — run migration N → N+1
3. Validation    — validate the migrated save
4. Rollback      — confirm the original save is intact on failure
5. Expected Output — assert the migrated save matches the golden output at N+1
```

### Rules
- **Every migration has a golden test.** A golden save at version N is migrated to
  N+1 and asserted against a known-good output. The golden save and output are
  committed to the repository and never edited by hand.
- **Failed migration never destroys the original save.** A migration test injects a
  failure (malformed input, validation failure) and asserts that the original save is
  retained untouched and offered for load.
- **Migration tests cover the full pipeline.** A save at the oldest supported version
  is migrated through every step to the current version and asserted against the final
  golden output. This catches interactions between migrations.
- **Migration tests cover unsupported versions.** A save too new to load and a save
  too old to migrate are both tested — they must be rejected, not destroyed, and the
  player must be informed.

---

## 8. Mock Infrastructure

No engine unit test may require real infrastructure. The project provides a set of
mock infrastructure components that implement the same interfaces as the real ones.

### Mock Components

| Mock | Interface Implemented | Purpose |
|----------------------------------------------|---------|
| **Mock Event Bus** | Event Bus | Records published events, supports deterministic replay, asserts on event order and payloads. |
| **Mock Logger** | Logger | Captures log entries, asserts on category and level, never writes to disk or console. |
| **Mock Storage** | Storage Adapter | Stores saves in memory, simulates failures on demand, asserts on store/load/delete behavior. |
| **Mock Time** | Time Provider | Returns controlled tick numbers and timestamps, never wall-clock time. |
| **Mock Configuration** | Configuration Provider | Returns declared values, simulates missing or invalid configuration. |

### Rules
- **Mocks implement real interfaces.** A mock is not a loose object; it is a typed
  implementation of the same interface the real component implements. An engine cannot
  tell whether it is talking to a real bus or a mock bus.
- **Mocks are deterministic.** They never depend on wall-clock time, random numbers,
  or network state. Their behavior is fully controlled by the test.
- **Mocks are injectable.** Engines receive infrastructure through their constructors.
  A test passes mocks; the composition root passes real implementations. No engine
  constructs its own infrastructure.
- **Mocks can simulate failure.** A mock storage adapter can be told to fail on the
  next write. A mock bus can be told to throw on the next dispatch. This is how error
  paths are tested without real infrastructure.
- **No engine unit test imports real infrastructure.** This is enforced by linting and
  review. An engine that imports a real storage adapter, a real logger, or a real
  network client in its test path is rejected.

---

## 9. Error Testing

Every error path in the architecture must be tested. An error path that is not
tested is assumed broken.

### Error Paths

| Error | What Is Tested |
|-------|----------------|
| **Corrupted Save** | A save with a bad checksum is rejected, not loaded, and the previous valid save is offered. |
| **Missing Snapshot** | A save missing a required engine snapshot is rejected as incomplete, not partially loaded. |
| **Network Failure** | A cloud sync failure defers sync, continues gameplay, and retries per policy. The local save is used. |
| **Storage Failure** | A local write failure is logged, the player is warned, and the simulation continues without saving. |
| **Invalid Version** | A save with an invalid version number is rejected and the player is informed. |
| **Unsupported Version** | A save too new to load or too old to migrate is retained as an archive, not deleted. |
| **Graceful Recovery** | Every error path offers the player a clear message and a next step. No error path crashes the simulation. |

### Rules
- **The previous valid save is never destroyed.** Every error test asserts that the
  backup save is retained and available after the error.
- **Error tests are deterministic.** Failures are injected through mocks, not by
  waiting for real network or disk failures.
- **Error tests assert on player-facing behavior.** A test verifies that the correct
  message is surfaced and the correct recovery option is offered — not just that an
  exception was caught.
- **Error tests cover cascading failures.** A save that fails validation after
  migration, a sync that fails during shutdown, a storage failure during autosave —
  each combination is tested to confirm the system degrades gracefully.

---

## 10. Performance Testing

Performance tests measure the simulation's resource usage. They do not assert
hard limits; they track metrics over time and detect regressions.

### Measured Metrics

| Metric | What Is Measured |
|--------|------------------|
| **Tick Time** | Wall-clock time to execute one full tick cascade (all engines, in order). |
| **Memory Usage** | Heap size after a sustained simulation run. Detects memory leaks. |
| **Queue Size** | Event Bus queue depth during a tick. Detects unbounded queue growth. |
| **Serialization Time** | Time to serialize all engine snapshots into a save. |
| **Loading Time** | Time to load a save, migrate, validate, and restore all engines. |

### Rules
- **Optimization only after measurement.** No performance optimization is made
  without a measurement showing a problem. Premature optimization is rejected.
- **Performance tests track trends, not thresholds.** A performance test records
  metrics on every build and flags regressions — a metric that worsens significantly
  from the previous build. Hard thresholds are set only for metrics that directly
  affect player experience (e.g., tick time exceeding a frame budget).
- **Performance tests are deterministic in setup.** They use seeded inputs and mock
  time. The measured value is the system's performance, not the test environment's
  variance.
- **Performance tests run on a fixed dataset.** A standard save size and a standard
  tick count are used so results are comparable across builds.

---

## 11. Continuous Integration

Every change passes through a CI pipeline before merge. A failed step blocks merge.

### CI Pipeline (in order)

| Step | Description |
|------|-------------|
| **Build** | The project compiles with no errors. A failed build blocks everything downstream. |
| **Static Analysis** | Linting and type checking pass. No warnings are allowed in core architecture and infrastructure. |
| **Unit Tests** | All unit tests pass. No engine, utility, or infrastructure component is exempt. |
| **Integration Tests** | All integration tests pass. Cross-system flows are verified. |
| **Replay Tests** | All simulation replay tests pass. Determinism is confirmed. |
| **Coverage** | Coverage meets the minimum thresholds defined in Section 12. |
| **Determinism Check** | A recorded simulation is replayed twice and the outputs are compared. Any divergence blocks merge. |
| **Architecture Validation** | Automated checks confirm that architecture rules are honored: no engine imports another engine's concrete implementation, no client code uses the service role key, RLS is enabled on every table, every engine implements save/load. |

### Rules
- **A failed test blocks merge.** No step is advisory. No test is optional. If any
  step fails, the change is not merged until the failure is resolved or the test is
  explicitly waived by Lead Architect approval with a documented reason.
- **CI is fast.** Unit tests run first and are parallelized. Slow tests (replay,
  performance) run last. A developer gets unit test feedback within seconds.
- **CI is reproducible.** The same commit always produces the same CI result. No
  flaky tests are tolerated — a flaky test is either fixed or quarantined with a
  tracked issue.
- **Architecture validation is automated.** The rules in the architecture documents
  are checked by tooling, not just by review. An engine that imports another engine's
  internals is caught by CI, not by a reviewer's memory.

---

## 12. Coverage Policy

Coverage is measured and enforced. It supports quality but does not replace design
review.

### Minimum Coverage Expectations

| Layer | Coverage | Rationale |
|-------|----------|-----------|
| **Core Architecture** (Event Bus, Save Engine, Persistence Layer) | Very High | These systems are the backbone. A bug here affects every engine. |
| **Infrastructure** (Storage Adapters, Logger, Configuration) | High | Infrastructure failures are hard to diagnose. High coverage catches them early. |
| **Utilities** (Pure functions, helpers) | High | Utilities are reused everywhere. A bug propagates widely. |
| **Gameplay** (Engines) | High | Each engine's tick logic and state transitions are critical to simulation correctness. |
| **UI** (Presentation Layer) | Moderate | UI is tested for behavior and rendering, but exhaustive coverage is lower priority than simulation and infrastructure. |

### Rules
- **Coverage supports quality but does not replace design review.** A system with
  100% coverage can still be wrong if the tests assert the wrong behavior. Coverage
  confirms that code is exercised; it does not confirm that code is correct.
- **Coverage is measured per layer.** A project-wide average hides gaps. The core
  architecture's coverage is measured separately from the UI's.
- **Coverage does not decline.** A change that lowers coverage below the threshold
  for its layer is blocked. Coverage may rise; it may not fall.
- **Coverage excludes mocks and generated code.** Test helpers, mock
  implementations, and generated code are not counted against coverage.

---

## 13. Regression Testing

Every fixed bug becomes a permanent regression test. This is how old bugs are
prevented from returning.

### Rules
- **A bug fix is not complete without a regression test.** The fix is not merged
  until a test is added that fails without the fix and passes with it.
- **The regression test is permanent.** It is never deleted. Even if the bug seems
  impossible to reintroduce, the test stays. Code changes in ways no one predicts.
- **The regression test is minimal.** It reproduces the bug with the smallest
  possible input. It does not test the entire system — it tests the specific
  behavior that was broken.
- **The regression test is named after the bug.** Its name or description
  references the issue or the behavior that was broken, so a future developer who
  sees the test understands what it protects.
- **Regression tests live at the lowest layer that reproduces the bug.** If the bug
  is in one engine, the regression test is a unit test. If the bug is in a cross-engine
  flow, it is an integration test. If the bug is a determinism violation, it is a
  replay test.

---

## 14. Future Expansion

The Testing Architecture is designed to support future scenarios without changing
testing philosophy.

### Dedicated Server
A dedicated server runs the same simulation through the same engines. The same
unit, integration, and replay tests apply. Server-specific tests verify headless
operation (no UI, no rendering) and the server's storage adapter. No new testing
philosophy is needed.

### Multiplayer
Multiplayer introduces networked events and shared world state. The testing
strategy extends: network events are tested as a new event category through the
mock bus; shared state is tested through a multi-client integration harness that
runs two simulations and asserts they converge. The philosophy — deterministic,
isolated, replayable — does not change.

### Cloud
Cloud sync is tested with a mock cloud backend that simulates latency, conflict,
and failure. The same error tests apply. A real-cloud integration test runs in a
staging environment, not in the unit test suite. The philosophy does not change.

### Mods
A mod implements the same engine interfaces and is tested the same way: unit tests
for the mod's engine, integration tests for the mod's interaction with the Event
Bus, replay tests if the mod affects simulation. The testing architecture treats a
mod identically to a core engine.

### Plugin Engines
A plugin engine is tested like any other engine. Its unit tests mock the bus and
infrastructure. Its integration tests wire it alongside core engines. If the plugin
affects simulation determinism, it is included in replay tests. No new testing
philosophy is needed.

### Future Storage Providers
A new storage provider implements the storage interface and is tested with the same
storage adapter tests. The Save Engine's tests do not change because they speak to
the interface, not the backend. A new provider adds a new adapter test suite; it
does not alter the existing one.

### What Does Not Change
- The three-layer testing pyramid.
- The determinism guarantee and replay testing.
- The mock infrastructure requirement for unit tests.
- The round-trip save testing contract.
- The migration testing contract.
- The regression testing rule.
- The CI pipeline and merge-blocking policy.
- The coverage policy and its layer-specific thresholds.

The Testing Architecture is built once. Future expansion adds test suites within
the existing structure; it does not redesign the structure.

---

## Closing Statement

Testing Architecture permanently guarantees the reliability of The Vendrith World.

Testing is part of architecture, not an afterthought. Every system is testable in
isolation. The simulation is deterministic and replay tests enforce it. Saves are
round-trip tested so no information is lost. Migrations are tested so old saves
survive. Error paths are tested so the simulation degrades gracefully. Performance
is measured before it is optimized. CI blocks merge on any failure. Coverage is
enforced per layer. Every fixed bug becomes a permanent regression test.

Every future engine, module, and subsystem must follow this architecture. An engine
that cannot be unit-tested in isolation is rejected. A flow that cannot be
integration-tested is rejected. A simulation that cannot be replayed deterministically
is rejected. A save that cannot be round-tripped is rejected. A migration that can
destroy data is rejected.

Any change to this architecture — a new test layer, a new coverage threshold, a new
CI step — requires Lead Architect approval and an update to this document before any
implementation begins.
