# Save Slot Atomicity — Implementation Gate (2026-10-12)

## Current state

Target branch: `feat/vendrith-ecc-v1`.

The candidate atomic RPC and its tests already exist in the branch:

- Candidate migration: `supabase/migrations/20261011220000_map_editor_atomic_game_save_slot_v1.sql`
- RPC: `public.map_editor_save_game_slot_atomic_v1`
- Client adapter: `apps/map-editor/editor/game-save-slot-atomic-client.ts`
- Pure preparation/identity validation: `apps/map-editor/editor/game-save-slot-atomic-workflow.ts`
- Regression tests include identity boundaries, World-only legacy compatibility, save/load/save round-trip, SQL rollback, stale-version conflicts, and concurrent slot writes.

The candidate migration is intentionally **not applied to hosted Supabase**. The active UI is still on the legacy Save Slot path. This is deliberate: no live UI call should target an RPC that has not been installed and verified in an authenticated non-production environment.

## Confirmed legacy failure boundary

The current active Save Slot UI may commit a World version, then an Exterior identity version, and only afterward call `map_editor_save_slot_v1`. That RPC atomically upserts the slot row but does not include those prior commits in its transaction. A failure at the final stage can therefore leave earlier version commits behind.

## Candidate transaction behavior

The candidate RPC is intended to own the whole Save Slot operation in one server-side transaction:

- authenticate and validate the World/Exterior/slot payloads;
- lock the authoritative World row, then the optional Exterior identity row in a consistent order;
- verify World and Exterior ownership, parent linkage, map type, and expected versions before writes;
- reuse unchanged canonical versions and commit changed versions through the existing World/identity commit RPCs;
- validate that the combined Game Save envelope matches the World and optional Exterior snapshots;
- upsert the Save Slot row with the World version reference;
- roll back all writes inside the guarded subtransaction on an unexpected failure;
- grant execution only to `authenticated`, not `public` or `anon`.

Legacy World-only saves must remain valid with `exterior: null`. The candidate must not treat editor identity IDs as legacy `maps` IDs.

## Automated verification already recorded

The branch status log records GitHub Actions run [38187243966](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38187243966) passing three jobs on commit `a791d163013898335166b796c4e235981f15e007`: TypeScript typecheck, Next.js build and Vitest; isolated PostgreSQL fixture contract tests; and reconstructed full-schema candidate RPC integration/concurrency tests.

This is useful automated evidence, but it is not equivalent to a byte-for-byte production schema, hosted non-production authenticated integration, or browser/session E2E. The reconstructed SQL fixture has documented limits, including test stubs for some existing RPC behavior.

## Signature compatibility hardening (source change committed; CI pending)

The candidate migration no longer dereferences optional `projection_status` / `projection_error` fields directly from the dynamic record returned by `map_editor_commit_merge_v1`. It now reads those values through `to_jsonb(v_world_result)`; when the authoritative RPC does not expose projection metadata, the Save Slot result reports `projection_status: not_run` rather than failing after entering the atomic save block. When the metadata exists, its values are preserved.

The full-schema integration success case asserts that the atomic RPC always returns an explicit supported projection outcome. The isolated stub fixture now deliberately models the historical four-column World merge RPC and asserts that the atomic Save Slot result falls back to `not_run`; the reconstructed full-schema job continues to exercise the current six-column response shape. Source commits:
- `549abc24d1d3974843eecf8b31bf09cb51f51682` — compatibility-safe projection metadata read.
- `4a54b2ab9484787252f36cfb64b488654c4b3f00` — full-schema projection outcome assertion.
- `b295124c5db8f2b174de35ced709557a5b6aae5c` — legacy four-column RPC fixture.
- `7a0471222c6ac5bbe85b94dbf73e4f526ce88770` — legacy fallback regression assertion.

This is a compatibility hardening, not proof that every hosted deployment has the expected authoritative RPC. CI results for these latest commits still need to be checked; no checks were visible immediately after the writes.

## Historical signature context

The historical repository migration `20260912023000_map_editor_commit_merge_security_definer_v1.sql` declares only four output columns: `status, version_id, version_number, current_version`. Later project notes say the live function contract was extended to expose projection outcome, but the exact migration/source that establishes that signature was not located in the active branch during this audit. The compatibility-safe JSON access prevents an absent optional field from causing a runtime record-field error. Do not infer that the historical migration alone represents the current hosted function.


The candidate RPC reads `projection_status` and `projection_error` from the record returned by `map_editor_commit_merge_v1`. The historical repository migration `20260912023000_map_editor_commit_merge_security_definer_v1.sql` declares only four output columns: `status, version_id, version_number, current_version`. Later project notes say the live function contract was extended to expose projection outcome, but the exact migration/source that establishes that signature must be verified against the current branch and the disposable full-schema fixture. Do not infer that the historical migration alone is sufficient. If the actual callable function returns only four columns, a changed-World Save Slot call can fail when the candidate reads `projection_status`, and the candidate's exception subtransaction should roll back the attempted writes. Add a regression that applies the exact authoritative current function definition and tests both projection success and projection failure before activation.

## Remaining release gates

1. Resolve the return-shape check above and review the candidate migration and test fixtures against the actual deployed function signatures, schema, constraints, and grants.
2. Run authenticated integration tests against a disposable/non-production Supabase project when one is available; do not enable a paid branch or change production as a workaround.
3. Exercise Save → Load → Save and failure/conflict cases in the browser with a real authenticated session.
4. Only after those gates pass, prepare an explicit migration/release plan. Production application is outside the current authorization.

## Current decision

Do not wire the active UI to the candidate RPC yet. Continue reviewing and strengthening the repository-side migration and disposable-database tests without applying any hosted migration. Terrain V2 remains unactivated.
