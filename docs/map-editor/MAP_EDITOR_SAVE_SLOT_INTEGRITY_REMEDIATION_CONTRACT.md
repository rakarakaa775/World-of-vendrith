# Save Slot Integrity Remediation Contract

Status: design and regression coverage only. No production RPC or database changes have been applied.

## Verified live state — 2026-10-10

Read-only inspection of the deployed `map_editor_save_slot_v1` and `map_editor_load_save_slot_v1` definitions confirmed that the RPCs do not validate the relationship between the slot snapshot and its referenced immutable world version.

An aggregate, schema-aware inspection of the three existing Save Slot rows found:

- Slots 1 and 2 use `vandrith.game-save` version 1.
- Slot 3 uses the legacy `vandrith.map-document` version 1 envelope and represents a World-only save.
- For all three slots, the embedded World Map document equals the referenced `map_versions.snapshot.document`; world identity, map type, and version-envelope shape are valid.
- No existing slot was updated. The legacy slot remains supported by the current frontend fallback.

A schema-agnostic query initially flagged the legacy row because it has no top-level `world` field. That was a false positive; comparisons must dispatch by the snapshot schema.

## Canonical invariant

For every slot, its version reference must resolve to the same `map_id` and `version_number`, and the referenced version snapshot must be a canonical `vandrith.map-document` version 1 envelope containing a World Map document.

Supported slot snapshot formats on load:

1. Current `vandrith.game-save` version 1: `world` must be a World Map whose ID equals the slot map ID; `exterior` must be null or an exterior playable map. The embedded `world` document must be structurally equal to the referenced version's `document`.
2. Legacy `vandrith.map-document` version 1: `document` must be the World Map with the correct identity and type, and it must be structurally equal to the referenced version's `document`. This format restores no exterior and must not synthesize one.

Future Save Slot writes should accept only the current Game Save v1 envelope. This prevents new legacy-shaped writes while retaining compatibility for existing legacy rows.

## RPC hardening requirements

A separately reviewed migration should:

- Keep `SECURITY DEFINER`, the fixed `search_path`, authentication, `map_editor_can_access_v1`, World Map type checks, and authenticated-only grants.
- Reject unsupported/malformed snapshots before writing.
- Check the world ID/type and exterior type/space.
- Resolve the exact referenced version row and validate its canonical envelope.
- Reject writes when the embedded world differs from the referenced version document.
- On load, dispatch by schema, validate the version reference, preserve legacy World-only loads, and fail closed on unsupported snapshots or mismatches.
- Return stable error codes rather than partial snapshot payloads.
- Never rewrite existing slot rows as part of the RPC migration.

## Required verification before applying SQL

- Unit tests for current Game Save v1 and legacy map-document v1 parsing, authoritative identity mismatch, unsupported versions, wrong map type, invalid exterior, and atomic rejection.
- Database-level tests for valid current saves, valid legacy loads, missing version references, wrong map/version pair, mismatched embedded world, malformed version envelope, unsupported slot schema, invalid world identity/type, and invalid exterior type/space.
- Full Map Editor Vitest suite, TypeScript typecheck, and production build on the exact feature-branch commit.
- Review the migration against the actual deployed function definition and ensure existing rows pass schema-aware validation.
- Apply only through a separately approved migration after the above gates; no ad-hoc SQL update or bulk rewrite of slot data.
- After application, verify the deployed function definitions and run read-only integrity counts again.

## Current implementation boundary

`parseGameSaveSlotSnapshot` is the pure frontend dispatch boundary and is used by the active Load Slot handler. It accepts the two supported formats, validates authoritative world identity/type and exterior type/space, and rejects unsupported formats before editor state adoption.

The helper's regression tests have been committed but have not yet been executed in this environment. The migration remains a required future step; this document does not authorize production changes.

## Follow-up verification — 2026-10-10

A second read-only production audit rechecked all current slots and the deployed function execution boundary. Results:

- All 3 rows resolve to a `map_versions` row with matching `id`, `map_id`, and `version_number`.
- All referenced version snapshots use the canonical `vandrith.map-document` v1 envelope with an object-valued `document`.
- The schema-dispatched World document equals the referenced version's `snapshot.document` for every row.
- Every embedded World ID equals the slot's authoritative `map_id`; the embedded World and authoritative map are both type `world`; slot owner and map owner match.
- The current RPCs are `SECURITY DEFINER` with `search_path=public, pg_temp`; `anon` cannot execute either RPC and `authenticated` can. Preserve these existing grants and access helper behavior when replacing function bodies; do not widen execution grants.
- `map_editor_save_slots.version_id` is nullable and its foreign key uses `ON DELETE SET NULL`. The future load RPC must therefore fail closed with a stable error code when a slot has no resolvable version; it must not silently return a snapshot that can no longer be tied to a canonical version.

The checks above were read-only. No slot row, RPC, grant, or migration history was changed.

## RPC implementation requirements (pre-migration checklist)

### Save RPC

Keep the existing signature and response envelope. Validate in this order before any insert/upsert:

1. Require `auth.uid()`; retain slot range 1–12 and `map_editor_can_access_v1(p_map_id)` checks.
2. Require `p_snapshot` to be a JSON object with schema `vandrith.game-save`, numeric version `1`, and both `world` and `exterior` keys. New writes must not create legacy map-document slots.
3. Require `world` to be an object with the authoritative `id = p_map_id::text` and `mapType = 'world'`.
4. Require `exterior` to be JSON null or an object whose `mapType = 'playable'` and whose `playableSpace` is `exterior` or absent (the frontend's documented default). Reject an interior playable map.
5. Resolve one canonical `map_versions` row by all of `id = p_version_id`, `map_id = p_map_id`, and `version_number = p_version_number`; retain current access constraints. The version snapshot must be an object with schema `vandrith.map-document`, version `1`, and object-valued `document` whose `id = p_map_id::text` and `mapType = 'world'`.
6. Require JSONB structural equality: `p_snapshot->'world' = version_snapshot->'document'`. A mismatch returns a stable validation error and must not insert or update the slot.
7. Only after all validation passes may the existing atomic upsert run.

### Load RPC

1. Keep authentication, `map_editor_can_access_v1`, authoritative map type, and existing execution grants.
2. Return a stable `VERSION_REFERENCE_INVALID` (or an equivalently documented code) when `version_id` is null, the reference is missing, or its map/version tuple is inconsistent.
3. Validate the referenced canonical version envelope before trusting it.
4. Dispatch the stored snapshot by schema. Accept current Game Save v1 only when its envelope is complete and its World is valid; accept legacy map-document v1 as World-only for backward compatibility. Do not invent an Exterior for legacy rows.
5. For both formats, compare the extracted World document structurally to the referenced version's `document`, and verify its ID and type against the authoritative map. Fail closed on unknown schemas, unsupported versions, malformed payloads, or mismatches.
6. Do not rewrite existing slots as a side effect of load. The legacy slot remains unchanged until a user explicitly saves it in the current format.

## Required database-level regression matrix

Run these in an isolated database/test transaction with authenticated identities and fixture maps/versions; never use production Save Slots as negative-test fixtures.

| Case | Save RPC | Load RPC |
| --- | --- | --- |
| Current Game Save v1; matching World/version; Exterior null | Accept | Accept |
| Current Game Save v1; valid exterior playable map | Accept | Accept |
| Legacy map-document v1 | Reject new write | Accept World-only when matching version |
| Missing `world` or `exterior` key | Reject | Reject current envelope |
| Unsupported schema or version | Reject | Reject |
| World ID differs from authoritative map | Reject | Reject |
| World map type is not `world` | Reject | Reject |
| Exterior map type is not `playable` | Reject | Reject |
| Exterior has `playableSpace = interior` | Reject | Reject |
| Missing, null, or wrong version reference/tuple | Reject | Reject |
| Referenced version snapshot is not canonical map-document v1 | Reject | Reject |
| Referenced version's document is not a World Map | Reject | Reject |
| Embedded World differs from version document | Reject without upsert | Reject without mutation |
| Unauthenticated caller / inaccessible map | Preserve denial | Preserve denial |
| Valid legacy slot fixture | N/A | Load succeeds without changing stored row |

For rejected writes, assert both the returned error code and that the previous slot's snapshot, version reference, and update timestamp remain unchanged. For rejected loads, assert the error is stable and no database row is mutated. Also verify `anon` cannot execute either function and `authenticated` can execute only through the intended RPC path.

## Release gates

- [ ] Migration is created using the Supabase CLI's migration workflow and reviewed as a new, separate migration.
- [ ] SQL/function tests pass against an isolated database with the current production schema.
- [ ] Existing three production slots pass a final read-only preflight.
- [ ] Typecheck, Next.js build, and full Vitest suite pass on the exact migration commit.
- [ ] Security review confirms no grant widening, unchanged access helper, pinned `search_path`, and no accidental production data rewrite.
- [ ] Explicit production approval is recorded before applying the migration.
- [ ] After approval and apply, verify function definitions/grants and rerun the read-only integrity query.

Until all gates pass, production RPC and database changes remain prohibited.

## Implementation delta — 2026-10-12

The following zero-cost, non-production checks are now implemented on `feat/vendrith-ecc-v1`:

- Candidate atomic Save Slot RPC rejects a supplied Exterior whose declared `playableSpace` is `interior`; omission remains compatible with the current document default.
- The isolated fixture and reconstructed full-schema PostgreSQL suites assert that rejecting an Interior-as-Exterior request leaves World versions, Exterior versions, and the slot row unchanged.
- The candidate validated Load Slot RPC has regression coverage for an Exterior that declares `playableSpace: interior`.
- The active client-side Game Save parser rejects an Exterior whose map ID equals the authoritative World ID; a Vitest regression covers the case.
- The first run exposed malformed dollar-quote delimiters in the newly added SQL blocks; the tests were corrected to use named delimiters. Final CI run [38161197872](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38161197872) passed all three jobs on commit `3861b0e136a1e885123f5ee03eabd0617b5c05b3`, including typecheck, build, 854 Vitest tests, both SQL assertion suites, and reconstructed full-schema integration/concurrency. This run also validates the additional client preparation checks for World/Exterior identity and type.

These changes improve validation but do **not** close the release gates below. The two candidate RPCs remain unapplied to hosted Supabase, and the active UI still uses the legacy multi-RPC Save path and existing Load RPC plus client-side canonical version comparison. No hosted DB, paid Supabase branch, or new Git branch has been created. Do not wire the candidate RPCs into the active UI until hosted non-production authenticated integration and browser/session round-trip checks can be performed safely.



## Round-trip regression verification — 2026-10-12

The Save → Load → Save contract test now exercises map adoption as well as serialization:

- Loading a combined slot removes stale World and Exterior maps from the editor's open-map list.
- Unrelated Region maps are retained.
- The loaded authoritative World and Exterior are serialized again and parsed back with their content preserved.
- A separate legacy World-only reconciliation test confirms stale Exterior maps are removed and no Exterior is fabricated, while Region and Interior documents remain available.

GitHub Actions run [38186234611](https://github.com/rakarakaa775/World-of-vendrith/actions/runs/38186234611) passed all three jobs on commit `13eee66a758fda1f764808f4ba5757314685947b`: Map Editor typecheck, Next.js build and Vitest; isolated PostgreSQL fixture contract tests; and reconstructed full-schema candidate RPC integration/concurrency checks.

This is automated CI evidence, not authenticated hosted integration or browser/session E2E. The active UI remains on the legacy Save/Load RPC path. Candidate atomic-save and validated-load migrations are not applied to hosted Supabase and must not be wired into the active UI until the non-production authenticated integration and browser/session gates can be completed safely. No production database changes or paid Supabase branch were used.
