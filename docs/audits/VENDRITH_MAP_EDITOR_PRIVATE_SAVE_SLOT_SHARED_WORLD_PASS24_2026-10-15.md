# Vendrith Map Editor — Private Save Slots on Shared Canonical World (Pass 24)

**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`  
**Decision preserved:** Save Slots are private per user.  
**Environment:** local candidate files + disposable PostgreSQL 17 only.

## Finding

Pass 23 correctly selected private per-user Save Slots but its first candidate implementation incorrectly equated slot ownership with map ownership. The hosted `map_editor_can_access_v1(uuid)` definition grants access when the user owns the map **or** the map is the configured shared canonical World (`map_type = 'world'` and `world_id = 3695d0b0-788e-42fa-9345-cc3197d0c94d`). The live canonical `World Map` row uses that shared-world identifier and has a distinct `created_by` owner.

The initial private-slot candidate therefore risked rejecting authorized non-owner users from Save/Load on the shared canonical World. A shared World may have public/shared canonical history while each user's Save Slot data remains private.

## Candidate changes

1. `supabase/migrations/20261010190000_map_editor_private_save_slots_v1.sql`
   - Preserves `created_by = auth.uid()` as the slot row ownership condition.
   - Uses `map_editor_can_access_v1(map_id)` for map access in SELECT/INSERT/UPDATE/DELETE policies instead of requiring the map row itself to be owned by the slot owner.
   - Keeps the unique key `(map_id, created_by, slot_number)`, allowing different users to have their own Slot 1 on the same shared World.
   - Keeps direct client writes/TRUNCATE revoked and legacy Save/Load RPCs disabled.
2. `supabase/migrations/20261011220000_map_editor_atomic_game_save_slot_v1.sql`
   - Requires an accessible World map, not map ownership; the function still records `created_by = auth.uid()` on the slot.
   - Continues to require ownership of the user's Exterior identity and its parent Region when an Exterior is included.
3. `supabase/migrations/20261012200000_map_editor_load_save_slot_validated_v1.sql`
   - Requires shared-World access through `map_editor_can_access_v1` and filters the slot by `created_by = auth.uid()`.
   - Validates the referenced World version by map ID, version ID, and version number, but does not incorrectly require the shared canonical version row itself to have been authored by the current slot owner.
   - Keeps Exterior identity, parent Region, and Exterior version checks owner-scoped.
4. `supabase/tests/atomic-save-slot-fixture.sql` now models the owner-scoped unique key.
5. `supabase/tests/atomic-save-slot-full-schema-support.sql` seeds the configured shared canonical World ID for the shared-access case.
6. `supabase/tests/atomic-load-slot-validated-assertions.sql` and `supabase/tests/atomic-save-slot-full-schema-assertions.sql` cover cross-author shared World versions, two users saving the same slot number privately, private slot loading, and direct RLS visibility.
7. `.github/workflows/map-editor-ci.yml` now applies the private-slot migration before the atomic Save and validated Load migrations in the disposable full-schema job.

The app's existing slot-list query already reads `map_editor_save_slots` directly and filters by `map_id`; the new RLS policy supplies the owner filter. Save and Load use the candidate RPCs. No app component change was required for this authorization correction.

## Verification — clean disposable PostgreSQL 17

Applied, in order, to a newly created temporary PostgreSQL 17 database:

1. Auth compatibility bootstrap.
2. Reconstructed full schema baseline (with only the unavailable `supabase_vault` extension line omitted, as in CI).
3. Private Save Slot migration.
4. Atomic Save Slot RPC migration.
5. Validated Load Slot RPC migration.
6. Test support/failure-injection helpers.
7. Load Slot validated assertions.
8. Full-schema Save Slot assertions.
9. Full-schema concurrent Save test.

**PASS:** clean candidate migration chain applied successfully. Load and full-schema assertions exited successfully. The suite verifies malformed/stale references, snapshot identity, World + Exterior atomicity, rollback after World/Exterior/slot write failures, private slot ownership, shared canonical World access, and direct RLS visibility. Concurrent saves serialize so exactly one commits and the second returns `VERSION_CONFLICT`.

A separate disposable PostgreSQL 17 stub suite also passed its atomic Save assertions and concurrent-save conflict test after the unique-key fixture update. Existing app contract tests passed **38/38**: 21 game-save contract tests, 8 atomic Save client tests, and 9 validated Load client tests. `git diff --check` passed at the last check before audit-file updates.

## Security interpretation

- Shared canonical World access does **not** imply shared Save Slot access.
- A user's slot rows remain isolated by owner RLS and owner-scoped RPC lookup.
- Users may use the same slot number independently on the shared World.
- The canonical World version history remains shared/authoritative; its version creator need not equal the user who owns a private slot referencing that version.
- Exterior identity remains owner-scoped, so this change does not grant access to another user's Exterior map.

## Remaining gates

- Candidate migrations remain unapplied to hosted Supabase. No hosted database DDL or data was changed.
- Do not repair the hosted migration ledger or apply migrations until the existing migration-stream reconciliation is complete and application is explicitly authorized.
- Authenticated browser/two-client testing against a safe non-production environment remains useful to verify the real UI's slot list and RPC behavior end-to-end.
- No commit, push, deployment, or package installation occurred. AI Roadmap and migration reconciliation remain separate open work. Foundation 11-table specification and ERD remain unchanged.

