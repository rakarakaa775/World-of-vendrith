# Atomic Game Save Slot RPC v1 — Design and Activation Gate

**Status:** Design only; not a deployable migration  
**Date:** 2026-10-11  
**Branch:** `feat/vendrith-ecc-v1`  
**Production database:** Unchanged

## 1. Why this contract is needed

The current frontend `saveToSlot` can commit a World version, then an Exterior version, and only afterward call `map_editor_save_slot_v1`. That RPC performs a single-row upsert into `map_editor_save_slots`; it does not roll back prior RPC calls. A slot failure can therefore leave one or both authoritative map histories advanced while the requested slot still points to its previous snapshot.

The existing `map_editor_commit_merge_v1` is optimistic and map-scoped: it locks one `maps` row, checks one expected version, inserts one immutable version and invokes reconciliation. It cannot make a later, separate Save Slot RPC part of the same transaction.

## 2. Proposed server API (not yet implemented)

Proposed function name: `public.map_editor_save_game_slot_atomic_v1`.

Inputs:
- `p_world_map_id uuid`
- `p_expected_world_version integer`
- `p_world_snapshot jsonb`
- `p_exterior_map_id uuid` (nullable only when saving a World-only slot)
- `p_expected_exterior_version integer` (required when exterior ID is supplied; 0 means no durable version yet)
- `p_exterior_snapshot jsonb` (must be null when exterior ID is null)
- `p_slot_number smallint`
- `p_label text`
- `p_slot_snapshot jsonb` (canonical Game Save envelope containing the same World and optional Exterior snapshots)

Return a structured JSON result. Success must include the slot identity, World version ID/number, optional Exterior version ID/number, and projection outcomes. Conflict must return current version numbers without writing any version or slot row. Validation/auth/ownership failures must return stable error codes and write nothing.

This proposed signature is deliberately separate from the current RPC so old clients remain compatible during rollout.

## 3. Required transaction algorithm

All authoritative writes for this operation must occur in one PostgreSQL transaction:

1. Require `auth.uid()`; validate slot range 1–12 and non-null expected World version.
2. Validate envelope shape/schema and ensure the slot snapshot's World payload is equivalent to `p_world_snapshot`; if an Exterior is present, require it to match `p_exterior_snapshot`. Validate IDs and explicit map types using the canonical serializer contract (do not infer type from dimensions).
3. Resolve both maps as owned by the authenticated user. Require World map type for the World ID and the allowed Exterior map type for the optional Exterior ID. Reject the same ID being used for both.
4. Lock affected `maps` rows in deterministic UUID order to avoid deadlocks when two clients save the same pair in opposite orders.
5. Read each current authoritative version while holding the map locks. Compare it to the supplied expected version. If either is stale, return conflict before any inserts.
6. Insert a new `map_versions` row only for a snapshot that differs from its current canonical snapshot; otherwise reuse the existing version row. For a map with expected version 0 and no current version, only allow insertion if the identity and ownership checks pass.
7. Upsert the Save Slot row, referencing the exact World version created/reused in step 6 and storing the validated combined `p_slot_snapshot`.
8. Keep authoritative version insertion and Save Slot upsert in the same transaction. Any error before this boundary completes must roll back all version and slot writes.
9. Reconcile projections without changing the meaning of authoritative success. Projection errors must be captured as structured `projection_status=failed` results only if their side effects are isolated/rolled back; do not falsely report the authoritative transaction as rolled back if version and slot writes committed. The exact reconciliation behavior must be verified from the deployed function source before implementation.
10. Return success only after the authoritative versions and slot row are committed.

### Important implementation details

- Do not trust client-supplied version IDs. Resolve version IDs server-side from the locked map/version state.
- The current slot table stores only a World `version_id/version_number`; it does not have a dedicated Exterior version reference. The combined snapshot remains the Exterior recovery source unless a separately reviewed schema change is justified.
- Avoid updating `maps.updated_at`, runtime snapshots, or projection rows outside the transaction in a way that can falsely suggest a complete save.
- Use a dedicated new RPC and retain `map_editor_save_slot_v1` for compatibility until the new flow passes its gate.
- The frontend must stop calling the individual World/Exterior commit RPCs before the new atomic RPC. A dual-write fallback would reintroduce the same partial-commit defect and must not be used after activation.

## 4. Concurrency and rollback invariants

