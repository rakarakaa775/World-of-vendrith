# Persistence Architecture

> The Vendrith World — the permanent contract between the Save Engine and the
> Storage Layer.
>
> This document defines how every piece of game data is saved, loaded, migrated,
> synchronized, validated, and protected. It is an architecture document. It is
> NOT a database design. It defines no tables, no SQL, and no schema. It defines
> the rules every storage backend must follow.
>
> The Save Engine serializes state. The Persistence Layer stores data. The two are
> separate, and the storage backend may change without affecting any gameplay
> engine.

---

## 1. Philosophy

### Persistence Is Independent From Gameplay
Gameplay engines know nothing about how their state is stored. They produce
serializable snapshots and consume snapshots on load. They do not know whether the
backend is local storage, IndexedDB, Supabase, or a future cloud provider. This
separation is what makes the simulation portable: the same engine code runs against
any storage backend that honors this architecture.

### Save Engine Serializes State
The Save Engine's only job is to collect snapshots from every engine, combine them
into a single save, and restore snapshots on load. It is a coordinator. It does
not decide what a snapshot contains — each engine owns its own serializable state.
It does not decide what a save means — gameplay rules live in the engines.

### Persistence Layer Stores Data
The Persistence Layer is the storage backend. It stores saves, retrieves them,
deletes them, backs them up, and synchronizes them across devices. It is a transport
and retention service. It receives a serialized save from the Save Engine and
returns one on request. It never interprets save contents.

### Storage Backend May Change Without Changing Engines
Because the Save Engine speaks to the Persistence Layer through a storage interface
— not to a specific backend — the backend can be replaced. A local-first build can
ship with IndexedDB. A cloud build can add Supabase. A future build can replace
either. No gameplay engine and no Save Engine logic changes. Only the adapter at
the composition root changes.

---

## 2. Save Snapshot

A save is a single serializable document composed of a global header and one
snapshot per engine.

### Global Header
Every save begins with a global header:

| Field | Type | Description |
|-------|------|-------------|
| `saveVersion` | `number` | The format version of the save file itself (the envelope). |
| `worldVersion` | `number` | The version of the world content (engine snapshot versions combined). |
| `timestamp` | `number` | Wall-clock time when the save was created (ISO 8601 or epoch ms). |
| `tick` | `number` | The simulation tick at which the save was taken. |
| `playerId` | `string` | The owning player's identifier. |
| `checksum` | `string` | A checksum over the entire save body, used for integrity validation. |

The header is written by the Save Engine. It is read first on load, before any
engine snapshot is touched.

### Engine Snapshots
Every engine owns its own serializable state. A snapshot is the engine's complete
persistent state at the moment of save — nothing more, nothing less.

- **Each engine defines its own snapshot interface.** The interface is declared in
  the engine's design doc. The Save Engine calls `engine.save()` and receives a
  typed object; it calls `engine.load(snapshot)` and the engine restores itself.
- **No engine may serialize another engine.** An engine's snapshot contains only
  its own state. If an engine needs state owned by another engine, it references it
  by identifier (e.g., an entity ID), never by copying the other engine's data.
- **Snapshots are serializable.** No functions, no class instances, no circular
  references. A snapshot is plain data that can be serialized to JSON (or any
  future format) and deserialized back.
- **Snapshots are self-describing.** Each engine snapshot carries its own
  `engineName` and `snapshotVersion` so the migration system can route it correctly
  on load.

### Save Composition
```
Save
├── Global Header
├── Time Engine Snapshot
├── World Engine Snapshot
├── Life Engine Snapshot
├── Energy Engine Snapshot
├── Activity Engine Snapshot
├── Inventory Engine Snapshot
├── Dialogue Engine Snapshot
├── NPC AI Engine Snapshot
└── Quest Engine Snapshot
```

The Save Engine assembles this structure on save and disassembles it on load. The
order of engine snapshots in the save is the topological build order from the Engine
Dependency Graph. On load, snapshots are restored in the same order — an engine is
restored before any engine that depends on it.

---

## 3. Save Engine Responsibility

The Save Engine is the coordinator between the Engine Layer and the Persistence
Layer. Its responsibilities are narrow and permanent.

### Collects Snapshots
On save, the Save Engine iterates every engine in topological order and calls
`engine.save()`. It receives each engine's typed snapshot and assembles them into
the save structure defined in Section 2.

### Combines Them
The Save Engine writes the global header, attaches every engine snapshot, computes
the checksum, and produces a single serialized save document. It hands the document
to the Persistence Layer for storage.

