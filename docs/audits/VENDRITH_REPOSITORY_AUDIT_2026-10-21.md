# World of Vendrith — Repository Audit Checkpoint

**Date:** 2026-10-21
**Repository:** `rakarakaa775/World-of-vendrith`
**Required branch:** `feat/vendrith-ecc-v1`
**Observed HEAD:** `9057ef363a7b8f655d4661f3eb637671661f43ac`
**Observed commit:** `fix(map-editor): rerender after terrain metadata resolves` (2026-10-18)

## 1. Safety and repository integrity

- Desktop Commander device `codespaces-202112` was online and connected.
- Active repository path: `/workspaces/World-of-vendrith`.
- Branch remained `feat/vendrith-ecc-v1`.
- `git rev-list --left-right --count HEAD...origin/feat/vendrith-ecc-v1` returned `0 0` at audit time.
- Three pre-existing user changes were preserved and not edited by this audit:
  - `apps/map-editor/components/pixi-map-canvas.tsx`
  - `apps/map-editor/editor/terrain-asset-binding-loader.ts`
  - `apps/map-editor/tests/terrain-asset-binding.test.ts`
- No branch was created, no commit/push was made, and no production database or deployment was modified.
- Previous local validation (recorded in the immediately preceding audit session): Map Editor typecheck passed; Vitest passed with 173 files / 904 tests; production build passed with 24 static pages; `git diff --check` passed. These are local checks, not proof of current GitHub CI or deployed behavior.

## 2. Terrain texture audit evidence

### Confirmed

- Bundled terrain PNGs exist under `apps/map-editor/public/assets/terrain/` and the 16 local terrain sheets inspected are 160×192 RGBA PNGs.
- A `sharp` pixel check confirmed all 16 configured 16×16 local crops are within the image bounds.
- Crop opacity check: 14 crops are fully opaque; the configured `sand` crop at `(96,112)` and `tallgrass` crop at `(80,128)` each have 242/256 fully opaque pixels (all 256 pixels are non-transparent). This contradicts the nearby comment claiming every chosen crop is fully opaque. Visual suitability still needs a browser review; this alone does not establish a rendering defect.
- The loader rejects missing/malformed sprite regions and requires approved candidate and asset statuses.

### Findings requiring follow-up

**TERRAIN-01 — Texture request collection only traverses the active layer (source-level finding).**
`apps/map-editor/components/pixi-map-canvas.tsx:400-410` gathers mask-specific approved binding textures from `activeLayer`, while rendering traverses every visible ground layer at lines 464-518. A non-active visible layer may use a mask-specific approved binding whose texture was not requested; if that approved binding exists but its texture is absent, the renderer skips the sprite rather than choosing the local fallback (`:503-510`). This is a plausible missing-texture path for multiple visible terrain layers. It needs a focused regression test and UI verification before marking confirmed in the running application.

**TERRAIN-02 — Loaded texture bounds are not checked before crop creation.**
Initial source evidence found `terrain-asset-binding-loader.ts:55-71` validates region shape but cannot know actual loaded texture dimensions. Implemented follow-up: `editor/terrain-asset-region.ts` validates crop bounds against the loaded texture source before Pixi crop creation; invalid/missing approved crops fall back to a valid local base crop when one exists. Regression tests cover out-of-bounds x/y, width/height, fractional coordinates, zero dimensions, and invalid source dimensions. Focused tests and typecheck passed; full suite/build are to be recorded after the final patch.

**TERRAIN-03 — Opacity comment disagrees with the binary evidence.**
The configured sand and tallgrass crops each have 242/256 fully opaque pixels, with all 256 pixels non-transparent. The code comment now accurately documents partial-alpha edge pixels and the intended deterministic terrain-color underlay. Visual suitability still needs browser review.

## 3. Save/Load and runtime gates carried forward from existing audits

