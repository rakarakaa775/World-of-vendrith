# Event Bus Architecture

> The Vendrith World — the permanent communication backbone between engines.
>
> The Event Bus is an Infrastructure Layer service. It owns no gameplay logic. It
> only transports events. Every engine communicates through the bus or through
> declared interfaces — never through direct imports of another engine's
> implementation.
>
> This document is the authoritative specification for the Event Bus. All future
> engine blueprints must comply with this architecture.

---

## 1. Philosophy

### Event-Driven Communication
Engines do not call each other's mutation methods directly. When an engine's state
changes in a way other systems should react to, it publishes an event. Other
engines and the application layer subscribe to the events they care about. This
keeps engines decoupled: a publisher does not know who listens, and a subscriber
does not know who published.

### Loose Coupling
Because communication flows through the bus, an engine can be replaced, rewritten,
or removed without its subscribers or publishers changing — as long as the event
contract is honored. The Event Bus is the seam that makes every engine
replaceable.

### Deterministic Execution
The simulation is deterministic. Within a single tick, events are dispatched in a
defined order. The same inputs produce the same outputs, every time. This is what
makes the simulation testable, replayable, and debuggable. Non-determinism is
quarantined to background services and never enters the simulation path.

### Interface-First Communication
Engines expose typed public interfaces for direct queries (e.g., "what is the
current time?") and use the Event Bus for reactive notifications (e.g., "the day
changed"). The bus is not a replacement for interfaces — it is the complement.
Direct queries go through interfaces; state-change notifications go through the
bus. Neither path imports a concrete engine implementation.

---

## 2. Tick-Based Simulation

The entire world simulation follows the Time Engine. Every simulation cycle —
every tick — begins with the Time Engine and cascades through the engines in the
defined order.

```
Time Engine Tick
       ↓
Publish Tick Event
       ↓
World Engine
       ↓
Life Engine
       ↓
Energy Engine
       ↓
Activity Engine
       ↓
Inventory Engine
       ↓
Dialogue Engine
       ↓
NPC AI Engine
       ↓
Quest Engine
       ↓
Optional Save Check
```

### Rules
- **Every engine executes once per tick, in the defined order.** The order matches
  the Engine Dependency Graph's topological build order. An engine never runs before
  an engine it depends on.
- **The tick is the unit of simulation time.** All simulation progress is measured
  in ticks. The Time Engine owns the tick counter and advances it.
- **The tick event is the heartbeat.** When the Time Engine advances, it publishes
  `time:tick:started`. Each engine, subscribed to this event, executes its tick
  logic in turn. The cascade is the simulation.
- **Optional Save Check.** After the Quest Engine completes its tick, an optional
  save check runs. Whether to save is decided by the Save Engine's policy (interval,
  player trigger, or shutdown) — not by the simulation. The save check never alters
  simulation state.
- **No engine may execute outside its turn.** An engine does not spontaneously
  react mid-tick in a way that re-enters an earlier engine. Events published during
  a tick are queued and processed in the next pass or the next tick, per the
  dispatch model in Section 6.

---

## 3. Publish / Subscribe Model

Engines communicate only through events or declared interfaces. The Event Bus
provides three operations.

### Publish
An engine calls `bus.publish(event)` to emit an event. The publisher does not know
who is listening. It provides the event name, the tick, the source, and the typed
payload. The bus is responsible for delivering the event to all subscribers.

### Subscribe
An engine calls `bus.subscribe(eventName, handler)` during initialization to
register interest in an event. The handler receives the typed event. A subscriber
may subscribe to multiple events. Multiple subscribers may subscribe to the same
event.

### Unsubscribe
An engine calls `bus.unsubscribe(subscription)` during shutdown to release its
subscriptions. The `subscribe` call returns a subscription handle; the engine holds
it and uses it to unsubscribe. This prevents memory leaks and stale handlers.

### Rules
- Engines communicate only through events or interfaces. No engine reaches into
  another engine's internals.
- The bus is the only event transport. Engines do not call each other's handler
  methods directly to simulate events.
