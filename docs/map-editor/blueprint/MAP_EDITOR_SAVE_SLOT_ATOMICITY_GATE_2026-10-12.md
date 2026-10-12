# Save Slot Atomicity — Implementation Gate (2026-10-12)

## Current state

Target branch: `feat/vendrith-ecc-v1`.

Candidate assets:
- Migration: `supabase/migrations/20261011220000_map_editor_atomic_game_save_slot_v1.sql`
- RPC: `public.map_editor_save_game_slot_atomic_v1`
- Client adapter: `apps/map-editor/editor/game-save-slot-atomic-client.ts`
- Preparation and identity validation: `apps/map-editor/editor/game-save-slot-atomic-workflow.ts`
- Disposable SQL tests: `supabase/tests/atomic-save-slot-fixture.sql`, `supabase/tests/atomic-save-slot-assertions.sql`, `supabase/tests/atomic-save-slot-full-schema-assertions.sql`

The candidate migration has **not** been applied to hosted Supabase. The active UI still uses the legacy Save Slot path. This is intentional: the UI must not call an RPC that has not been installed and verified in an authenticated non-production environment.

## Confirmed legacy failure boundary

The active Save Slot flow may commit a World version, then an Exterior identity version, and only afterward call `map_editor_save_slot_v1`. The final slot upsert does not include those earlier commits in its transaction, so a later failure can leave version writes behind.

## Candidate transaction contract

The candidate RPC is designed to:
- authenticate and validate World, Exterior, slot, and snapshot payloads;
- lock the authoritative World row and then the optional Exterior identity row;
- verify ownership, parent linkage, map types, and expected versions before writes;
- reuse unchanged canonical versions and commit changed versions through existing World/identity RPCs;
- require the combined Game Save envelope to match the World and optional Exterior snapshots;
- upsert the Save Slot row in the same transaction as the version writes;
- roll back all writes in the guarded subtransaction on an unexpected failure;
- revoke execution from `public` and `anon`, granting it to `authenticated`.

World-only legacy saves must remain valid with `exterior: null`. Editor identity IDs must not be treated as legacy `maps` IDs.

## Projection response compatibility hardening

The candidate no longer directly dereferences optional `projection_status` or `projection_error` fields from the dynamic record returned by `map_editor_commit_merge_v1`. It reads optional metadata through `to_jsonb(v_world_result)`. If the World merge RPC returns only the historical four columns (`status`, `version_id`, `version_number`, `current_version`), the atomic Save Slot result now reports `projection_status: not_run` rather than failing on a missing record field. If the optional metadata exists, it is preserved.

The isolated SQL fixture now models the historical four-column World merge response and asserts the `not_run` fallback. The reconstructed full-schema integration continues to exercise the six-column response shape and asserts an explicit supported projection outcome.

Source commits:
- `549abc24d1d3974843eecf8b31bf09cb51f51682` — compatibility-safe projection metadata read.
- `4a54b2ab9484787252f36cfb64b488654c4b3f00` — full-schema projection outcome assertion.
- `b295124c5db8f2b174de35ced709557a5b6aae5c` — legacy four-column RPC fixture.
- `7a0471222c6ac5bbe85b94dbf73e4f526ce88770` — legacy fallback regression assertion.
- `35fa9a6899dce348789e38e943294b927b5b5486` — explicit `$legacy$` SQL delimiter for the fixture function.

## Verification state

GitHub Actions run [38187243966](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38187243966) passed three jobs on commit `a791d163013898335166b796c4e235981f15e007`, before the compatibility changes: TypeScript/build/Vitest, isolated PostgreSQL fixture tests, and reconstructed full-schema RPC integration/concurrency tests.

At the latest check, the connected GitHub status/workflow endpoints did not expose a run or status checks for the newest compatibility commits. Therefore the new regression is **not yet verified green**. Do not treat the earlier passing run as validation of these latest edits.

The reconstructed SQL baseline is not a byte-for-byte production schema, and the fixture uses isolated Auth compatibility behavior. These checks do not substitute for hosted non-production authenticated integration or browser/session E2E.

## Remaining release gates

1. Obtain a green exact-commit CI run for the new four-column compatibility regression and current full-schema assertions.
2. Review the candidate migration and all involved RPC signatures, schema constraints, and grants against an available non-production Supabase project.
3. Run authenticated non-production integration tests for Save → Load → Save, version conflicts, injected failures, and concurrent saves.
4. Exercise those cases in a real authenticated browser session.
5. Only after those gates pass, prepare a release plan and request explicit approval before any hosted migration or UI activation.

## Current decision

Do not wire the active UI to the candidate RPC yet. Continue with repository-side validation without applying hosted migrations, creating a paid Supabase branch, or modifying production data. Terrain V2 remains unactivated.

## Validated Load Slot hardening (2026-10-12)

A further source review found that the candidate validated Load Slot RPC checked the embedded Exterior document's shape and map type, but did not prove that its ID referred to an owner-accessible persisted Playable identity. That could allow a structurally plausible but unregistered or foreign-owned Exterior payload to be returned to the client.

The candidate RPC now also:
- loads the authorized World row and uses its authoritative `world_id`;
- verifies a non-null Exterior ID against `editor_map_identity` for the same owner, World, and `playable` map type;
- requires the Exterior to have a parent Region owned by the same user and in the same World;
- rejects unknown/foreign Exterior identities before returning any slot snapshot.

Regression assertions were added to both the isolated Load Slot SQL contract and reconstructed full-schema assertion set for unknown and foreign-owned Exterior identities.

Source commits:
- `48d619eebfb3baf41e859d7a02a013a14b66ef81` — owner-scoped Exterior identity and parent validation in candidate Load Slot RPC.
- `4494d6855c80c1f9c054b32349349eba8cbe9ec7` — isolated Load Slot regression tests.
- `2e250e2d47e2e76d709d0a891cfb184a75cb95aa` — full-schema Load Slot regression tests.
- `101fcad1f13cf7f972d1bab5a590cac83d4f41a2` — isolated invalid-parent regression.
- `02372458a4d6a2b4141d5cf7389909d6f06d4f6b` — full-schema invalid-parent regression.

These are source changes only. The SQL tests have not yet been confirmed green on GitHub Actions, and the candidate RPC remains unapplied to hosted Supabase and unwired from the active UI.

### Additional Load Slot snapshot provenance check

A second review found that validating an Exterior's persisted identity and Region parent alone would still permit a forged document to reuse a legitimate Exterior ID while changing its content. The candidate Load Slot RPC now requires the returned Exterior document to exactly match the `document` stored in at least one owner-scoped `editor_map_versions` record for that identity. This preserves valid historical slot snapshots while rejecting content that was never persisted as a version.

Regression assertions now mutate only the embedded Exterior name while leaving its ID intact, and expect `EXTERIOR_VERSION_SNAPSHOT_MISMATCH` in both isolated and reconstructed full-schema suites.

Source commits:
- `9f8d3038f658106751f4d0bc2793c4068f2606b4` — verify Exterior payload against persisted version history.
- `57b4c61c0c3783b798a0e40dcf500296d1aa4922` — isolated snapshot-provenance regression.
- `c81c50b5830df717f2ddc3d19f11ba8d3413c0ad` — full-schema snapshot-provenance regression.

These assertions have been authored but not executed in a confirmed green CI run. Hosted Supabase and active UI remain unchanged.
