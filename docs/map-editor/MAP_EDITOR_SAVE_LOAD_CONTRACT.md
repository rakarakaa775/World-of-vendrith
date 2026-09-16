# Map Editor Save / Load Contract

Status: Phase 0 Foundation Audit
Version: 1.0 draft

## Purpose

Define the authoritative contract for Save, Quick Save, Save Slot, Load Latest, and Load Slot before implementation changes are made.

## Core principle

The editor's `MapDocument` is the authoring state. Persistence stores validated snapshots/versions of that document. A save operation must not require derived runtime projections to succeed before the authoritative document version is committed.

## Identity contract

Every persistence operation must resolve and validate:

```text
authenticated user
    ↓
world identity
    ↓
map identity
    ↓
map_type
    ↓
authoritative version
```

`map_id` must identify the same map that the editor is currently authoring. A missing or mismatched map identity is a precondition failure and must be reported explicitly.

## Map types

The contract applies to all three Map Editor scales:

- `world` — World Map
- `region` — Kingdom/Region Map
- `playable` — Playable Map

A persistence operation must preserve `map_type` and must not silently convert between scales.

## MapDocument contract

Before persistence, the editor must have a valid `MapDocument` containing its identity, dimensions, layers, and required schema/version metadata.

Serialization must be deterministic and must produce the snapshot representation accepted by the database contract.

Invalid documents must fail before a database write.

## Quick Save contract

Quick Save means:

```text
Editor MapDocument
 → validate identity
 → validate document
 → serialize snapshot
 → create authoritative map version
 → update current version
 → optionally reconcile derived projections
```

The authoritative version commit is the persistence boundary. Derived projections are secondary and must not make an otherwise valid document impossible to save unless a future explicit contract says the projection is part of the authoritative transaction.

## Save Slot contract

Save Slot means storing a named/numbered snapshot reference for a map.

```text
Editor MapDocument
 → validate identity
 → obtain authoritative snapshot/version
 → write slot 1..12
```

A slot must belong to the authenticated owner and the requested map. Slot number must remain within the database-defined range.

Save Slot must not depend on unrelated runtime rendering state.

## Load Latest contract

```text
map identity
 → resolve current authoritative version
 → retrieve snapshot
 → validate schema
 → deserialize MapDocument
 → replace editor document/history atomically
```

Loading must not mutate the existing editor state until the incoming snapshot has passed validation and deserialization.

## Load Slot contract

```text
map identity + slot number
 → validate ownership
 → retrieve slot snapshot/version
 → validate schema
 → deserialize MapDocument
 → replace editor document/history atomically
```

The loaded document must preserve its map identity and map type.

## Editor-state rule

A successful Load is a document replacement event, not a normal paint/edit event.

Therefore history must be replaced/reset atomically for the loaded document. It must not reset merely because an ordinary paint operation creates a new object reference.

## Error boundary

Errors must identify the stage that failed:

- `IDENTITY_ERROR`
- `DOCUMENT_VALIDATION_ERROR`
- `SERIALIZATION_ERROR`
- `PERSISTENCE_ERROR`
- `SLOT_ERROR`
- `LOAD_ERROR`
- `DESERIALIZATION_ERROR`
- `PROJECTION_ERROR`

The UI must not collapse all failures into a generic `save error`.

## Failure and atomicity

A failed Save must not claim success.

A failed Load must leave the currently loaded editor document unchanged.

A successful authoritative save followed by a derived projection failure must report the authoritative save as successful while separately reporting the projection failure, unless the database transaction explicitly guarantees atomicity across both.

## Concurrency

If the database reports a version conflict, the editor must not silently overwrite the newer version. The conflict must be surfaced and handled through the documented conflict workflow.

## Runtime projections

`map_cells`, `map_objects`, navigation/geometry, and other derived representations are projections. They must be treated separately from the authoritative `MapDocument` snapshot unless the Database Contract explicitly defines them as part of the same transaction.

## Verification requirements

Before Phase 4 is considered complete, the following scenarios must be tested:

1. Save a new document.
2. Save after editing an existing document.
3. Save Slot 1.
4. Save multiple slots.
5. Load Latest.
6. Load Slot 1.
7. Load a different slot.
8. Attempt an invalid slot number.
9. Trigger a version conflict.
10. Fail serialization before write.
11. Fail persistence after validation.
12. Fail a derived projection after authoritative save.
13. Verify a failed Load does not alter the current editor state.
14. Verify all three map types preserve identity through save/load.

## Current Phase 0 findings

The existing implementation must be audited against this contract before changing Save/Load code. In particular, verify the exact relationship between `persistedMapId`, authenticated identity, `MapDocument`, authoritative version, Save Slot RPC, and derived reconciliation.

## Change control

Any change to this contract requires updates to:

- `MAP_EDITOR_BIBLE.md`
- `MAP_EDITOR_DATABASE_CONTRACT.md` when database behavior changes
- `MAP_EDITOR_CHANGELOG.md`
- `MAP_EDITOR_STATUS_LOG.md`

No implementation may bypass this contract without documenting and approving the deviation in the same work session.