- Current source differs from the October 15 notes: `components/vendrith-world-builder-app.tsx:390` calls `saveGameSlotAtomically()`, and `:534` calls `loadGameSlotValidated()`. Therefore dated status entries saying the active UI remains on the legacy path are stale for the current branch and must not be used as current implementation evidence.
- Read-only live Supabase catalog check on 2026-10-21 for project `ojtmfokjcirvjvhnbnos` found migration ledger count 555, latest version `20261008211645` (`vendrith_phase4_final_audit_hardening_v1`), and no ledger rows dated `20261010` or later. The candidate atomic Save and validated Load functions were absent; legacy `map_editor_save_slot_v1` and `map_editor_load_save_slot_v1` remained `SECURITY DEFINER` and executable by `authenticated`.
- The live `map_editor_save_slots` table still has unique constraint `(map_id, slot_number)`, RLS enabled but not FORCE RLS, and the canonical-World SELECT policy that does not filter `created_by`. `anon` and `authenticated` still have broad table grants including TRUNCATE; RLS does not protect TRUNCATE. The legacy Load function selects by map and slot without owner filtering, and the legacy Save upsert conflicts on `(map_id, slot_number)` without an owner predicate. This is a strong, source/catalog-supported cross-user isolation risk; no cross-user mutation was attempted against production.
- The local candidate migration `20261010190000_map_editor_private_save_slots_v1.sql` changes the unique key to `(map_id, created_by, slot_number)` and revokes direct/legacy mutation access; atomic Save depends on that new conflict target. Safe candidate order is private Save Slots → atomic Save → validated Load, but only after disposable PostgreSQL regression passes and an explicit rollout decision. Do not apply these migrations to production as part of this audit.
- `docs/map-editor/MAP_EDITOR_ROADMAP_PROGRESS.md` leaves browser conflict-flow verification and the Foundation Exit Gate open.
- The 2026-10-17 drag/drop checkpoint records typecheck/tests/build success, but browser drop verification and registry-backed Save→Load→Save remain open.
- `docs/architecture/VENDRITH_TERRAIN_RUNTIME_INTEGRATION_AUDIT_V1.md` still marks production runtime World Definition/adapter mapping, durable mutation/recovery verification, and terrain round-trip/determinism tests incomplete.
- Terrain semantics v2 adapters remain documented as opt-in rather than wired into the active editor/save/recovery/conflict path.

## 4. Hosted database, Vercel, and browser evidence

Read-only Supabase catalog evidence was collected on 2026-10-21; no SQL mutation, migration, or authenticated Save/Load call was performed. The hosted schema/function mismatch above is confirmed. Because the current branch preview calls functions absent from the hosted catalog, Save/Load through that preview is expected to fail at RPC lookup until a separately approved schema rollout is performed; the failure was not reproduced through a browser.

Vercel read-only deployment listing on 2026-10-21 found:

- Latest `feat/vendrith-ecc-v1` preview: **READY**, commit `9057ef363a7b8f655d4661f3eb637671661f43ac`, URL `https://rakarakaa775-world-of-vendrith-k3acknman-rakamahandika123-4779.vercel.app` (created 2026-10-18 17:25 UTC).
- Latest deployment targeted to production: **READY**, commit `4107f5cbcee6b579678b058d1421936922941b6f` (created 2026-10-14 16:01 UTC), URL `https://rakarakaa775-world-of-vendrith-l12kvipba-rakamahandika123-4779.vercel.app`.
- GitHub combined commit status and workflow-run lookups for `9057ef36` returned empty results; this is not evidence that CI passed or failed.

No local `.env.local`, Playwright package/config, or browser binary was found in the checked Map Editor environment. No app server was running. Therefore no authenticated browser session, actual Pixi visual render, drag/drop flow, or two-client Save/Load flow is claimed as verified.

## 5. Ordered six-role work protocol

The roles are coordination responsibilities, not claims of six independent agents running concurrently:

1. **Roadmap:** prioritize the confirmed evidence and define the smallest next gate.
2. **Auditor:** verify the suspected texture request gap and crop bounds from source plus tests.
3. **Implementer (Desktop Commander):** make a narrow patch only after the gap and acceptance criteria are confirmed; preserve the three pre-existing user diffs.
4. **QA Tester:** add/run focused regressions, then typecheck/full tests/build.
5. **Integrator:** review complete diff and ensure only intended files changed.
6. **Verifikator:** recheck branch/status/HEAD, test evidence, and limitations; no completion claim without proof.

## 6. Next tasks and closure criteria