### Restores Snapshots
On load, the Save Engine retrieves the save document from the Persistence Layer,
validates it (Section 10), migrates it if needed (Section 9), and then iterates
every engine in topological order calling `engine.load(snapshot)`. Each engine
restores its own state from its own snapshot.

### Never Owns Gameplay
The Save Engine does not decide what a day is, how energy is calculated, whether a
quest is complete, or what an item does. It serializes what the engines produce and
restores it. If a gameplay rule changes, the engine changes — the Save Engine does
not.

### Never Modifies Engine Logic
The Save Engine calls `save()` and `load()` on engines through their interfaces. It
does not reach into engine internals, reassign engine fields, or patch engine state
outside the declared load path. An engine's `load()` method is the only way its
state is restored.

### Only Coordinates Save/Load
The Save Engine decides when to save (per the trigger policy in Section 7), assembles
the save, and hands it to the Persistence Layer. It decides when to load, retrieves
the save from the Persistence Layer, and feeds snapshots to engines. It does not
store data itself — that is the Persistence Layer's job. It does not sync data
itself — that is the Persistence Layer's job. It coordinates.

---

## 4. Persistence Layer

The Persistence Layer is the storage backend. It is behind a storage interface so
the backend can change without affecting the Save Engine or any gameplay engine.

### Responsibilities

| Operation | Description |
|-----------|-------------|
| **Store** | Persist a serialized save document under a player and slot identifier. |
| **Load** | Retrieve a serialized save document by player and slot. |
| **Delete** | Remove a save document. Deletion is soft by default — the previous valid save is retained as backup until the new save is confirmed. |
| **Backup** | Maintain a rollback copy of the last known-good save before overwriting. |
| **Sync** | Synchronize local and cloud copies (Section 6). |

### Storage Interface
The Save Engine speaks to the Persistence Layer through a `StorageAdapter`
interface. Any backend that implements this interface can be used. The composition
root selects the adapter; the Save Engine is unaware of which adapter is active.

### Supported Backends
The Persistence Layer may use any of the following, individually or in
combination, without changing the Save Engine:

- **Local Storage** — for small, fast, single-session saves.
- **IndexedDB** — for larger local saves and offline-first autosave.
- **Supabase** — for cloud persistence, cross-device sync, and authenticated
  player ownership.
- **Future cloud providers** — any backend implementing the storage interface.

A production build typically uses IndexedDB locally and Supabase in the cloud, with
the Persistence Layer mediating between them. The Save Engine is unaware of this
arrangement.

---

## 5. Offline First

### Core Simulation Always Works Offline
The simulation does not require a network connection to run. Every gameplay engine
operates on local state. The Time Engine ticks, the World Engine advances, the Life
Engine ages entities — all without contacting a server. A player can start the
game, play for hours, and save with no network.

### Saving Locally Always Has Priority
When a save is triggered, the local store is written first. The local save is the
source of truth for the running simulation. Cloud synchronization happens after the
local save succeeds, asynchronously, and never blocks the simulation.

### Cloud Synchronization Is an Extension
Cloud sync is a feature layered on top of local persistence, not a replacement for
it. A build without cloud sync still saves and loads correctly. A build with cloud
sync uses the local save as the primary copy and the cloud save as a secondary,
synchronized copy.

### Offline Mode Must Never Stop Gameplay
If the network is unavailable, the game continues. Saves are written locally. Sync
is deferred until connectivity returns. The player is never blocked from playing,
saving, or loading by a network failure. The simulation is never paused to wait for
a cloud response.

---

## 6. Cloud Synchronization

Cloud synchronization reconciles the local save with the cloud save. It must never
corrupt saves.

### Upload
After a local save succeeds, the Persistence Layer uploads the save to the cloud
backend (Supabase). The upload is asynchronous and non-blocking. If the upload
succeeds, the cloud copy is updated. If it fails, the local save remains valid and
the upload is retried per the retry policy.

### Download
On startup, or when the player selects a cloud save, the Persistence Layer
downloads the cloud save. Before the cloud save replaces the local save, conflict
detection runs. The download is validated (Section 10) before it is offered to the
Save Engine for load.

### Conflict Detection
When both a local save and a cloud save exist, the Persistence Layer compares:
- **Timestamp** — which save is newer.
- **Tick number** — which save represents further simulation progress.
- **Checksum** — whether the saves are identical.

If the local and cloud saves differ, a conflict is flagged. The player is informed
and asked to choose, or a default resolution policy is applied (see below).

### Conflict Resolution
The default resolution policy is **last-write-wins by timestamp**, with the tick
number as a tiebreaker. If the player is present and the conflict is significant
(saves differ by more than a threshold), the player is asked to choose which save to
keep. The non-chosen save is retained as a backup, never destroyed.