- A subscriber may query a publisher's interface during event handling (e.g., to
  read current state), but it may not mutate the publisher. Mutation flows through
  the publisher's own interface methods, not through event handlers.

---

## 4. Event Naming

The permanent event naming format is:

```
domain:subject:action
```

- **domain** — the engine or system that owns the event (e.g., `time`, `life`,
  `inventory`, `quest`).
- **subject** — the entity or concept the event concerns (e.g., `tick`, `day`,
  `item`, `energy`).
- **action** — what happened (e.g., `started`, `changed`, `added`, `completed`).

### Examples

```
time:tick:started
time:day:changed
time:hour:advanced

world:weather:changed
world:region:loaded

life:entity:spawned
life:entity:died
life:aging:advanced

energy:energy:updated
energy:energy:depleted

activity:activity:started
activity:activity:completed

inventory:item:added
inventory:item:removed
inventory:item:equipped

dialogue:conversation:started
dialogue:line:spoken

npc_ai:decision:made
npc_ai:goal:updated

quest:objective:completed
quest:completed
quest:started

save:save:started
save:save:completed
```

### Rules
- The format is permanent. Every event in the project follows it.
- Names are lowercase, singular, and use underscores within a segment if needed.
- An event name is a contract. Once published and subscribed to, it does not change.
  If the meaning must change, a new event name is introduced and the old one is
  deprecated with a documented migration.
- The domain segment matches the engine's canonical name. No engine publishes events
  in another engine's domain.

---

## 5. Typed Event Payloads

Every event carries a strongly typed payload. No anonymous or untyped payloads are
permitted on the bus.

### Event Structure
Every event has four fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The event name, in `domain:subject:action` format |
| `tick` | `number` | The tick during which the event was published |
| `source` | `string` | The engine or system that published the event |
| `payload` | typed object | The strongly typed data specific to the event |

### Typing Rules
- Each event name has a corresponding payload interface (e.g., `TimeTickStartedPayload`,
  `InventoryItemAddedPayload`). The payload interface is declared in the publishing
  engine's design doc.
- The bus is generic over event types. A subscriber registers with a specific event
  name and receives a handler typed to that event's payload. The type system enforces
  that the handler's parameter matches the event's payload type.
- No `any`. No `unknown` cast. No ad-hoc object passed as a payload. If a payload
  field is optional, the interface declares it as optional.
- Payloads are serializable. Because the Save Engine may record events and the
  testing strategy may replay them, payloads contain only data — no functions, no
  class instances, no circular references.

---

## 6. Dispatch Model

### Simulation Events — Synchronous Inside a Tick
Simulation events are dispatched synchronously within a tick. When an engine
publishes a simulation event, the bus delivers it to all subscribers before
returning control to the publisher. This guarantees that by the time the next
engine in the tick order runs, the previous engine's events have been fully
processed.

### Background Services — Asynchronous
Background services — cloud sync, analytics, asset loading — may use asynchronous
events. These events are dispatched outside the simulation tick and do not affect
simulation state. The bus supports an async dispatch path for these services,
clearly separated from the synchronous simulation path.

### Deterministic Order
Simulation order must always remain deterministic. Within a tick:
1. The Time Engine publishes `time:tick:started`.
2. Each engine, in topological order, executes its tick logic.
3. Events published during an engine's tick are queued (see Section 7) and
   processed before the next engine runs, in publish order.
4. No two engines ever execute concurrently within a tick.

The same tick inputs produce the same outputs, every time. This is a permanent
guarantee. Any feature that introduces non-determinism into the simulation path is
rejected.

---

## 7. Event Queue

### Queue Semantics
Incoming events enter a queue. The queue is processed in order — first in, first
out. No event may jump ahead of another. This preserves the deterministic dispatch
model.

### Processing Rules
- **In-order processing.** Events are dispatched in the order they were published.
- **No jumping.** No subscriber may promote its event ahead of others. Priority
  (Section 8) is an infrastructure concern, not a gameplay one.