### T-01 — Terrain texture request completeness
- [x] Added regression coverage for a visible non-active ground layer requiring a mask-specific approved binding.
- [x] Added `editor/terrain-texture-requests.ts` and wired canvas texture collection across all renderable visible terrain layers, matching the render traversal filters.
- [x] Focused tests passed (2 files / 10 tests); TypeScript typecheck passed.
- [x] Full Vitest suite passed (174 files / 906 tests); Next.js production build passed (24 static pages); `git diff --check` passed.
- [ ] Browser visual check remains blocked by the absence of a browser runner and authenticated test environment. No claim of visual verification.

### T-02 — Texture crop bounds and base-crop evidence
- [x] Validate crop bounds against loaded texture source dimensions before creating a Pixi texture.
- [x] Fall back to a local base crop when an approved crop is invalid or its texture is unavailable and a local terrain asset exists.
- [x] Add regression tests for out-of-bounds x/y and width/height, fractional coordinates, zero width, and invalid source dimensions.
- [x] Correct the comment to document partial-alpha sand/tallgrass pixels and the intended color underlay.
- [ ] Browser visual check for edge quality remains open.

### T-03 — Save Slot ownership / atomicity gate (highest release priority)
- [x] Read-only catalog confirms candidate RPCs are absent and legacy owner-scoping risk remains in hosted function definitions/policies.
- [x] Product contract in the candidate migration is per-user slots on a shared canonical World; it introduces `(map_id, created_by, slot_number)` uniqueness.
- [x] Ran the reconstructed schema locally in disposable PostgreSQL 17, applying private Save Slots → atomic Save → validated Load in order; validated Load and full-schema Save/Load security/rollback assertions passed.
- [x] Ran full-schema concurrency serialization test and isolated stub-fixture Save Slot assertions/concurrency test; all passed locally.
- [x] Fixed `.github/workflows/map-editor-ci.yml` so the reconstructed full-schema job applies the private Save Slot prerequisite before the atomic RPC migration.
- [ ] Confirm hosted rollout path and deployment coordination; do not apply candidate migrations to production during this audit.
- [ ] After a separately approved deployment, re-check catalog/grants/policies and run authenticated two-user Save/Load tests in a safe non-production environment.

### T-04 — Browser lifecycle and release gate
- [ ] Provide/enable a safe authenticated test environment without production writes.
- [ ] Verify terrain rendering and drag/drop visually.
- [ ] Run two-client stale-save conflict flow and Save→Load→Save through the actual app.
- [ ] Verify the current deployment and CI from authoritative status sources before claiming release readiness.

### T-05 — Terrain runtime integration
- [x] Located and reviewed `ai/application/supabase-runtime-world-adapter.ts`, `runtime-world-adapter.ts`, `npc-navigation.ts`, `npc-movement.ts`, `npc-movement-verification.ts`, `editor/terrain-semantics.ts`, `map-snapshot-v2.ts`, and the durable runtime recovery adapter.
- [x] Confirmed path planning calls the canonical `resolveWaterTraversal` and preserves collision/dynamic obstacle blocks.
- [x] Fixed an execution-time bypass: `executeNpcMovementStep` now rechecks authored water semantics before moving, and authoritative actor swim/transport capabilities are carried into execution and replanning. Regression tests cover deep-sea transport and swimming not bypassing deep-sea requirements.
- [ ] **End-to-end projection still missing:** `createSupabaseRuntimeWorldAdapter` currently constructs only `{ width, height, blocked }` from `vandrith_map_navigation_grid`; it does not project `waterCells`, and `entityFromPlacement` does not populate `canSwim`/`hasWaterTransport`. Thus the new execution guard works when an authored semantic grid is supplied, but the live Supabase runtime adapter does not yet supply that data.
- [x] Reconciled the two V2 envelope definitions: `map-snapshot-v2.ts` is canonical (`vandrith.map-document-v2`); `map-serialization-v2.ts` is now a compatibility facade that emits the canonical format and accepts the earlier `vandrith.map-document`/version-2 alias only on reads. Added regression coverage for canonical emission and alias normalization.
- [x] Wire the authenticated runtime-snapshot RPC into `createSupabaseRuntimeWorldAdapter`: validated V2 `terrainSemantics` now projects into `NavigationGrid.waterCells`; V1 snapshots intentionally supply no invented semantics. Invalid or identity-mismatched V2 snapshots fail closed.
- [x] Added adapter tests for valid water projection and rejection of duplicate semantic coordinates.
- [ ] Define/validate authoritative NPC traversal capability fields from seed/runtime state.
- [ ] Add adapter-level terrain projection, Save→Load→runtime recovery, and deterministic movement tests before changing storage/schema.

