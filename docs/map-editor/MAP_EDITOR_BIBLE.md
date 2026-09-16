# Vandrith Map Editor Bible

**Document status:** Design baseline / living specification  
**Scope:** Map Editor for World of Vendrith  
**Authority:** This document defines the product intent and non-negotiable behavior. Technical implementation must conform to it; when implementation differs, document the deviation before changing architecture.

## 1. Purpose

The Map Editor is the authoring tool used to create, inspect, modify, version, save, load, and validate maps used by Vandrith. It must let a designer work visually while preserving a deterministic, versioned map document that can be projected into gameplay-oriented database structures.

## 2. Core principles

1. **The map document is the source of truth for editor state.**
2. **The canvas must remain stable while editing.** A save/load fix must never introduce render flicker or reset active editing state.
3. **Save and Load are explicit persistence operations.** A successful button click must produce a deterministic success or an actionable error.
4. **Versioning is authoritative.** A map save creates or updates an authoritative version through the persistence layer rather than silently mutating unrelated tables.
5. **Save slots are snapshots.** A slot represents a recoverable map state, not an independent map.
6. **Gameplay projections are derived data.** `map_cells`, navigation projections, geometry projections, and runtime snapshots may be rebuilt from an authoritative snapshot.
7. **Ownership is enforced server-side.** Client state must never be treated as proof of map ownership.
8. **Editor UX and persistence are separate concerns.** Canvas rendering/history must not depend on a successful network request.
9. **No silent data loss.** Load, merge, version conflict, or validation failure must not overwrite the current local document without an explicit successful result.
10. **Documentation precedes architectural churn.** Do not change database architecture, editor state architecture, or persistence contracts merely to patch a symptom.

## 3. User-facing capabilities

### 3.1 Map authoring

- Select, Paint, Erase, Line, Rectangle, Flood, Stamp, Building, and Collision tools.
- Layer management for Ground, Objects, and Collision.
- Tile palette including Grass, Sand, Dirt, Pavement, and Water.
- Brush sizes including 1, 2, 3, and 5.
- Building/object placement, selection, movement, deletion, copy/paste, and stamps.
- Undo/Redo.
- Terrain inspection and environment diagnostics.

### 3.2 Persistence

The editor must support:

- **Quick Save:** persist the current authoritative map state.
- **Save Slot:** write the current state to a numbered slot.
- **Load Latest:** restore the latest authoritative snapshot.
- **Load Slot:** restore a selected slot snapshot.
- **Version-aware save:** detect stale remote versions before destructive overwrite.
- **Recoverable errors:** show whether failure occurred in authentication, map resolution, version conflict, validation, RPC, or transport.

## 4. Map identity

A Map Editor session must operate on one explicit `map_id`. The editor must never confuse:

- World Map identity,
- Region/location identity,
- Map document identity,
- Version identity,
- Save-slot identity.

A map can belong to a world and optionally reference location, settlement, or building context. Those relationships are metadata; they do not replace `map_id` as the persistence identity.

## 5. Editor document

The canonical editor document is the `MapDocument` object. It contains map identity, dimensions, tile size, layers, and editor entities required to reconstruct the visual map.

The repository currently serializes it with schema `vandrith.map-document`, payload version `1`, and a nested `document` object. The serializer validates identity, positive dimensions/tile size, and the presence of layers.

## 6. Layers

The initial editor model contains three logical layers:

- **Ground:** terrain/tile state.
- **Objects:** buildings and placed world objects.
- **Collision:** collision/walkability authoring data.

Layer visibility, locking, active state, and ordering are editor concerns. They must be preserved through serialization when relevant to the document contract.

## 7. Terrain and environment

Terrain is more than a visual tile. The editor supports terrain bindings, topology/mask inspection, junction information, and environment readiness diagnostics. Seasonal/weather systems must consume stable terrain identity and asset bindings rather than hard-coded canvas rendering assumptions.

The current environment diagnostics include season definitions, weather definitions, season rules, season-cycle rules, season-weather rules, weather transition policies, and terrain seasonal bindings.

## 8. Save/Load behavior contract

### Save

1. Resolve authenticated user.
2. Resolve or create the intended map identity.
3. Read the current authoritative version.
4. Validate the local document.
5. Detect stale version/conflict where applicable.
6. Commit the authoritative snapshot/version.
7. Update or create the requested save slot when the action is a slot save.
8. Reconcile derived gameplay projections if the persistence contract requires it.
9. Report success only after the server operation succeeds.

### Load

1. Resolve the requested map and authenticated owner.
2. Fetch the requested authoritative snapshot or slot snapshot.
3. Validate/parse the snapshot.
4. Replace editor history with the loaded document as a new editor state boundary.
5. Do not continuously compare object references in a way that resets history during normal painting.
6. Render the loaded document without flicker.

## 9. Save slots

The current database model supports slots `1..12`. A slot stores:

- slot identity,
- map identity,
- optional version identity,
- version number,
- serialized snapshot,
- owner identity,
- timestamps.

A slot is not a separate map. Loading a slot restores its snapshot into the editor.

## 10. Failure behavior

The UI must distinguish at least these states:

- `disconnected`
- `auth_required`
- `map_unresolved`
- `ready`
- `saving`
- `loading`
- `conflict`
- `validation_error`
- `server_error`
- `success`

No failure state may mutate the canvas merely to communicate an error.

## 11. Non-goals

The Map Editor is not responsible for:

- being the runtime game engine;
- replacing the world simulation system;
- directly editing arbitrary database rows from the browser;
- treating derived projections as the canonical editor document;
- silently resolving version conflicts by discarding another version.

## 12. Current known issue baseline

As of the September 16, 2026 debugging session:

- The editor canvas previously exhibited flicker after an attempted Load-state fix because history was reset whenever `initialDocument !== document`.
- The UI also reported `save error` after the save/load-v4 experiment.
- Therefore the next implementation work must first restore stable canvas behavior, then isolate the actual persistence/RPC error, without changing the core editor architecture again.

## 13. Definition of done

The Map Editor persistence system is considered complete only when all of the following are demonstrated:

- painting does not flicker;
- undo/redo remains local and deterministic;
- Quick Save succeeds and creates an authoritative version;
- Save Slot 1 succeeds;
- the slot is visible in the database;
- modifying the map after saving does not modify the stored slot;
- Load Slot 1 restores the exact saved document;
- Load Latest restores the latest authoritative snapshot;
- stale-version behavior is deterministic;
- authentication/ownership failures are safe;
- derived projections can be rebuilt from the authoritative snapshot;
- a refresh does not destroy persisted data.

## 14. Change rule

Before changing persistence schema or editor state architecture, update this Bible and the technical specification with the reason, invariant affected, migration plan, and rollback plan.
