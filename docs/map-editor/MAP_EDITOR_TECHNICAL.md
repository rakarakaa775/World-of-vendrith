# Vandrith Map Editor — Technical Architecture

**Document status:** Technical baseline / living specification  
**Scope:** Frontend, persistence, Supabase, versioning, projection, and testing.

## 1. Architecture rule

The editor is a client-side authoring application backed by Supabase persistence. Rendering/history must be decoupled from network persistence.

```text
UI tools
   ↓
EditorShell
   ↓
MapDocument + MapHistory
   ↓
Persistence controller
   ↓
Supabase RPC / authoritative tables
   ↓
Derived projections
```

## 2. Frontend state

### Canonical local state

`MapHistory` owns the current `MapDocument` and undo/redo stacks.

The canvas receives the current document as props. Painting creates a new document and commits it to history.

### Critical invariant

A network refresh must not cause `MapHistory` to reset during ordinary editing.

Do **not** use a comparison such as `initialDocument !== document` as a continuous synchronization mechanism. The parent/editor boundary must explicitly distinguish:

- ordinary local edits;
- a newly loaded document;
- a newly selected map;
- an external authoritative refresh.

Only the latter events may replace the history root.

## 3. Serialization

Current serializer contract:

- schema: `vandrith.map-document`
- envelope version: `1`
- document version: `1`
- JSON serialization

The parser must reject unsupported schema/version, incomplete identity, invalid dimensions, invalid tile size, and missing layers.

Serialization is the compatibility boundary between editor memory and persisted snapshots.

## 4. Persistence layers

There are three conceptual persistence layers.

### A. Authoritative history

`maps` identifies the map.  
`map_versions` stores immutable authoritative snapshots.

### B. Editor recovery slots

`map_editor_save_slots` stores numbered snapshots tied to a map. Current design: slots 1–12.

### C. Gameplay projections

`map_cells`, `map_objects`, `map_object_geometry`, navigation data, and runtime snapshots are derived representations.

## 5. RPC boundary

Browser code must call controlled RPCs for operations requiring ownership, atomicity, or version validation.

Known Map Editor persistence contracts include:

- `map_editor_commit_merge_v1`
- `map_editor_save_slot_v1`
- `map_editor_load_save_slot_v1`
- `map_editor_reconcile_after_merge_v1`
- `map_editor_upsert_runtime_snapshot_v1`
- navigation/geometry reconciliation functions used by the projection layer.

The client must treat RPC responses as structured results and expose server errors rather than hiding them behind a generic save failure.

## 6. Save algorithm

```text
Save(document)
  1. assert authenticated session
  2. resolve document.id → map.id
  3. load current authoritative version
  4. validate document
  5. compare expected version with remote version
  6. if stale → return conflict
  7. commit new authoritative snapshot/version through RPC
  8. reconcile derived projections
  9. return committed version
```

A slot save adds:

```text
10. validate slot number 1..12
11. write snapshot/version reference to slot through save-slot RPC
12. return slot confirmation
```

## 7. Load algorithm

### Load Latest

```text
resolve map
  → fetch latest authoritative snapshot
  → parse/validate MapDocument
  → replace editor document at an explicit load boundary
  → reset undo/redo boundary intentionally
  → render
```

### Load Slot

```text
resolve map + slot
  → RPC load slot
  → receive snapshot
  → parse/validate
  → replace editor document
  → intentionally reset history boundary
  → render
```

The loaded snapshot must not be merged into the current document by reference mutation.

## 8. Conflict handling

The repository contains a three-way merge controller that compares:

- `base`: document known when editing began;
- `local`: current editor document;
- `remote`: current authoritative document.

If the remote version changed or merge conflicts exist, the result must be `conflict`, not an automatic destructive overwrite.

Conflict handling must never silently choose a winner.

## 9. Derived projection

After an authoritative merge/save, reconciliation may:

1. project ground cells into `map_cells`;
2. remove stale geometry rows;
3. synchronize object geometry;
4. rebuild navigation projection;
5. update runtime snapshot.

The current reconciliation function explicitly describes `map_cells` as a projection of the authoritative MapDocument ground layer and treats the full-fidelity snapshot/version as authoritative.