## 7.2 Implementation checkpoint — T-05 runtime movement guard

A source audit found that NPC path planning already called `resolveWaterTraversal`, but the execution controller only rechecked collision geometry and adjacency. A stale/forged navigation action could therefore bypass authored water policy if the runtime grid carried water semantics. This was corrected without changing persistence or schema:

- `RuntimeMovementState` now carries optional authoritative `canSwim` and `hasWaterTransport` capabilities.
- `executeNpcMovementStep` revalidates the next authored water cell using the canonical resolver after collision/bounds/adjacency checks; water policy never clears collision blocks.
- The in-memory runtime adapter copies capabilities from authoritative entity state; replanning uses the same capabilities instead of silently reverting to a generic actor.
- Added regression tests: deep ocean requires water transport even for swimmers; an actor with transport can traverse it; missing capability blocks movement.
- Focused movement/navigation/adapter tests passed (**4 files / 46 tests**); focused V2 snapshot/serialization/recovery tests passed (**4 files / 36 tests**); adapter/serialization tests passed (**4 files / 28 tests**); TypeScript typecheck passed. Final full Vitest passed (**175 files / 919 tests**); Next.js production build passed and generated **24 static pages**; `git diff --check` passed.

**Remaining boundary:** the Supabase runtime adapter now reads and validates authored V2 terrain semantics from the authenticated editor snapshot RPC and projects them into `NavigationGrid.waterCells`. However, the active editor Save path is still legacy V1 and does not yet persist V2 terrain semantics end-to-end, and `entityFromPlacement` does not yet source `canSwim`/`hasWaterTransport` from authoritative NPC metadata. So the projection path is covered with adapter tests but is not yet end-to-end production gameplay. No database schema/storage change was made.

## 7.1 Implementation checkpoint — T-01

A narrow code change was applied after the source audit identified the active-layer request gap:

- Added `apps/map-editor/editor/terrain-texture-requests.ts` to collect approved binding IDs from all renderable visible terrain layers.
- Updated `pixi-map-canvas.tsx` to use that collector with the same visibility/group filters used by rendering.
- Added `terrain-texture-requests.test.ts` for a mask-specific binding on a visible non-active layer and for excluding hidden/object/collision layers.
- Added `editor/terrain-asset-region.ts` and `terrain-asset-region.test.ts` to guard source bounds and avoid invalid approved crops; missing/invalid approved texture crops now fall back to local base terrain when available.
- Corrected the local-crop opacity comment to reflect measured partial-alpha edges on sand/tallgrass.
- Verification after final edits: focused tests passed (3 files / 18 tests); typecheck passed; full Vitest passed (175 files / 914 tests); Next.js production build passed and generated 24 static pages; `git diff --check` passed.
- Disposable PostgreSQL 17 verification passed: full reconstructed schema + private Save Slots + atomic Save + validated Load + SQL assertions; full-schema concurrency; isolated stub-fixture assertions and concurrency.
- The three pre-existing user diffs remain present. No commit/push, branch change, production DB write, or deployment occurred.

**Checkpoint status:** T-01/T-02 terrain source/test gates passed locally; Save Slot candidate SQL and migration order pass on disposable PostgreSQL, and the CI workflow order is corrected. T-05 execution-time water guard is implemented and focused-tested, but end-to-end Supabase terrain projection remains open. The release blocker remains: the current preview frontend calls atomic/validated Save Slot RPCs absent from the hosted schema, while legacy cross-user isolation concerns remain in production. No production mutation, deployment, commit, or push was performed. Browser visual verification, safe non-production authenticated integration/rollout, T-04 browser lifecycle, and full T-05 runtime projection remain open. This is not a release-ready claim.


