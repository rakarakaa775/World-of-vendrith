# Vandrith Map Editor Database Contract

**Document status:** Design baseline / living contract  
**Scope:** Persistence and database boundary of the Map Editor  
**Authority:** This document defines how the canonical MapDocument relates to Supabase persistence and derived gameplay data.

## 1. Core rule

`MapDocument` is the canonical editor representation. Database tables are persistence and projection boundaries. The browser must not treat derived rows as the canonical document.

## 2. Identity model

```text
World
  └─ Map (map_id)
       ├─ Authoritative Version (map_versions)
       ├─ Save Slots (map_editor_save_slots)
       ├─ Ground/terrain projection (map_cells)
       ├─ Object projection (map_objects)
       └─ Geometry projection (map_object_geometry)
```

The following identities must never be conflated:

- `world_id`: world/container identity.
- `map_id`: authoritative map identity for editor persistence.
- `map_versions.id`: one immutable version identity.
- `map_editor_save_slots.id`: one slot record identity.
- object/cell IDs: projection row identities.

## 3. `maps`

Purpose: stable map identity and map-level metadata.

Important fields currently present:

- `id`
- `world_id`
- optional `location_id`, `settlement_id`, `building_id`
- `name`
- `map_type`
- `coordinate_mode`
- optional `width`, `height`, `tile_size`
- `metadata`
- optional `coordinate_profile_id`
- `created_by`, timestamps

Contract:

- Every editor session must resolve an explicit `map_id`.
- `maps` identifies the map; it does not replace the MapDocument snapshot.
- Browser code must not use a client-supplied map ID as proof of ownership.

## 4. `map_versions`

Purpose: authoritative version history.

Current fields:

- `id`
- `map_id`
- `version_number`
- optional `label`
- `snapshot` JSONB
- optional `created_by`
- `created_at`

Contract:

- A successful authoritative save creates a deterministic version according to the RPC/persistence contract.
- `snapshot` must contain a valid serialized MapDocument.
- Version numbers are scoped to a map.
- Stale-version checks must happen server-side where the operation is conditional.
- A version is not a save slot.

## 5. `map_editor_save_slots`

Purpose: named recoverable snapshots for editor users.

Current fields:

- `id`
- `map_id`
- `slot_number`
- `label`
- optional `version_id`
- `version_number`
- `snapshot` JSONB
- `created_by`
- timestamps

Current slot range: **1–12**.

Contract:

- A slot belongs to exactly one map and owner context.
- A slot stores a snapshot; it is not a separate map.
- Saving a slot must replace/update only that slot's snapshot according to the persistence RPC.
- Loading a slot must read the stored snapshot and validate it before replacing editor state.
- Ownership and slot-range validation are server-side responsibilities.

## 6. `map_cells`

Purpose: terrain/cell projection used by gameplay-oriented systems.

Current fields include:

- `id`, `map_id`, `grid_x`, `grid_y`
- `elevation`, `biome`
- terrain/structural/decoration asset IDs
- terrain and season variants
- `collision`, `walkable`
- `metadata`
- timestamps

Contract:

- Cell rows are derived/projection data unless explicitly designated otherwise by a future version of this contract.
- They must be reconstructible from authoritative map state.
- Projection failures must not silently replace the editor's local document.

## 7. `map_objects`

Purpose: placed world objects/buildings projection.

Current fields include identity, map/layer/asset references, entity references, position, rotation, scale, z-index, collision/interactable flags, footprint, properties, object type, dimensions, LOS blocking, and timestamps.

Contract:

- Object rows represent the serialized object state in gameplay-facing form.
- Object identity must remain stable when the contract requires stable references.
- Projection must preserve transform and gameplay-relevant properties.

## 8. `map_object_geometry`

Purpose: normalized geometry/collision/spatial projection for map objects.

Current fields include object ID, geometry type, center, half-width/height, rotation, and update timestamp.

Contract:

- Geometry is derived from object state unless explicitly promoted by a future design revision.
- Geometry rebuild must be deterministic.

## 9. RPC boundary

Persistence operations should use server-side RPCs rather than arbitrary browser writes when an operation requires ownership, versioning, atomicity, or multi-table consistency.

Known Map Editor persistence RPC families include:

- authoritative version commit;
- save-slot write;
- save-slot load.

The exact RPC signatures are part of the implementation contract and must be documented in the Technical specification when changed.

## 10. Save transaction

```text
UI intent
  → validate MapDocument
  → resolve auth
  → resolve map_id
  → read/check authoritative version
  → server-side commit
  → optional save-slot write
  → optional projection/rebuild
  → success response
```

No UI success state may be shown before the relevant server operation succeeds.

## 11. Load transaction

```text
UI intent
  → resolve auth/ownership
  → fetch version or slot snapshot
  → validate/deserialize MapDocument
  → establish editor state boundary
  → render loaded document
```

If validation or persistence fails, the current editor document remains intact.

## 12. RLS and ownership

Ownership must be enforced by Supabase policies/RPC authorization. Client state, URL parameters, slot numbers, or hidden UI fields are not authorization mechanisms.

## 13. Schema evolution

Any schema change must document:

1. reason;
2. affected invariant;
3. migration;
4. serializer compatibility;
5. projection impact;
6. rollback strategy;
7. required tests.

## 14. Compatibility rule

The serialized MapDocument schema is a compatibility boundary. Database migrations must not silently change its meaning. If the payload schema changes, the serializer version and migration path must be updated together.

## 15. Verification checklist

Before declaring persistence fixed:

- map identity resolves consistently;
- authenticated owner is valid;
- authoritative version can be read;
- Quick Save creates a version;
- Save Slot 1 writes a row;
- saved snapshot is independent from later editor edits;
- Load Slot 1 returns the exact stored snapshot;
- Load Latest returns the intended authoritative snapshot;
- invalid/stale requests fail without data loss;
- projections remain rebuildable;
- refresh preserves persisted state.
