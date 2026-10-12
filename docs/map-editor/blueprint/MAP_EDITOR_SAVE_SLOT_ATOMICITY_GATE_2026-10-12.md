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

### Client-side validated Load Slot adapter

The repository now includes an isolated client adapter, `apps/map-editor/editor/game-load-slot-validated-client.ts`, and Vitest contract tests. It calls only `map_editor_load_save_slot_validated_v1`, validates the response shape, returns explicit server-declared error codes, and propagates transport errors without attempting direct table reads or a legacy fallback.

Source commits:
- `c842a1cbe56986d157cecd63a59b461992f80e42` — validated Load Slot client adapter.
- `fb4f98fe8283ed0b677e2a6db24297b63461fceb` — client contract tests.

This adapter is not wired to the active editor. Tests have been authored but are not confirmed green because the current GitHub status endpoint is returning no check results for recent commits.

### Concurrency hardening and scope regression

The Load Slot candidate now takes shared row locks while validating the owner-scoped World, Exterior identity, Region parent, and matching Exterior version. This narrows the window in which those authoritative records could change between validation and response. A full-schema regression assertion also rejects an Exterior parent assigned to a different World and verifies that the Load Slot RPC is executable by `authenticated` but not `anon`.

Source commits:
- `bde60d99c754193042122f5f19359b012cb8c0a0` — lock rows used for Load Slot validation.
- `148481362e38a7f70c3cf321621dff07161f859d` — test cross-World parent and execute grants.

The checks are source-level additions only until CI executes them. Shared locks do not replace the need for integration testing against the reconstructed schema.

### Active UI integration boundary confirmed

A fresh inspection of `apps/map-editor/components/vendrith-world-builder-app.tsx` confirms that the active Load Slot handler still calls the legacy `map_editor_load_save_slot_v1` RPC and then performs a client-side read of `map_versions` before restoring editor state. The candidate `map_editor_load_save_slot_validated_v1` client remains intentionally unused.

Do not simply replace the RPC name: the validated candidate returns a different trust contract, and the active handler's extra canonical-version query must be removed or re-designed on the validated path so there is no accidental direct-read fallback. Integrate only after the disposable full-schema job and authenticated browser test pass. The existing `prepareRefreshThenCommit` boundary must remain intact so a failed validation or slot metadata refresh cannot partially replace the current editor state.

## Follow-up verification — 2026-10-12

- Added an explicit full-schema Load Slot assertion for a World-only Game Save with `exterior: null`. It verifies the validated RPC returns success and preserves JSON null rather than inventing or dropping Exterior state.
- CI workflow review confirms the disposable full-schema job applies both candidate Save Slot and validated Load Slot migrations, then runs `atomic-load-slot-validated-assertions.sql` and `atomic-save-slot-full-schema-assertions.sql`. The isolated stub fixture job does not apply the validated Load Slot migration, by design.
- The current GitHub connector reports no commit status entries and no workflow runs for the latest commit; this is **not evidence of a passing test run**. PostgreSQL execution, typecheck, build, and Vitest remain unverified for this latest revision until an Actions run result is available.
- No hosted migration was applied and the active UI still uses the legacy Load Slot path. Keep activation blocked until full-schema PostgreSQL CI passes and the client/UI integration is reviewed and tested.

## CI verification result — 2026-10-12