## 2026-10-21 follow-up — Authoritative NPC water-traversal capabilities

- Added optional `traversalCapabilities` (`canSwim`, `hasWaterTransport`) to the existing NPC runtime spawn contract. Both values are strictly boolean when present; old version-1 contracts remain valid and grant no water traversal by default.
- Propagated validated capability values from `npc_seed_catalog.metadata.npcRuntimeContract` into authoritative runtime entity state, and from the same contract into the NPC preview simulation. The Creator package can now include these physical capabilities when constructing a spawn contract.
- Regression tests cover contract validation, legacy behavior, Supabase entity projection, and preview state propagation. Focused tests: 5 files / 38 tests passed; TypeScript typecheck passed; `git diff --check` passed.
- Boundary: this does not prove existing persisted NPC seed records contain these fields, nor that the Creator UI currently persists the spawn contract to Supabase. Missing fields remain land-only. The terrain V2 Save/Load persistence gap and hosted atomic/validated Save Slot RPC rollout gates remain open. No production DB writes, branch changes, commit, push, or deployment.

- Full regression verification after this follow-up: `npm test -- --reporter=dot` passed **175 test files / 920 tests**; `npm run typecheck` passed; `npm run build` passed and generated **24 static pages**; `git diff --check` passed. These are local workspace results, not a GitHub Actions or deployed-browser result.


## 2026-10-22 follow-up — Preview NPC contract propagation

- Fixed `apps/map-editor/app/preview/page.tsx`: the authenticated Preview query now selects `npc_seed_catalog.metadata`, validates `metadata.npcRuntimeContract` with `validatedNpcRuntimeSpawnContract`, and passes the validated contract into `PreviewRuntimeSimulation`. Previously the preview path omitted metadata even though the authoritative runtime adapter consumed it, so stored physical traversal capabilities could not reach preview simulation.
- Focused regression: 5 files / 38 tests passed; TypeScript typecheck passed; full Vitest passed **175 files / 920 tests**; Next.js production build passed and generated all **24 static pages**.
- Remaining boundaries: this is a read/propagation fix, not an NPC Creator persistence UI or proof that existing database seed rows have `traversalCapabilities`. Terrain V2 still is not wired through the active editor Save Slot payload; active Save/Load invokes atomic/validated RPCs that the last read-only hosted catalog audit found absent. No database mutation, deployment, commit, push, or branch change.

## 2026-10-22 follow-up — Terrain V2 through active Save Slot

- Wired `EditorShell`'s actual `MapEditorState` (document + validated terrain semantics) into the World Builder parent, keyed by map identity. The state is only reused for a Save Slot when its document matches the selected canonical document; otherwise the save remains legacy/uninitialized rather than fabricating semantics.
- Extended the existing `vandrith.game-save` v1 envelope with an optional `terrainSemantics: { world, exterior }` section. This intentionally preserves the current atomic RPC's `schema`, `version`, `world`, and `exterior` contract and keeps the World/Exterior documents themselves unchanged. Old v1 and legacy World-only slots remain readable.
- Active Load Slot now validates the optional terrain metadata, adopts it into the editor state history alongside the documents, and restores the same state on remount. Load Latest clears stale in-memory semantics because the current canonical durable reader returns the legacy document envelope only.
- Added round-trip coverage for World + Exterior semantic metadata and rejection of out-of-bounds semantic records. Focused Save Slot parser/client tests passed (3 files / 46 tests); full Vitest passed **175 files / 921 tests**; TypeScript typecheck passed; production build passed and generated **24 static pages**.
- Added `map_editor_validate_terrain_semantics_v1(jsonb,jsonb)` to the candidate migration with execution revoked from app roles; the atomic RPC validates the optional section and returns `INVALID_TERRAIN_SEMANTICS` before any writes when the envelope, bounds, coordinates, surface/features/depth/current, flags, or field set is invalid. Legacy v1 snapshots without metadata remain supported. SQL assertions cover valid metadata persistence, out-of-bounds rejection, duplicate coordinates, invalid surfaces, and unknown fields.

## 2026-10-22 follow-up — SQL Terrain V2 boundary validation

