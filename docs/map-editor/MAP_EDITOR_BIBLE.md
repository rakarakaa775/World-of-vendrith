# Vandrith Map Editor Bible

**Document status:** Design baseline / living specification  
**Scope:** Map Editor for World of Vendrith  
**Authority:** This document defines the product intent and non-negotiable behavior. Technical implementation must conform to it; when implementation differs, document the deviation before changing architecture.

## 1. Purpose

The Map Editor is the authoring tool used to create, inspect, modify, version, save, load, and validate maps used by Vandrith. It must let a designer work visually while preserving a deterministic, versioned map document that can be projected into gameplay-oriented database structures.

The editor is intentionally designed for three map scales:

1. **World Map** — macro world geography and high-level relationships.
2. **Kingdom/Region Map** — regional geography, territory, settlements, routes, and regional points of interest.
3. **Playable Map** — detailed gameplay spaces directly traversed by the player.

These are three authoring scales within one Map Editor architecture, not three unrelated persistence systems.

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
11. **Every implementation update is traceable.** Repository/database changes must be recorded in both the detailed Change Log and the short Status Log.
12. **Roadmap order is mandatory.** Implementation must follow the active Master Roadmap phase and its Phase Goal; later-phase work may not bypass an unresolved earlier-phase gate.
13. **Asset storage is separate from asset usage.** Storing an asset does not make it active or approved for runtime/editor use.

## 3. User-facing capabilities

### 3.1 Map authoring

- Select, Paint, Erase, Line, Rectangle, Flood, Stamp, Building, and Collision tools.
- Layer management for Ground, Objects, and Collision.
- Tile palette including Grass, Sand, Dirt, Pavement, and Water.
- Brush sizes including 1, 2, 3, and 5.
- Building/object placement, selection, movement, deletion, copy/paste, and stamps.
- Undo/Redo.
- Terrain inspection and environment diagnostics.

### 3.2 Three map scales

**World Map** must support macro geography, major land/water features, kingdom/region anchors, major routes/connections, labels/metadata, and world coordinate context.

**Kingdom/Region Map** must support regional terrain, boundaries, settlements, roads/rivers/routes, regional POIs, resource/activity anchors, and explicit links to playable locations.

**Playable Map** must support fine terrain, objects/buildings, collision/walkability, navigation, geometry/footprints, gameplay anchors, and local environment context.

All three scales use the same MapDocument, identity, version, save-slot, ownership, and serialization foundations. Scale-specific tools and validation are capability profiles rather than separate editors.

### 3.3 Persistence

The editor must support:

- **Quick Save:** persist the current authoritative map state.
- **Save Slot:** write the current state to a numbered slot.
- **Load Latest:** restore the latest authoritative snapshot.
- **Load Slot:** restore a selected slot snapshot.
- **Version-aware save:** detect stale remote versions before destructive overwrite.
- **Recoverable errors:** show whether failure occurred in authentication, map resolution, version conflict, validation, RPC, or transport.

## 4. Map identity

A Map Editor session must operate on one explicit `map_id` and one explicit `map_type`.

The editor must never confuse:

- World Map identity,
- Kingdom/Region Map identity,
- Playable Map identity,
- Region/location identity,
- Map document identity,
- Version identity,
- Save-slot identity.

World → Region and Region → Playable relationships are explicit metadata/references. They must not be inferred from screen position or dimensions.

## 5. Editor document

The canonical editor document is the `MapDocument` object. It contains map identity, map type, dimensions, tile size, layers, and editor entities required to reconstruct the visual map.

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

## 12. Asset library rule

Assets are stored in a dedicated repository library under `assets/`, divided by system such as `map-editor`, `life-build`, `inventory`, `characters`, `environment`, `weapons`, `objects`, `ui`, `effects`, `vehicles`, `animations`, `animals`, and `shared`.

The asset library is a **staging/storage boundary**. Assets are not automatically imported, bundled, or referenced because they exist there.

Every asset intended for use must retain provenance, license/credit information, approval state, and intended consumer/scale. Map Editor assets must distinguish World Map, Region Map, and Playable Map use where relevant.

Original source packages must be preserved separately from normalized/staged assets. Unverified or missing-credit material must not be silently promoted to approved status.

## 13. Current known issue baseline

As of the September 16, 2026 debugging session:

- The editor canvas previously exhibited flicker after an attempted Load-state fix because history was reset whenever `initialDocument !== document`.
- The UI also reported `save error` after the save/load-v4 experiment.
- Therefore the next implementation work must first restore stable canvas behavior, then isolate the actual persistence/RPC error, without changing the core editor architecture again.

## 14. Definition of done

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
- a refresh does not destroy persisted data;
- World, Region, and Playable map identities and relationships remain deterministic;
- asset storage cannot accidentally activate unapproved assets.

## 15. Documentation and change-control rule

Every project update that changes repository code, database schema/data contract, RPC behavior, assets, asset storage, configuration, or documented architecture **must update these two records in the same work session**:

1. `docs/map-editor/MAP_EDITOR_CHANGELOG.md` — detailed record of what was added, changed, removed, restored, reverted, or fixed.
2. `docs/map-editor/MAP_EDITOR_STATUS_LOG.md` — short record of the update date/time, status, and affected changes.

The detailed Change Log is append-only. The Status Log remains concise. Documentation-only updates are also recorded so the project history remains traceable.

If an implementation change is reverted, both logs must record the reversion. If a database or architecture change is planned but not yet applied, record it as planned rather than describing it as completed.

## 16. Roadmap governance

The Master Roadmap and Phase Goals are mandatory construction controls.

- Work must follow the active phase.
- A later phase may not be implemented merely because it appears convenient or because a later-phase bug is visible.
- A phase cannot be marked complete from code existence alone; it requires its defined evidence/gate.
- If audit evidence shows that the roadmap is wrong, implementation pauses. The roadmap and Phase Goals are revised first, then both logs are updated.
- After a roadmap reset, previous checkmarks are historical context only and do not constitute current completion evidence.

## 17. Change rule

Before changing persistence schema or editor state architecture, update this Bible and the technical specification with the reason, invariant affected, migration plan, and rollback plan. After the change, update the Change Log and Status Log in the same work session.

Before introducing or promoting an asset, verify its provenance/license and approval state and record the asset-library change in the Change Log and Status Log.