Latest verified workflow run: [Map Editor CI #908](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38239104195), commit `cbd91e07a5e01f1330db45cf2f5c489cf0420731`.

All three jobs passed:
- Map Editor tests: TypeScript typecheck, Next.js production build, and Vitest.
- Atomic Save Slot PostgreSQL fixture contract tests, including concurrent save serialization.
- Reconstructed full-schema PostgreSQL integration: validated Load Slot integrity assertions, real RPC/schema assertions, and full-schema concurrent-save serialization.

The test suite exposed fixture mutations that were correctly blocked by the reconstructed schema's `editor_map_identity` invariant trigger. Those negative tests now bypass that trigger only inside their disposable test transaction to simulate already-corrupt historical rows; each case rolls back. No hosted Supabase branch or production migration was created/applied.

**Activation remains gated:** the validated Load Slot RPC is verified against the reconstructed disposable schema, but the hosted production schema and authenticated browser Save -> Load -> Save flow have not been verified. The active UI therefore intentionally remains on the legacy Load Slot path until those two checks can be completed safely.


## Latest exact-commit verification — 2026-10-12 11:02 UTC

The previous verification notes above describe the state at the time they were written. The latest branch head has since been tested:

- Commit: `be2eefce0e06055c1e166f1a74c7fc164baca7b6` (`test(map-editor): reject mismatched validated load identities`).
- GitHub Actions run [#914](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38240080433) completed with **success**.
- `Map Editor tests`: TypeScript typecheck, Next.js build, and Vitest all passed.
- `Atomic Save Slot PostgreSQL fixture contract tests`: isolated RPC, rollback, and concurrent-save checks passed.
- `Atomic Save Slot reconstructed full-schema integration`: validated Load Slot integrity assertions, RPC/schema integration, and concurrent-save serialization passed.

The validated Load Slot client adapter now additionally rejects a successful RPC payload if its `map_id` differs from the requested World ID or its `slot_number` differs from the requested slot. Regression tests cover both mismatches. These checks are covered by the exact-commit CI run above.

## Active UI audit after CI

The active `loadSlot` callback in `apps/map-editor/components/vendrith-world-builder-app.tsx` still calls legacy `map_editor_load_save_slot_v1`, then reads `map_versions` directly to verify the referenced canonical World version. The validated adapter is not yet wired into the UI. This is intentional: changing only the RPC name would not remove the old direct-read dependency or establish the full authenticated session behavior.

The current UI keeps `prepareRefreshThenCommit` as a pre-commit boundary: it parses and validates the candidate slot, checks the canonical World version, refreshes slot metadata, and only then replaces editor state. Any future validated-RPC integration must preserve that all-fallible-work-before-state-commit property and must define how canonical World/version consistency is guaranteed by the server response, rather than reintroducing a client-side direct table read.

## Remaining release gates (current)

1. Run authenticated non-production Save -> Load -> Save, conflict, injected-failure, and concurrent-save checks.
2. Run those flows in a real authenticated browser session.
3. Verify the migration and grants against an available hosted non-production Supabase project.
4. Only after those gates pass, prepare a release plan and obtain explicit approval before applying any hosted migration or activating the new UI path.

No hosted migration has been applied, no paid Supabase branch has been created, and the active Save/Load UI remains unchanged. Keep PR #16 as draft; do not merge it as a release.


## Atomic Save Slot client response contract — exact CI verification

- Commit: `2bedf151bb268be8ea93f09c6efcebfe681316b0` (`test(map-editor): cover atomic save RPC response contract`).
- GitHub Actions run [#916](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38249200253) completed with **success**.
- All three jobs passed: Map Editor tests (typecheck, Next.js build, Vitest), isolated PostgreSQL fixture contract tests, and reconstructed full-schema PostgreSQL integration.
- The client adapter now parses the SQL contract explicitly: `{ ok: true, slot_number, world_version_id, world_version_number, exterior_version_id, exterior_version_number }` on success, and `{ ok: false, code, ... }` on server-declared failure. It rejects malformed success responses and responses whose slot number does not match the request. World-only saves require null Exterior version fields.
- Regression tests cover one-RPC request shape, trimmed/default labels, World-only save, explicit version conflict, malformed or mismatched responses, invalid input rejected before the RPC, and transport failure without retries or legacy fallback.
- The intermediate client-only commit `2b51c1cc650d82ed272cbe6b8d656a4362d65324` had a failing CI run because the test fixture still reflected the old response contract. The follow-up test commit above updates the fixture and is the latest verified green state.

The adapter remains intentionally unwired to the active UI. CI proves the isolated and reconstructed disposable-database contract only; it does not prove the hosted Supabase schema or authenticated browser Save -> Load -> Save flow. Do not apply hosted migrations or activate the new UI path without those release gates. No paid Supabase branch was created and no production database was changed.

## Atomic Save Slot Region-lock hardening — exact CI verification

- Commit: `9682e67a4bd133f5caa5803a0e6ed7a9c17ec6ad` (`fix(map-editor): lock region parent during atomic save`).
- GitHub Actions run [#917](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38249873391) completed with **success**.
- All three jobs passed: Atomic Save Slot PostgreSQL fixture contract tests, reconstructed full-schema integration, and Map Editor tests.
- The atomic Save Slot RPC now selects the validated parent Region with `FOR SHARE`, complementing the World and Exterior locks. This prevents a concurrent transaction from modifying/deleting the parent Region row while this save transaction is validating the Exterior-to-Region relationship.
- This is a database-locking change tested by CI's isolated fixtures and reconstructed full-schema database only. It does not mean the migration has been applied to hosted Supabase or that authenticated browser flows have passed.

Release gates remain unchanged: no hosted migration, no paid Supabase branch, no production database changes, and no activation of the candidate UI path. Keep PR #16 as draft until hosted non-production and authenticated browser validation are completed.

## Parent Region lock regression test — exact CI verification

- Commit: `e2e139e1b089f018f27859dbd72543dd47830d3a` (`test(map-editor): verify atomic save locks region parent`).
- GitHub Actions run [#918](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38251333346) completed with **success**.
- All three jobs passed: isolated PostgreSQL fixture contract tests, reconstructed full-schema integration, and Map Editor tests.
- The full-schema concurrency script now holds a successful Save Slot transaction open, attempts an update to the parent Region with a short PostgreSQL `lock_timeout`, and asserts that the update is blocked by the expected lock timeout before proceeding to the stale-baseline concurrent save assertion.
- This verifies the parent Region `FOR SHARE` lock in the disposable CI database. It is not evidence of a hosted Supabase migration or authenticated browser run.

Safety boundary remains: no paid Supabase branch, no hosted migration, no production DB changes, no candidate UI activation; PR #16 remains draft.


## Next no-cost validation step — local authenticated stack

The repository contains `supabase/config.toml` configured for local PostgreSQL 17, local Auth, and the local API. This gives a no-paid-branch path for the next integration stage, provided Docker and the Supabase CLI are available on the developer machine. It does not require linking the project to hosted Supabase.

Recommended order:

1. Check local prerequisites only: `docker --version`, `supabase --version`, and confirm ports 54320–54324 are free.
2. Start the local stack with `supabase start`; record the local API URL and anon key printed by the CLI. Do not use production credentials.
3. Reset/apply migrations only to the local database, after reviewing the full migration sequence and seed behavior. The reconstructed CI schema is currently a test harness, not proof that every repository migration is locally replayable.
4. Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build` from `apps/map-editor`.
5. Create a throwaway local Auth user and owner-scoped World/Region/Exterior fixtures. Exercise the candidate Save and Load RPCs directly with that authenticated session before enabling UI wiring.
6. Verify Save → Load → Save, World-only save, stale-version conflict, transaction rollback on injected failure, concurrent saves, and preservation of current editor state when load validation or slot refresh fails.
7. Only after the RPC/session checks pass, add a browser test harness. The current `apps/map-editor/package.json` does not include Playwright or another browser E2E runner, so a real browser flow is not currently part of CI.

Do not run `supabase link`, `supabase db push`, or any hosted migration as part of this local-only step. Do not point local scripts at production environment variables. If Docker/CLI are unavailable, stop at the existing disposable PostgreSQL CI evidence rather than substituting unverified manual claims.

### Activation gate unchanged

The candidate RPC adapters remain unwired in `vendrith-world-builder-app.tsx`. The active handlers still use the legacy multi-write Save Slot sequence and legacy Load Slot RPC/direct canonical-version read. That known limitation is intentionally not hidden behind a superficial RPC-name change. No production data was modified, no paid Supabase branch was created, and PR #16 remains draft.