- Validated the candidate RPC and assertions in disposable local PostgreSQL 17 containers only: `atomic-save-slot-assertions.sql` passed, and the reconstructed full-schema Save Slot + validated Load Slot assertion chain passed. No hosted or production database was accessed.
- Remaining verification: hosted RPC/schema availability, authenticated non-production integration, browser Save→Load→Save, and production rollout remain unverified. No commit, push, branch change, or deployment.

## 2026-10-22 follow-up — Six-role verification pass

Six sequential review roles were used for scope/constraints, Save Slot contract, Terrain V2 validation, SQL/CI coverage, build/test verification, and HTTP route smoke checks.

- Focused Save/Load + Terrain V2 regression: **6 files / 70 tests passed**.
- Full Map Editor suite: `npm test` passed **175 test files / 921 tests**.
- `npm run typecheck` passed; `npm run build` passed and generated **24 static pages**.
- `git diff --check` passed.
- Local production-server HTTP smoke check: `/` and `/world-builder` returned HTTP 200; `/preview` returned HTTP 200; `/editor` redirected with HTTP 307 to `/world-builder`, consistent with the current unauthenticated entry path. This was an HTTP smoke test, not browser-driven interaction or authenticated Save→Load→Save E2E.
- The workflow already includes the fixture and reconstructed full-schema PostgreSQL jobs that exercise the Terrain V2 SQL validation assertions. Those SQL checks were previously run successfully in disposable local PostgreSQL 17; no hosted Supabase credentials/session were used in this pass.

Remaining release gates: verify the candidate RPCs exist in a safe hosted non-production schema; run authenticated non-production Save/Load integration; add/execute true browser Save→Load→Save and two-client stale-save E2E; then separately approve any rollout. No production DB writes, commit, push, deployment, or branch change. Existing dirty workspace changes were preserved; the build-generated `tsconfig.tsbuildinfo` diff was removed because it was clean before this verification pass.

## 2026-10-22 follow-up — Terrain V2 validation on Load Slot

The six-role review found a trust-boundary asymmetry: atomic Save validated optional `terrainSemantics`, but the validated Load RPC checked document/version/ownership identity without revalidating that optional section. The client parser rejected malformed metadata, but the server could still return a malformed persisted slot before client parsing.

- Added forward-only candidate migration `20261022150000_map_editor_load_slot_terrain_semantics_v1.sql`; it replaces the validated Load Slot RPC to validate the exact `{world, exterior}` envelope and re-run the canonical Terrain V2 validator for both sections before returning the slot. Legacy snapshots without `terrainSemantics` remain supported.
- Added a full-schema regression that injects out-of-bounds Terrain V2 metadata into a simulated malformed persisted row and asserts Load Slot returns `TERRAIN_SEMANTICS_INVALID` rather than returning the snapshot.
- Updated `.github/workflows/map-editor-ci.yml` to apply the follow-up migration after the existing candidate Load Slot migration and before the SQL assertions.
- Ran the reconstructed full schema in a disposable PostgreSQL 17 Docker container, including bootstrap, reconstructed baseline, private Save Slot, atomic Save, validated Load, the new Terrain V2 Load migration, support functions, validated Load assertions, and full-schema Save/Load assertions: **exit code 0**. The new malformed-Terrain-on-Load regression passed with the full assertion suite. Container was removed by cleanup.
- No hosted Supabase environment, authentication session, production database, browser automation, commit, push, or deployment was used. Hosted non-production integration and browser Save→Load→Save remain open.


## 2026-10-22 follow-up — Fail-closed runtime snapshot envelope

A six-role runtime review found that `createSupabaseRuntimeWorldAdapter` validated V2 snapshots when the RPC returned `{ ok: true, found: true, snapshot }`, but silently treated malformed RPC envelopes (including `ok: false`, invalid `found`, or `found: true` without a snapshot) like a map without authored terrain. That behavior could silently omit water rules instead of failing closed.