- **No recursive event loops.** A handler may not publish an event that triggers
  its own handler synchronously within the same dispatch. If a handler needs to
  emit an event in response, the event is queued and processed in the next pass or
  the next tick. This prevents infinite recursion and stack overflow.
- **Queue draining.** Within a tick, after each engine runs, its queued events are
  drained before the next engine begins. This ensures an engine's side effects are
  fully resolved before the next engine observes state.

### Queue Boundaries
- The queue is per-tick. At the start of a tick, the queue is empty. Events
  published during the tick are processed within the tick.
- An event published after the last engine (Quest Engine) has run is held for the
  next tick. This prevents late events from retroactively altering the current
  tick's state.

---

## 8. Priority

Four priority levels are defined:

| Priority | Use |
|----------|-----|
| Critical | System-critical events: shutdown, fatal error, save-required. Processed before all others. |
| High | Time-sensitive infrastructure events: asset unload, memory warning. |
| Normal | Default. All simulation events. |
| Low | Non-urgent events: analytics, telemetry, debug logging. |

### Rules
- **Only Infrastructure may prioritize events.** The priority field is set by the
  bus or infrastructure services, not by gameplay code.
- **Gameplay never changes queue priority dynamically.** An engine does not assign
  priority to its events. All simulation events are `Normal`. The simulation is
  deterministic because priority never reorders simulation events.
- **Priority affects processing order only within the same queue drain.** It does
  not allow an event to jump ahead of events from an earlier engine's turn.
- **Critical priority is reserved.** It is used for shutdown and fatal-error
  events that must preempt normal processing. Gameplay engines never publish
  critical events.

---

## 9. Error Handling

When a subscriber's handler throws an error during dispatch, the bus follows this
protocol:

1. **Catch the error.** The bus catches the exception. It does not propagate the
   throw to the publisher or to other subscribers.
2. **Log it.** The bus logs the error with the event name, the subscriber
   identifier, the tick, and the error message. The log uses the `[event]` category
   and `error` level, per the Logging Philosophy in Architecture Principles §9.
3. **Continue remaining subscribers when safe.** The bus proceeds to the next
   subscriber for the same event. One failed subscriber does not prevent other
   subscribers from receiving the event.
4. **Prevent total simulation failure.** A single handler error does not crash the
   simulation. The tick continues, the next engine runs, and the player is informed
   only if the error affects their experience.

### Escalation
- If a subscriber fails repeatedly across ticks, the bus reports the failure to the
  application layer. The application layer decides whether to disable the failing
  subscriber, surface an error to the player, or pause the simulation.
- A `Critical` priority event (e.g., `system:shutdown:requested`) is always
  dispatched, even if earlier handlers failed. Shutdown is never blocked by a
  handler error.

### What the Bus Does Not Do
- The bus does not retry a failed handler automatically. Retry is a policy owned by
  the subscriber or the application layer, not the bus.
- The bus does not swallow errors silently. Every caught error is logged.
- The bus does not alter simulation state to recover. It transports events; it does
  not fix gameplay.

---

## 10. Subscription Lifecycle

### Initialization
Engines subscribe during initialization. An engine's constructor or
`initialize()` method receives the event bus and registers its handlers. By the
time the first tick runs, every engine's subscriptions are in place.

### Shutdown
Engines unsubscribe during shutdown. An engine's `shutdown()` method releases all
subscriptions using the handles returned by `subscribe`. No handler remains
registered after the engine is torn down.

### Memory Leak Prevention
- `subscribe` returns a subscription handle. The engine stores the handle.
- `unsubscribe` removes the handler from the bus. After unsubscribe, the handler is
  not called again and the reference is released.
- The composition root (Application Layer) owns the lifecycle. It constructs
  engines, injects the bus, calls `initialize()` to subscribe, and calls
  `shutdown()` to unsubscribe. An engine is never left half-subscribed.
- If an engine fails during initialization, the composition root unwinds: every
  engine already initialized is shut down, and the bus is destroyed. No partial
  state survives a failed startup.

