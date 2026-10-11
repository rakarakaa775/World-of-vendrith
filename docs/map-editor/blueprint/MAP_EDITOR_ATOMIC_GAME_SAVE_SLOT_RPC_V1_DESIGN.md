# Atomic Game Save Slot RPC v1 — Design and Activation Gate

**Status:** Design only; not a deployable migration  
**Date:** 2026-10-11  
**Branch:** `feat/vendrith-ecc-v1`  
**Production database:** Unchanged

## 1. Why this contract is needed

The current frontend `saveToSlot` can commit the World version through `map_editor_commit_merge_v1`, commit an Exterior identity version through `map_editor_commit_identity_v1`, and only afterward call `map_editor_save_slot_v1`. The Exterior identity history uses `editor_map_identity` / `editor_map_versions`, while the World Save Slot reference points to `maps` / `map_versions`. The slot RPC performs a single-row upsert into `map_editor_save_slots`; it cannot roll back either earlier RPC call. A slot failure can therefore leave one or both histories advanced while the requested slot still points to its previous snapshot.

The existing `map_editor_commit_merge_v1` is optimistic and map-scoped: it locks one `maps` row, checks one expected version, inserts one immutable version and invokes reconciliation. It cannot make a later, separate Save Slot RPC part of the same transaction.

## 2. Proposed server API (not yet implemented)

Proposed function name: `public.map_editor_save_game_slot_atomic_v1`.

Inputs:
- `p_world_map_id uuid`
- `p_expected_world_version integer`
- `p_world_snapshot jsonb` (the canonical `vandrith.map-document` envelope used by `map_editor_commit_merge_v1`)
- `p_exterior_map_id uuid` (nullable only when saving a World-only slot)
- `p_expected_exterior_version integer` (identity version number; required when exterior ID is supplied; 0 means no durable identity version yet)
- `p_exterior_snapshot jsonb` (the canonical `vandrith.map-document` envelope used by `map_editor_commit_identity_v1`; must be null when exterior ID is null)
- `p_slot_number smallint`
- `p_label text`
- `p_slot_snapshot jsonb` (canonical `vandrith.game-save` envelope whose `world` and `exterior` values are raw MapDocument objects matching the `document` members of the respective envelopes)

Return a structured JSON result. Success must include the slot identity, World version ID/number, optional Exterior version ID/number, and projection outcomes. Conflict must return current version numbers without writing any version or slot row. Validation/auth/ownership failures must return stable error codes and write nothing.

This proposed signature is deliberately separate from the current RPC so old clients remain compatible during rollout.

## 3. Required transaction algorithm

All authoritative writes for this operation must occur in one PostgreSQL transaction:

1. Require `auth.uid()`; validate slot range 1–12 and non-null expected World version.
2. Validate envelope shape/schema and ensure the slot snapshot's World payload is equivalent to `p_world_snapshot`; if an Exterior is present, require it to match `p_exterior_snapshot`. Validate IDs and explicit map types using the canonical serializer contract (do not infer type from dimensions).
3. Resolve the World map using the current `maps` / `map_versions` authority and require `map_type='world'` plus `map_editor_can_access_v1(p_world_map_id)`. Resolve the optional Exterior through `editor_map_identity` / `editor_map_versions` and require `created_by=auth.uid()` and the supported identity map type/parent relationship. Reject the same UUID for World and Exterior.
4. Lock the World `maps` row and Exterior `editor_map_identity` row in a documented global order. The final order must be compatible with all code paths that acquire both locks; a wrapper must not assume `ORDER BY` alone is enough without a concurrent test.
5. Read each latest version from its own authoritative history table. Compare both expected version numbers before writing. If either is stale, return conflict without writes.
6. Reuse a current version when its canonical snapshot is unchanged; otherwise invoke the existing `map_editor_commit_merge_v1` for World and `map_editor_commit_identity_v1` for Exterior inside the same outer PostgreSQL transaction. Treat either inner RPC's `status='conflict'` as a conflict that rolls back all writes made earlier in the wrapper. Expected version 0 is valid only when the corresponding history is empty and identity/ownership checks pass.
7. Upsert the Save Slot row in `map_editor_save_slots`, referencing the exact World `map_versions.id/version_number` and storing the validated combined `p_slot_snapshot`. Exterior identity version IDs are not currently represented in the slot table, so the combined snapshot remains the load/recovery source for Exterior.
8. Keep authoritative version insertion and Save Slot upsert in the same transaction. Any error before this boundary completes must roll back all version and slot writes.
9. Preserve the current deployed contract: `map_editor_commit_merge_v1` catches projection exceptions and can return `status='committed'` with `projection_status='failed'` and `projection_error` while retaining the authoritative World version. The atomic wrapper must propagate that status while still making World version + optional Exterior identity version + slot row one atomic authoritative unit. A projection failure is not a version/slot conflict and must not be misreported as a rolled-back save. If the outer authoritative transaction fails, all authoritative writes must roll back.
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

### Live production definitions inspected read-only — 2026-10-11