- Runtime adapter now requires a well-formed `{ ok: true, found: boolean }` envelope. A valid `{ ok: true, found: false }` remains supported for maps with no authored snapshot yet; it must not include a snapshot payload.
- When `found: true`, a snapshot is mandatory and must parse against the requested map identity. Invalid V2 semantics still fail closed before they are projected into `NavigationGrid.waterCells`.
- Added regression coverage for null/malformed envelopes, `ok: false`, non-boolean `found`, missing snapshot, and unexpected snapshot on `found: false`.
- Focused adapter regression passed: 1 file / 5 tests; TypeScript typecheck passed. Final full Vitest passed **175 files / 922 tests**; `npm run typecheck` passed; `npm run build` passed and generated all **24 static pages**; `git diff --check` passed.
- No hosted database, production writes, branch change, commit, push, or deployment.


## 2026-10-22 follow-up — Strict NPC runtime spawn contract fields

The six-role review continued from RPC boundary hardening into the NPC Creator → runtime contract boundary. The contract validator checked the required booleans for water traversal, but previously tolerated unknown keys on the contract and within `traversalCapabilities`. This could make unsupported fields appear accepted even though runtime code ignores them.

- `validateNpcRuntimeSpawnContract` now rejects unknown top-level fields and unknown traversal capability fields; the only traversal flags accepted are `canSwim` and `hasWaterTransport`.
- Added regressions for forged `canFly` and `debugOverride` fields. Existing v1 contracts without traversal capabilities remain compatible and land-only.
- Focused tests passed: 3 files / 13 tests. TypeScript typecheck passed; final full Vitest passed **175 files / 922 tests** (exit code 0).
- This is validation hardening only; it does not create an NPC persistence API or prove that Creator contracts are already persisted to hosted `npc_seed_catalog` metadata.

## Follow-up: NPC Creator metadata boundary (2026-10-22)

- Added `creatorNpcRuntimeMetadata(...)` as a pure, fail-closed helper. It accepts only a valid Creator NPC package and object-shaped existing metadata, preserves unrelated metadata keys, and serializes the validated `npcRuntimeContract` into the `metadata.npcRuntimeContract` slot already consumed by preview/runtime readers.
- Added a JSON serialize/deserialize round-trip test proving explicit water traversal capabilities and environment policy survive this metadata boundary and are accepted by the runtime contract validator. Invalid Creator input and malformed existing metadata produce no payload.
- **Persistence remains incomplete.** Repository source has a read path for `npc_seed_catalog.metadata`, but no NPC Creator write/upsert path. The reconstructed baseline enables RLS on `npc_seed_catalog` and does not define an application write policy for that table. This pass deliberately does not bypass RLS, introduce service-role writes, or modify any database. A properly authorized persistence mechanism must be designed before claiming Creator → database → runtime integration is complete.
- Validation: focused NPC Creator/runtime tests passed (3 files / 14 tests); full Vitest suite passed (175 files / 924 tests); TypeScript typecheck passed; `git diff --check` passed.

## Follow-up: authenticated NPC Creator contract persistence (2026-10-22)

- Added `npc_creator_runtime_contract_overrides` as a user-owned override table instead of mutating globally shared `npc_seed_catalog.metadata`. Composite ownership key `(seed_key, created_by)`, foreign keys, JSON-object constraint, forced RLS, and owner-only select/insert/update policies isolate user changes.
- Added authenticated `POST /api/npc-runtime-contract`: rejects anonymous/invalid sessions, oversized or malformed JSON, invalid seed keys, and invalid runtime contracts; persists only the authenticated user's row with an upsert. It does not use service-role credentials or touch the production database from this workspace.
- Runtime world loading and `/preview` now read RLS-filtered overrides and prefer a validated owner-scoped contract over shared catalog metadata. Invalid active-seed overrides fail closed instead of silently using stale catalog metadata. Inactive seed overrides are ignored by the runtime.
- Added a runtime adapter regression proving persisted override traversal permissions and environment policy supersede shared catalog metadata. Added disposable PostgreSQL assertions for own-row readback, cross-user isolation, update denial, and owner-id spoof prevention.
- Validation: focused tests passed (3 files / 16 tests); full Vitest suite passed (175 files / 925 tests); TypeScript typecheck passed; Next production build passed (25 static pages); disposable PostgreSQL 17 migration + RLS assertions passed. Hosted Supabase/Auth/browser E2E is not claimed. The current persistence endpoint stores a contract override only for an existing `npc_seed_catalog.seed_key`; it does not yet create a new NPC identity/catalog row.