## 10. Database ownership and security

Every persistence RPC must validate `auth.uid()` and map ownership server-side.

The client may cache `map_id`, version number, and slot metadata, but those values are not authorization credentials.

A missing session must produce an authentication state, not a fake map or silent local-only save success.

## 11. Error taxonomy

Use structured errors where possible:

```text
AUTH_REQUIRED
MAP_NOT_FOUND
MAP_NOT_OWNED
VERSION_REQUIRED
VERSION_CONFLICT
INVALID_SNAPSHOT
INVALID_SLOT
RPC_FAILURE
NETWORK_FAILURE
VALIDATION_FAILURE
LOAD_FAILURE
```

The UI may present friendly messages, but diagnostics should preserve the underlying error code/message.

## 12. Canvas stability requirements

The Pixi canvas must obey these rules:

- editing does not recreate the entire editor state on every pointer event;
- document updates are incremental at the React state level;
- normal painting does not trigger a history reset;
- persistence status does not control rendering;
- loading explicitly replaces the document once;
- terrain/environment diagnostics must not mutate the map document merely by being displayed.

## 13. Save-state machine

```text
          ┌─────────────┐
          │   DISCONNECTED│
          └──────┬──────┘
                 │ auth/map resolved
                 ▼
          ┌─────────────┐
          │    READY    │
          └──────┬──────┘
                 │ save
                 ▼
          ┌─────────────┐
          │   SAVING    │
          └──┬──────┬───┘
             │      │
          success  error
             │      │
             ▼      ▼
           READY  ERROR
             │
             └──────────────

Conflict is a separate terminal result for the attempted save and requires an explicit resolution flow.
```

## 14. Load-state machine

```text
READY → LOADING → SUCCESS → READY
             └──→ ERROR  → READY
```

While loading, the current document must remain intact until a valid snapshot has been received and parsed.

## 15. Testing matrix

### Editor state

- paint one cell;
- paint multiple cells;
- undo;
- redo;
- change layer;
- hide/lock layer;
- place/move/delete object;
- create/apply stamp;
- copy/paste;
- verify no flicker.

### Persistence

- first save;
- repeated save;
- save after edit;
- save slot 1;
- save slots 1–12;
- reject slot 0/13;
- load latest;
- load slot;
- load empty slot;
- refresh then load;
- authentication failure;
- map ownership failure;
- stale version conflict;
- malformed snapshot.

### Projection

- ground projection;
- object projection;
- geometry synchronization;
- orphan geometry cleanup;
- navigation rebuild;
- runtime snapshot update.

## 16. Debug protocol for future bugs

When Save/Load fails, do not immediately change architecture.

Collect in this order:

1. current commit SHA;
2. deployment commit SHA;
3. browser status text;
4. authenticated session state;
5. resolved `map_id`;
6. current authoritative version;
7. exact RPC/function invoked;
8. RPC error code/message;
9. database row count for relevant map/slot;
10. snapshot parse/validation result.

Only after these are known should code be changed.

## 17. Current implementation note

The repository currently contains the editor shell, Pixi canvas, MapDocument serializer, conflict-save controller, Supabase persistence functions, and projection functions. The September 16, 2026 debugging session exposed two independent classes of problems: a frontend history-reset regression that caused canvas flicker, and an unresolved persistence `save error`. These must be debugged independently.

## 18. Change management

Any change to:

- `MapDocument` schema;
- layer semantics;
- version semantics;
- save-slot semantics;
- RPC contracts;
- map ownership;
- projection authority;
- canvas/history synchronization

must update this document and include a migration/backward-compatibility note.

## 19. Technical definition of done

A release is persistence-safe only when:

- the same MapDocument can round-trip through serialize → save → load → parse;
- slot snapshots are byte/structure equivalent to the saved state except for documented envelope metadata;
- normal editing never triggers a history reset;
- save success is confirmed by the server;
- load does not occur from stale client-only state;
- conflicts are surfaced explicitly;
- derived tables can be regenerated from authoritative snapshots;
- failures are diagnosable from logs/status without guessing.