### Retry Policy
Network operations use exponential backoff with jitter. The first retry is
immediate; subsequent retries wait longer, capped at a maximum delay. Retries
continue until success or until the player cancels. A failed sync never blocks the
simulation or corrupts a save.

### Network Failure Recovery
- If upload fails, the local save is marked "sync pending." The Persistence Layer
  retries when connectivity returns.
- If download fails, the local save is used. The player is informed that the cloud
  save is unavailable.
- If a sync is interrupted mid-operation, neither save is corrupted. The operation
  is atomic from the save's perspective: either the cloud save is fully updated or
  it is unchanged.

### Synchronization Must Never Corrupt Saves
- A sync never writes a partial save. The cloud save is updated atomically — the
  new save replaces the old only after it is fully written and validated.
- A sync never overwrites a local save with an invalid cloud save. The cloud save
  is validated before it touches local state.
- A sync never deletes a save. The previous save is retained as backup until the
  new save is confirmed valid.

---

## 7. Save Triggers

A save can be triggered by several sources. Each trigger has a priority that
determines which wins when multiple triggers fire in the same tick.

### Trigger Types

| Trigger | Source | Description |
|--------|--------|-------------|
| **Manual Save** | Player action | The player explicitly requests a save. Highest priority. |
| **Autosave** | Timer / interval | The simulation saves automatically at a configured interval (e.g., every N ticks or every M minutes). |
| **Shutdown Save** | Application shutdown | The application is closing. A final save is taken before exit. |
| **Checkpoint Save** | Quest / milestone | The player reached a significant point (quest completed, region entered). The quest engine requests a checkpoint. |
| **Event Save** | Event Bus | A subscribed event indicates state worth persisting (e.g., `quest:completed`). The Save Engine listens and triggers a save. |
| **Save Check from Event Bus** | Tick cascade | After the Quest Engine completes its tick, the Event Bus's optional save check runs. This is the simulation's regular save opportunity. |

### Trigger Priority
When multiple triggers fire in the same tick, the highest-priority trigger wins and
a single save is taken. Saves are never duplicated within a tick.

1. **Manual Save** — always wins. If the player asked to save, the save happens.
2. **Shutdown Save** — if the application is shutting down, the save happens
   regardless of other triggers.
3. **Checkpoint Save** — a milestone save takes precedence over autosave.
4. **Event Save** — an event-driven save takes precedence over autosave.
5. **Autosave** — the lowest-priority trigger. If no other trigger fired this tick,
   the interval-based autosave runs.
6. **Save Check from Event Bus** — the regular per-tick opportunity. If a
   higher-priority trigger already saved this tick, the save check is skipped.

### Rules
- At most one save per tick. Multiple triggers coalesce into a single save.
- A save trigger never interrupts the simulation. The save is taken after the tick
  cascade completes, not mid-tick.
- The Save Engine owns trigger arbitration. No other engine decides when to save;
  engines only request saves through declared triggers.

---

## 8. Save Versioning

Every save carries three version numbers. Together they describe what the save is,
what it can migrate to, and what it is compatible with.

| Version | Purpose |
|---------|---------|
| **Format Version** | The version of the save envelope — the global header and the structure that wraps engine snapshots. When the envelope changes, the format version increments. |
| **Migration Version** | The version of the migration pipeline applied to this save. When a new migration is added, the migration version increments. A save's migration version tells the system which migrations have already been applied. |
| **Compatibility Version** | The minimum engine version that can load this save. When an engine's snapshot format changes in a way that older code cannot read, the compatibility version increments. If the running game's version is below the compatibility version, the save cannot be loaded without migration. |

### Rules
- **Older saves are migrated.** A save from an older version is transformed by the
  migration pipeline (Section 9) until it matches the current version. Only after
  migration succeeds is the save offered to the engines for load.
- **Never discarded automatically.** An older save is never deleted because it is
  old. If migration fails, the save is retained as-is and the player is informed.
  The player may choose to start a new game, but the old save is not destroyed.
- **Version numbers are monotonic.** They only increase. A save never travels
  backward in version. If a downgrade is needed, it is an explicit, documented
  operation — never automatic.

---

## 9. Migration System

The migration system transforms older saves into the current format before load.

### Migration Pipeline
Migrations are a sequence of ordered steps. Each step takes a save at version N
and produces a save at version N+1. On load, the Save Engine reads the save's
version, determines which migrations are needed, and runs them in order.

```
Save (v3) → Migration 3→4 → Save (v4) → Migration 4→5 → Save (v5) → Load
```

- Each migration is a pure function: it takes a save and returns a save. It does not
  touch engine state, the Persistence Layer, or the network.