### Composition Root Authority
The composition root is the only authority over lifecycle. Engines do not
subscribe or unsubscribe each other. The application layer sequences construction
and teardown. This centralizes lifecycle management and prevents engines from
holding hidden references to each other through the bus.

---

## 11. Testing Strategy

The Event Bus must be testable independently. Engines are tested with a mock bus;
the bus is tested with mock subscribers.

### Mock Implementation
A mock event bus is provided for tests. It implements the same interface as the
production bus but does not dispatch through the real queue. It records every
published event and every subscription, giving tests full visibility into what was
published and who is listening.

### Recording Published Events
The mock bus records every call to `publish` in order. A test asserts:
- That an expected event was published.
- That the event's payload matches the expected shape and values.
- That events were published in the expected order.
- That no unexpected events were published.

### Deterministic Replay
The mock bus supports deterministic replay. A test provides a sequence of events;
the mock bus dispatches them in order to registered subscribers. This allows an
engine to be tested in isolation by feeding it a recorded event stream and asserting
on its state and outputs. Replay is deterministic: the same event stream always
produces the same result.

### Test Categories
- **Bus unit tests.** The bus is tested with synthetic subscribers: publish,
  subscribe, unsubscribe, queue ordering, error handling, priority. No engine is
  involved.
- **Engine unit tests.** An engine is tested with the mock bus: feed events,
  assert state, assert published events. No other engine is involved.
- **Integration tests.** Multiple engines are wired through a real bus and driven
  by a sequence of ticks. The simulation order and event flow are asserted end to
  end.

---

## 12. Future Expansion

The Event Bus is designed to support future scenarios without redesign.

### Multiplayer
In a multiplayer future, the bus is the local edge of a networked event system.
Simulation events remain synchronous and deterministic on each client. Network
events — authoritative state deltas, player actions from other clients — arrive
as a separate event category dispatched outside the simulation tick. The bus's
typed-payload contract means a network event is validated against its payload
interface before it enters the simulation.

### Modding
Mods implement the same engine interfaces and publish through the same bus. A
mod's events follow the `domain:subject:action` format. The mod registers at the
composition root like any other engine. Because the bus is interface-driven, a mod
cannot break a core engine's contract — it can only subscribe to and publish
declared events.

### Plugin Engines
A plugin engine is added by declaring its events, subscribing to existing events,
and registering at the composition root. The bus treats it identically to a core
engine. No bus change is needed to support a plugin.

### Dedicated Server
A dedicated server runs the same simulation through the same bus, without a
Presentation Layer. The bus's separation of synchronous simulation dispatch from
asynchronous background dispatch means the server runs the simulation tick
identically to a client. Network I/O is a background service, not a simulation
concern.

### Future Networking
Because payloads are serializable and typed, the bus's events can be transported
over a network with no structural change. A future transport layer serializes the
typed payload, sends it, and deserializes it on the other end against the same
interface. The bus does not know or care whether a subscriber is local or remote —
it dispatches the event; the transport handles delivery.

### What Does Not Change
- The `domain:subject:action` naming format.
- The typed-payload contract.
- The synchronous, deterministic, in-order simulation dispatch.
- The publish/subscribe/unsubscribe API.
- The error-handling protocol.

The bus is built once. Future expansion extends around it; it does not redesign it.

---

## Closing Statement

The Event Bus is the permanent communication backbone of The Vendrith World.

It is an Infrastructure Layer service. It owns no gameplay logic. It transports
typed events, in a deterministic order, through a publish/subscribe model. It is
the seam that makes every engine replaceable, the queue that makes the simulation
deterministic, and the contract that makes the project testable.

All future engine blueprints must comply with this architecture. An engine
subscribes during initialization, unsubscribes during shutdown, publishes events in
the `domain:subject:action` format with typed payloads, and never imports another
engine's concrete implementation. The bus is the only event transport. No engine
circumvents it.

Any change to this architecture — a new dispatch mode, a new priority level, a new
event category — requires Lead Architect approval and an update to this document
before any implementation begins.