The connected Supabase project `ojtmfokjcirvjvhnbnos` was queried read-only. The live `map_editor_commit_merge_v1` returns `projection_status` and `projection_error`; it inserts the World version and updates `maps.updated_at`, then wraps `map_editor_reconcile_after_merge_v1` in an inner exception block. Projection errors are captured and do not abort that function's authoritative version write. The live `map_editor_commit_identity_v1` writes to `editor_map_versions` with a lock on the owner-scoped `editor_map_identity` row and returns `projection_status='not_run'`. The live Save Slot RPC upserts `map_editor_save_slots` and validates the referenced World `map_versions` row.

The World and Exterior therefore use different persistence authorities. The proposed atomic wrapper must call both existing commit paths within its own transaction and use a dedicated rollback boundary when either returns conflict after a prior write.

### Reconciliation behavior inspected from historical source

The historical `map_editor_reconcile_after_merge_v1` implementation:
- validates authenticated ownership of the map, the version ID/map relationship, and the snapshot object shape;
- deletes and rebuilds `map_cells` from the snapshot's ground layer, recording the source version in row metadata;
- removes orphan `map_object_geometry` rows, synchronizes geometry for objects in the target map, rebuilds navigation projection, and upserts the runtime snapshot for the committed version;
- returns counts and navigation/runtime status in a JSON result.

The function does not visibly branch by map type in the inspected historical body. It performs several projection mutations, including orphan-geometry cleanup, so the atomic RPC must test these side effects and confirm that two sequential reconciliations in one transaction are safe. An unhandled exception from any of these operations should abort the containing transaction; do not add exception-swallowing that could make the RPC report success with a partially reconciled map.

### Remaining blockers before implementation

1. The live schema confirms `editor_map_identity.map_type` allows `world`, `region`, and `playable`; Exterior documents use `MapDocument.mapType='playable'` with `playableSpace='exterior'`. The RPC must validate the database identity type plus the snapshot's `playableSpace` and parent/world relationship.
2. The live `map_editor_commit_merge_v1` ACL currently includes `PUBLIC`/`anon` execute grants, while its body rejects a null `auth.uid()`. This is not an immediate unauthenticated write path based on the inspected body, but it is broader than the other inspected save RPC grants. Add a separate reviewed privilege-hardening step; do not change grants as an incidental part of this feature.
3. Design deterministic lock ordering across `maps` and `editor_map_identity` and test concurrent save calls.
4. Build and test the new RPC against a disposable database with the same schema/functions; do not infer successful SQL compilation from documentation. The available Supabase connection currently exposes the active project only; no disposable database was created or mutated.

## 7. Current decision

**Do not create or apply a production migration yet.** Live function definitions and relevant table constraints have now been inspected read-only, but the exact identity map type/parent contract, concurrent lock ordering, and disposable-database test gate remain unresolved. This design is a reviewable contract, not evidence that atomicity has already been delivered. No database mutation or runtime/browser test was performed.


### Test-environment gate — 2026-10-11

A read-only check of Supabase development branches found one existing branch named `main` with status `MIGRATIONS_FAILED`; it is not a verified clean disposable environment. Supabase's cost quote for creating a new development branch in the linked organization is **$0.01344/hour**. A new branch has not been created because the cost must be explicitly acknowledged by the user first. Do not test this migration against production as a workaround.


### No-cost application-side adapter — 2026-10-11

Added `apps/map-editor/editor/game-save-slot-atomic-client.ts` and focused Vitest coverage in `apps/map-editor/editor/game-save-slot-atomic-client.test.ts`. The adapter validates the request envelope's basic slot/version/identity invariants and submits exactly one `map_editor_save_game_slot_atomic_v1` RPC call. It propagates RPC errors and intentionally has no legacy multi-RPC fallback.

**Activation remains blocked:** the adapter is not imported by the active editor and must remain dormant until the database function exists and passes rollback/concurrency tests in an isolated database. These unit tests verify the client contract only; they do not prove PostgreSQL transaction atomicity. No production SQL/RPC, database rows, or schema were changed.

The available execution container has Node/npm but no checked-out repository, PostgreSQL client, or Docker executable, so this session cannot run the package locally or provide a disposable PostgreSQL test database. The GitHub Actions Map Editor workflow is the no-cost remote route for Vitest, typecheck, and build verification; its result must be checked for the latest commit before marking those checks passed.


### CI verification after adapter and terrain fixture correction — 2026-10-11

GitHub Actions run [38144537519](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38144537519) completed successfully on `feat/vendrith-ecc-v1` commit `e8f1dbb2ab14ff9814551a8858e43088dba50c03`: TypeScript typecheck passed, Next.js build passed, and Vitest passed **165 test files / 846 tests**, including all five `game-save-slot-atomic-client.test.ts` cases. The prior failure was a contradictory test fixture: it omitted a base cell from the remote sparse snapshot while expecting that cell not to be treated as deleted. The fixture now retains that cell on the remote side, preserving the documented deletion semantics.

This CI result verifies the application adapter contract only. It does not verify PostgreSQL atomicity, RPC deployment, authenticated browser round-trip, or production schema state. The adapter remains intentionally unwired; no production database changes were made.