- Migrations are registered at the composition root. The Save Engine does not
  hardcode them; it discovers them through a migration registry.
- A migration may transform the global header, any engine snapshot, or the structure
  of the save. It declares which engines' snapshots it touches.

### Validation
After the pipeline runs, the migrated save is validated (Section 10). If validation
fails, the migration is considered failed and the original save is retained
untouched. The player is informed.

### Rollback
- If a migration fails midway, the original save is restored. The player's data is
  never left in a half-migrated state.
- The previous valid save is always retained as backup before a migration begins.
  If migration fails, the backup is offered for load.
- A migrated save is not written back to the Persistence Layer until it has been
  validated. The original save remains the stored copy until the migrated save is
  confirmed good.

### Migration Log
Every migration is logged: the save version before, the save version after, which
  migrations ran, whether each succeeded, and any errors. The log is written to the
  Infrastructure Layer logger under the `[save]` category. The migration log is
  retained for diagnostics.

### Unsupported Version Handling
- If a save's version is higher than the running game supports (a save from a newer
  game version), the save cannot be loaded. The player is informed that the save is
  from a newer version. The save is retained; it is not deleted.
- If a save's version is lower than the oldest supported migration (too old to
  migrate), the save cannot be loaded. The player is informed and the save is
  retained as an archive.

---

## 10. Validation

Before a save is loaded, it is validated. An invalid save is never loaded.

### Validation Steps (in order)

1. **Checksum.** The save's checksum is recomputed and compared to the stored
   checksum. If they differ, the save is corrupt.
2. **Version.** The save's format, migration, and compatibility versions are
   checked against the running game's supported range. If the save is too new or too
   old to migrate, it is rejected.
3. **Integrity.** The save's structure is checked: the global header is present and
   well-formed, every expected engine snapshot is present, and no snapshot is
   malformed.
4. **Required Snapshots.** Every engine that the running game expects must have a
   snapshot in the save. If a snapshot is missing, the save is incomplete. If an
   extra snapshot is present (from a future engine), it is ignored and logged — it
   does not block load.
5. **Corruption Detection.** Beyond the checksum, each engine snapshot is offered
   to its engine for a lightweight `validate(snapshot)` check. The engine confirms
   the snapshot is structurally sound (e.g., required fields present, values in
   range). If an engine rejects its snapshot, the save is flagged as corrupt.

### Rules
- **Never load invalid saves.** If any validation step fails, the save is not
  loaded. The player is informed. The previous valid save is offered instead.
- **Validation is non-destructive.** Validation never writes to the save. A failed
  validation does not alter the save on disk.
- **Validation happens before migration.** The save is validated in its original
  form. If it passes, migration runs. The migrated save is validated again before
  load.

---

## 11. Error Handling

### Corrupted Save
A corrupted save (failed checksum or integrity check) is not loaded. The player is
informed that the save is corrupt. The previous valid save — retained by the backup
policy — is offered. The corrupt save is not deleted; it is retained for diagnosis.

### Missing Engine Snapshot
If a required engine snapshot is absent, the save is incomplete. The Save Engine
does not partially load — it does not restore some engines and skip others. The
save is rejected and the previous valid save is offered. If the missing snapshot is
from an engine added in a newer version, migration is attempted first.

### Unsupported Version
If the save is from a version too new to load or too old to migrate, the save is
rejected. The player is informed. The save is retained as an archive and not
deleted.

### Network Failure
If a cloud sync fails, the local save is used. The player is informed that cloud
sync is unavailable. Gameplay continues. Sync retries per the retry policy. A
network failure never blocks load or save.

### Disk Failure
If a local write fails (storage full, permission denied, IndexedDB unavailable),
the Save Engine logs the error and informs the player. The simulation continues —
the player can keep playing — but saves are not persisted until storage is
available. The player is warned that progress is at risk.

### Graceful Recovery
- Every failure path offers the player a clear, non-technical message and a next
  step: retry, load a different save, or continue without saving.
- No failure path destroys data. The previous valid save is always retained until a
  new save is confirmed.
- No failure path crashes the simulation. The game continues in a degraded state
  (no save, no sync) rather than terminating.

### Clear Logging
Every persistence error is logged under the `[save]` category with the operation
(save, load, migrate, sync), the error, and the context. Logs use the Infrastructure
Layer logger per Architecture Principles §9.

### Never Destroy the Previous Valid Save
This is the cardinal rule of persistence error handling. Before any save is
overwritten, the previous valid save is retained as a backup. If the new save fails
to write, fails validation, or is corrupt, the previous save is still available. A
player never loses their last known-good save to a failed operation.