| Scenario | Required result |
|---|---|
| World expected version stale | Conflict; no new World/Exterior version or slot update |
| Exterior expected version stale | Conflict; no new World/Exterior version or slot update |
| Invalid slot, ownership, map type, identity, or envelope | Structured failure; no writes |
| World version insert fails | Whole authoritative operation rolls back |
| Exterior version insert fails | World version insert and slot update roll back |
| Slot upsert fails | All version inserts in this call roll back |
| Two clients save the same map pair concurrently | One serializes first; the other sees conflict and must rebase/retry |
| Snapshot unchanged | Reuse existing version; slot still captures the requested combined snapshot |
| Projection reconciliation fails after authoritative commit | Explicit projection failure while version + slot remain consistently committed; only if reconciliation failure is isolated from authoritative writes |

## 5. Required tests before migration activation

### SQL integration tests in an isolated Supabase/Postgres test database
- Auth missing, map not owned, wrong map type, same World/Exterior ID, invalid slot, malformed envelope.
- World-only save and World + Exterior save.
- World stale conflict and Exterior stale conflict.
- Failure injection after World insert, after Exterior insert, and immediately before/at slot upsert; assert no partial authoritative rows remain.
- Repeated unchanged save does not create needless versions.
- Concurrent saves with the same expected versions; assert exactly one succeeds.
- Projection failure reports accurately and does not corrupt or falsely roll back authoritative rows.
- Slot row's World version reference and embedded World snapshot match byte-semantically after canonical JSON normalization.

### Application tests
- RPC payload exactly matches the validated current World/Exterior state.
- Structured conflict leaves editor state and existing slot untouched.
- RPC failure does not update local saved-version/base state or show success.
- Successful load after save restores World + Exterior; World-only legacy slots still load.
- Retry after conflict uses freshly loaded version baselines.

### Verification and rollout
1. Verify the currently deployed definitions of `map_editor_commit_merge_v1`, `map_editor_reconcile_after_merge_v1`, and `map_editor_save_slot_v1`; repository migration files alone do not prove live database state.
2. Implement SQL and tests against a disposable database, never production.
3. Run targeted SQL tests, Map Editor Vitest, typecheck, Next.js build, and full CI.
4. Review generated SQL and rollback behavior.
5. Only after explicit approval, apply the migration to a non-production environment and perform a real authenticated browser/session round-trip.
6. Activate the frontend RPC only after the non-production test gate passes; retain a documented rollback path.
7. Do not activate Terrain Semantics v2 as part of this work.

## 6. Source inspection findings — 2026-10-11

The historical repository migration source was inspected at commit `ffb9d5b987c16264b33e45a1b36d8239604b4300`. It is historical source evidence, not proof that the active production database still has precisely these definitions.

### Existing authoritative commit behavior

The historical `map_editor_commit_merge_v1` implementation:
- authenticates via `auth.uid()` and selects the owned `maps` row `FOR UPDATE`;
- compares the caller's expected version to `max(map_versions.version_number)` and returns `conflict` before inserting when stale;
- inserts the next immutable `map_versions` row and calls `map_editor_reconcile_after_merge_v1` inside the same PL/pgSQL call;
- updates `maps.updated_at` and returns `committed` only after reconciliation returns;
- catches `unique_violation` and returns a conflict response.

Because reconciliation is called inside the same PostgreSQL function/transaction and other reconciliation exceptions are not swallowed by this function, an unhandled reconciliation error aborts that commit transaction, including its inserted version. This is different from the separate frontend Save Slot call: that later RPC cannot roll back the earlier successful commit RPC.

### Existing Save Slot behavior

The historical `map_editor_save_slot_v1` validates authentication, slot range 1–12, map ownership, object-shaped snapshot, and the referenced version ID/map ID/version number/owner, then upserts one row in `map_editor_save_slots`. The function does not write World or Exterior versions. The frontend's preceding version commits are separate calls, so failure of this upsert cannot undo them.

### Remaining blockers before implementation

1. The historical migrations are not present at their historical paths on the active branch, and repository source does not prove current deployed function bodies or table constraints. Obtain/inspect the current deployed definitions and schema before writing a migration.
2. Confirm how `map_editor_reconcile_after_merge_v1` chooses projection behavior for World versus playable Exterior maps, and whether calling it twice in one new transaction is correct and idempotent.
3. Confirm whether one slot's combined snapshot is permitted to include an Exterior map ID different from the current open map, and what owner/map-type constraints the current schema enforces.
4. Build and test the new RPC against a disposable database with the same schema/functions; do not infer successful SQL compilation from documentation.

## 7. Current decision

**Do not create or apply a production migration yet.** The deployed reconciliation implementation and a disposable database test environment have not been verified in this work session. This design is a reviewable contract, not evidence that atomicity has already been delivered. No database mutation or runtime/browser test was performed.
