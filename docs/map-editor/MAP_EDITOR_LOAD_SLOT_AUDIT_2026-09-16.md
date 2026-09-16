# Map Editor Load Slot Audit — 2026-09-16

Status: Phase 0 Foundation Audit

## Scope

Audit the Supabase `map_editor_load_save_slot_v1(uuid, smallint)` contract against `MAP_EDITOR_SAVE_LOAD_CONTRACT.md`.

## Verified database behavior

The RPC:

1. Resolves `auth.uid()` and returns `AUTH_REQUIRED` when absent.
2. Verifies that `p_map_id` belongs to the authenticated user.
3. Looks up the requested `map_id + slot_number`.
4. Returns `SLOT_EMPTY` when no slot exists.
5. Returns the slot's `map_id`, `slot_number`, `label`, `version_id`, `version_number`, `snapshot`, and `updated_at`.

## Contract comparison

| Requirement | Database RPC | Status |
|---|---|---|
| Authentication | `auth.uid()` required | PASS |
| Map ownership | checks `maps.created_by` | PASS |
| Slot existence | explicit `SLOT_EMPTY` | PASS |
| Returns snapshot | yes | PASS |
| Returns version identity | yes | PASS |
| Preserves map identity | returns slot `map_id` | PASS |
| Validates loaded snapshot before return | no | GAP |
| Verifies `version_id` still exists | no explicit check during load | GAP |
| Verifies `version_number` matches referenced version | no | GAP |
| Verifies slot snapshot equals referenced version snapshot | no | GAP |
| Verifies map type | no explicit check | GAP |
| Deserializes to `MapDocument` | database does not do this | APPLICATION RESPONSIBILITY |
| Atomic replacement of editor state | database does not control this | APPLICATION RESPONSIBILITY |

## Important finding

The Load Slot RPC is a retrieval endpoint, not a complete MapDocument load transaction. It returns the snapshot stored in `map_editor_save_slots` without re-validating the relationship between the slot's `snapshot` and its `version_id/version_number`.

This means the current database contract permits a slot row whose version reference and embedded snapshot are inconsistent, provided the referenced version itself exists and belongs to the same map/user.

## Frontend boundary still requiring audit

The repository audit must verify the code path after RPC return:

```text
load_save_slot RPC
  ↓
response.ok
  ↓
response.snapshot
  ↓
JSON/schema validation
  ↓
deserialize MapDocument
  ↓
map identity/type validation
  ↓
replace editor document
  ↓
reset history at explicit load boundary
  ↓
render
```

A failed validation/deserialization must leave the current editor document unchanged.

## Relationship to Save Slot findings

Save Slot and Load Slot share the same integrity gap: the slot stores both a `version_id/version_number` reference and a separate `snapshot`, but the RPCs do not prove those two representations are identical.

## Current conclusion

No database fix is made during Phase 0. The next implementation-independent audit target is the frontend Load Slot consumer and the exact deserializer/state-replacement path.

## Evidence source

Direct inspection of the Supabase functions:

- `public.map_editor_load_save_slot_v1(uuid, smallint)`
- `public.map_editor_save_slot_v1(uuid, smallint, text, uuid, integer, jsonb)`

Date: 2026-09-16
