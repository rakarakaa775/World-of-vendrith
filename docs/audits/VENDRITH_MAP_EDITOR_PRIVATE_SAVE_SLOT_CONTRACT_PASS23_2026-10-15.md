# Vendrith Map Editor — Private Save Slot Contract (Pass 23)
**Date:** 2026-10-15  
**Decision:** Save slots are private per user.  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Decision and contract
The project owner chose **private Save Slots**, not shared slots. A slot belongs to exactly one `created_by` user. A user's slot list, reads, updates, and deletes must not expose another user's row. The current candidate RPCs continue to require an owned World map; allowing per-user saves on a shared canonical World is a separate product/authorization decision and is not silently enabled here.

## Local candidate changes
Created `supabase/migrations/20261010190000_map_editor_private_save_slots_v1.sql` (candidate only; not applied):
- fails closed if any existing slot has no `created_by` owner;
- makes `created_by` NOT NULL;
- replaces unique `(map_id, slot_number)` with unique `(map_id, created_by, slot_number)`;
- removes `map_editor_save_slots_canonical_world_select`, which exposed canonical-World slots beyond their owner;
- replaces SELECT/INSERT/UPDATE/DELETE policies with owner-scoped policies tied to an owned map;
- removes direct anon access and authenticated direct write/TRUNCATE privileges, retaining authenticated SELECT under RLS.

The private-slot candidate also disables the two legacy Save/Load RPC entry points because their slot lookup/upsert does not filter by owner.

Updated `supabase/migrations/20261011220000_map_editor_atomic_game_save_slot_v1.sql` to upsert on `(map_id, created_by, slot_number)`, matching the new unique key. The validated Load candidate already filters slots and versions by `created_by`.

Migration order is intentional: private-slot migration timestamp precedes the atomic Save candidate. Both remain local candidates; neither has been applied to hosted Supabase.

## Disposable PostgreSQL 17 regression result
Applied the private-slot migration to a temporary PostgreSQL 17 fixture with two users, two owned maps and one slot per user. Assertions passed:
1. user A sees only A's slot;
2. user B sees only B's slot;
3. the canonical-World visibility policy is removed;
4. authenticated direct INSERT and TRUNCATE privileges are absent;
5. legacy Save and Load RPCs are no longer executable by authenticated clients.

Result: **PASS**. The test used a minimal schema/role fixture and validates migration policy/privilege behavior, not the complete hosted application or atomic Save/Load transaction. The temporary container and fixture file were removed.

## Remaining checks before application
1. Run the candidate migration chain against a disposable database bootstrapped from the correct complete current schema, including the atomic Save and validated Load RPCs.
2. Verify app/UI Save, Load, and slot-list flows use only the new owner-scoped RPCs and direct RLS SELECT.
3. Test rollback and concurrency for World + Exterior + slot writes.
4. Decide explicitly whether a non-owner can save private slots against the shared canonical World. Current candidate Save/Load RPCs require `maps.created_by = auth.uid()`.
5. Do not apply to production, repair migration history, commit, push, or deploy until these gates are complete.

No hosted state was changed. Foundation 11-table specification and ERD remain unchanged.

## Application contract tests
Ran the existing focused client/contract tests after the migration changes:
- `game-save.contract.test.ts`: 21 passed
- `game-save-slot-atomic-client.test.ts`: 8 passed
- `game-load-slot-validated-client.test.ts`: 9 passed
**Total: 38/38 passed.** These verify current client/contract behavior; they do not replace the missing full SQL migration-chain integration test.

## Pass 24 superseding correction — shared canonical World

The final open questions in this Pass 23 report are superseded by `VENDRITH_MAP_EDITOR_PRIVATE_SAVE_SLOT_SHARED_WORLD_PASS24_2026-10-15.md`. The private-slot contract remains unchanged, but a slot owner does **not** need to own the World map when that map is the authorized shared canonical World. Candidate RLS and Save/Load RPCs now use `map_editor_can_access_v1` for map access and keep slot rows scoped by `created_by`. The candidate chain and updated shared-World tests passed on a clean disposable PostgreSQL 17 database; hosted Supabase remains unchanged.
