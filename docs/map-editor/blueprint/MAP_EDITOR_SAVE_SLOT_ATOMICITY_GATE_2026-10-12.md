# Save Slot Atomicity — Implementation Gate (2026-10-12)

## Status

Audit-only checkpoint. No production database calls, migrations, deployments, or paid Supabase features were used.

Target branch: `feat/vendrith-ecc-v1`.

## Confirmed failure boundary

The current Save Slot UI writes in this order:

1. Read the latest authoritative World snapshot.
2. If the local World differs, call `map_editor_commit_merge_v1` through `saveWithConflictDetection`. That RPC inserts the next `map_versions` row and invokes `map_editor_reconcile_after_merge_v1` in its transaction.
3. If an Exterior document exists and differs, call `map_editor_commit_identity_v1` (or its initial version path), which inserts into `editor_map_versions`.
4. Read the World `map_versions.id`.
5. Call `map_editor_save_slot_v1`, which validates the existing World version and upserts only the `map_editor_save_slots` row.

Each RPC is transactional on its own. The sequence across these calls is not one transaction. If step 5 fails, successful World and/or Exterior version commits from steps 2–3 are not rolled back. The current UI correctly warns about possible prior writes, but warning is not atomicity.

## Required server contract

A replacement transaction boundary must accept the expected World version, World snapshot, optional Exterior identity + expected version + snapshot, slot number/label, and the combined game-save snapshot. Inside one PostgreSQL function transaction it must:

- require an authenticated owner and validate slot range and all input shapes;
- lock the owned World row and compare the expected World version before inserting anything;
- if Exterior is present, lock the owned `editor_map_identity` row and compare its expected version before inserting anything;
- validate that the combined slot snapshot's World/Exterior documents agree with the separately committed documents;
- insert the World immutable version and run the existing World reconciliation primitive;
- insert the optional Exterior immutable identity version;
- upsert the slot row pointing at the newly created World version;
- let unexpected errors propagate so PostgreSQL rolls back all changes in the function transaction;
- return explicit conflict results before writes if either expected version is stale;
- revoke public/anon execution and grant only to authenticated users.

The implementation must preserve legacy World-only slots (Exterior = null) and must not reinterpret the existing editor identity map types as legacy `maps.map_type`.

## Verification gate before wiring the UI

- PostgreSQL integration tests with transaction rollback assertions for failures after World insert, after Exterior insert, and during slot upsert.
- Stale World and stale Exterior expected-version tests; simultaneous saves to the same slot; owner/auth/invalid-slot/invalid-snapshot tests.
- World-only and World+Exterior save/load round-trip tests; existing slot compatibility tests.
- Typecheck, focused Save Slot tests, full Vitest suite, and build.
- Review generated SQL and test results before any deployment. Production migration remains explicitly out of scope until the user authorizes it.

## Current decision

Do not wire the UI to a new RPC until the migration has a tested contract and the user can safely apply it. Leaving the current multi-RPC flow in place is a known limitation; it is not to be described as atomic. Terrain V2 remains unactivated.
