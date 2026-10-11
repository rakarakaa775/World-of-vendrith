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


## Frontend follow-up — 2026-10-10

The active V4 consumer now performs these checks before replacing editor state:

- Parses current Game Save v1 and legacy Map Document v1 envelopes, enforcing authoritative World ID/type and exterior map type.
- Requires the slot's `version_id` and queries the referenced `map_versions` row for the authoritative World map.
- Verifies referenced version ID/number and compares the slot's embedded World document with the canonical version document.
- Performs slot-list refresh before changing editor map state, so a refresh failure does not occur after the map replacement.
- Reconciles loaded World/Exterior maps so stale World/Exterior documents do not survive a legacy World-only load.

The document comparison sorts object keys recursively, avoiding false mismatches caused only by JSON key ordering. Regression tests cover missing/inconsistent version references, mismatched snapshot contents, key-order differences, legacy load reconciliation, and unrelated World identity. CI run `38061931743` passed TypeScript, Next.js build, and Vitest for the canonical version check; later key-order changes are tracked by the newest workflow run on the branch.

### Remaining gaps

- Database RPC still does not enforce the snapshot/version relationship itself. Frontend checks reduce risk but cannot replace server-side integrity validation.
- `saveToSlot` currently commits World/Exterior versions before calling the Save Slot RPC. If the slot RPC fails, those canonical versions may already have changed. True all-or-nothing save requires a reviewed, tested server-side transaction; do not apply a production migration without isolated DB tests and explicit approval.
- No real browser/session round-trip or live slot mutation was performed during this source/CI work.

## Save transaction follow-up — 2026-10-11

The migration source for `map_editor_save_slot_v1` was located in the repository history and inspected. The function itself performs one owner-scoped upsert into `map_editor_save_slots`; PostgreSQL makes that single function call transactional. However, it does **not** create or update World/Exterior `map_versions` rows. The active frontend calls map-version persistence first and calls this slot RPC only afterward.

### Confirmed boundary

```text
frontend saveToSlot
  → optionally commit World version
  → optionally commit Exterior version
  → resolve canonical World version ID
  → map_editor_save_slot_v1 (single slot-row transaction)
```

Therefore the slot-row upsert is atomic by itself, but the complete World + Exterior + slot workflow is not one transaction. If a later step fails, earlier map-version commits are not rolled back. The latest frontend change avoids creating an unnecessary Exterior version when its normalized serialized snapshot is unchanged; it does not close the general partial-commit gap.

### Safe next implementation boundary

- Do not edit or apply a production migration as part of this source audit.
- Design a new versioned server-side Save Slot transaction contract that accepts validated World/Exterior snapshots plus expected version numbers and the requested slot metadata.
- The server operation must validate ownership, identities, map types, snapshot shape, and expected versions before writes; lock/check the relevant map/version state to prevent races; and commit changed versions plus the slot row in one PostgreSQL transaction.
- If projections are updated by the existing version-commit RPC, inspect whether they can be separated from the authoritative transaction. Projection failure must not be reported as a total rollback unless the transaction really rolls back every write.
- Add isolated SQL tests for stale versions, invalid identity, slot upsert failure, World/Exterior validation failure, concurrent save attempts, and rollback after an injected failure. Only then prepare a migration for explicit review; do not deploy it automatically.
- Keep the current RPC as the compatibility path until the new transaction is implemented, tested, and deliberately activated.

### Verification status

The existing frontend flow and historical SQL migration source were inspected through GitHub. No live database was changed, no browser/session mutation was performed, and no new tests were executed for this follow-up. The prior CI success cited above applies only to the run and commit named there, not to later commits.


## Verification update — 2026-10-11

The Atomic Save Slot candidate now has a green reconstructed full-schema CI run including a regression assertion that a slot owned by another user cannot be overwritten and that a rejected write rolls back the attempted World version mutation: [run 38155440561](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38155440561). The regression suite runs only in disposable PostgreSQL; it does not change or validate a hosted database.

The Load Slot integrity gap remains open at the database boundary: `map_editor_load_save_slot_v1` returns the slot snapshot and version metadata without itself proving that the stored World snapshot matches the referenced canonical version. The active frontend currently performs the canonical version comparison before replacing editor state, but this is not a server-side guarantee. Next safe step is to design and test a separate versioned Load Slot validation contract against the reconstructed schema, including missing version, version-number mismatch, map identity mismatch, and snapshot mismatch. Do not replace the deployed RPC or activate an untested candidate in the active UI. Hosted non-production authenticated integration and browser/session round-trip remain unverified.