---

## 12. Security

### Player Ownership
Every save is owned by a player. The `playerId` in the global header identifies the
owner. The Persistence Layer enforces ownership: a player can only store, load,
delete, and sync their own saves. A request to access another player's save is
rejected. In a Supabase backend, this is enforced through row-level security
policies scoped to the authenticated player.

### Encrypted Cloud Communication
All communication with the cloud backend uses TLS (HTTPS). Save data in transit is
encrypted by the transport layer. The Persistence Layer never sends a save over an
unencrypted connection.

### Sensitive Data Protection
- Player credentials are never stored in a save. The save contains a `playerId`
  reference, not an authentication token.
- The Save Engine does not serialize secrets, API keys, or session tokens. If an
  engine holds a secret, it is not included in the snapshot.
- Cloud saves are stored behind the player's authenticated session. A player must
  be authenticated to read or write their cloud saves.

### No Hardcoded Credentials
No credentials are hardcoded in source. The Persistence Layer receives
configuration (Supabase URL, keys) through the composition root from environment
configuration. Credentials are never committed to source control, never embedded in
the save, and never logged.

### Least Privilege
- The Persistence Layer operates with the minimum permissions required to store
  and retrieve the current player's saves. It does not have administrative access to
  the backend.
- In a Supabase backend, the client uses the anon key with row-level security
  policies. The service role key is never used in client-side code.
- A player can only read and write their own saves. Cross-player access is denied
  at the backend, not merely at the application layer.

---

## 13. Future Expansion

The Persistence Architecture is designed to support future scenarios without
redesign.

### Multiple Save Slots
A player may have more than one save. The Persistence Layer addresses saves by
`playerId` and `slotId`. The storage interface is already slot-aware; adding a slot
selector to the UI does not change the Save Engine or the Persistence Layer.

### Cloud Backup
The backup policy (Section 4, Section 11) already retains the previous valid save.
Cloud backup extends this: the cloud backend retains a configurable number of
recent saves per player, not just the latest. This is a backend configuration
change, not an architecture change.

### Cross-Device Sync
Cloud synchronization (Section 6) already reconciles local and cloud saves.
Cross-device play is the natural extension: a second device downloads the cloud
save, plays, and uploads. The conflict detection and resolution policies handle the
case where two devices have divergent saves.

### Dedicated Server
A dedicated server runs the same simulation through the same Save Engine and
Persistence Layer. The server's Persistence Layer may use a different backend
(filesystem, dedicated database) but implements the same storage interface. The
Save Engine is unaware of the difference.

### Multiplayer Persistence
In a multiplayer future, the Persistence Layer stores per-player saves and a shared
world state. The storage interface extends to address shared state by `worldId` in
addition to `playerId`. The Save Engine's per-engine snapshot contract does not
change — each engine still produces and consumes its own snapshot. The composition
of saves into a shared world is a Persistence Layer concern, not an engine concern.

### Modding
A mod's state is stored in the mod's own engine snapshot, if the mod implements an
engine. The mod registers its snapshot through the same `save()` / `load()` contract.
The Save Engine treats a mod identically to a core engine. No architecture change
is needed.

### Future Storage Providers
Any backend that implements the storage interface can replace or supplement the
current backend. The Save Engine, the engine snapshot contract, the migration
system, and the validation system are all backend-agnostic. A new provider is
wired at the composition root and the rest of the system is unaffected.

### What Does Not Change
- The save snapshot structure (global header + per-engine snapshots).
- The Save Engine's `save()` / `load()` contract with engines.
- The storage interface between Save Engine and Persistence Layer.
- The offline-first principle.
- The versioning and migration system.
- The validation and error-handling rules.
- The security and ownership model.

The Persistence Architecture is built once. Future expansion extends around it; it
does not redesign it.

---

## Closing Statement

Persistence Architecture is the permanent contract between the Save Engine and
the Storage Layer.

The Save Engine serializes state. The Persistence Layer stores it. The two are
separated by a storage interface that any backend can implement. The simulation is
offline-first: local saves are the source of truth, cloud sync is an extension, and
gameplay never stops for a network failure. Saves are versioned, migrated, validated,
and protected — an older save is never discarded, a previous valid save is never
destroyed, and an invalid save is never loaded.

Future storage technologies may replace the backend without affecting gameplay
engines. The Save Engine, the engine snapshot contract, and the migration and
validation systems are backend-agnostic. A new provider is wired at the composition
root; the rest of the system is unchanged.

Any change to this architecture — a new storage backend, a new sync mode, a new
versioning scheme — requires Lead Architect approval and an update to this document
before any implementation begins.
