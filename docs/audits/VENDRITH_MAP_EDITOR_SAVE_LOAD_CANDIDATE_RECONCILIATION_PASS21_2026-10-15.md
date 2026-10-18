# Vendrith Map Editor — Save/Load Candidate Migration Reconciliation (Pass 21)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Compared the two local candidate migrations against the hosted catalog and migration ledger. The SQL files themselves state they are intentionally not applied by this workflow. All hosted queries were read-only.

## Hosted objects observed
The hosted database has the underlying save-slot/versioning objects:
- `public.map_editor_save_slots`
- `public.map_versions`
- `public.editor_map_identity`
- `public.editor_map_versions`
- `public.maps`

It also has the existing save/load RPCs:
- `map_editor_save_slot_v1(uuid, smallint, text, uuid, integer, jsonb)`
- `map_editor_load_save_slot_v1(uuid, smallint)`
- `claim_vandrith_legacy_save_slots_v1()`

The supporting commit functions referenced by the atomic candidate are also present:
- `map_editor_commit_merge_v1(uuid, integer, jsonb, text)`
- `map_editor_commit_identity_v1(uuid, integer, jsonb, text)`

## Candidate RPCs absent from hosted catalog
Neither new candidate RPC was found in the hosted catalog:
- `map_editor_save_game_slot_atomic_v1(uuid, integer, jsonb, uuid, integer, jsonb, smallint, text, jsonb)`
- `map_editor_load_save_slot_validated_v1(uuid, smallint)`

Their exact filenames/versions are also absent from the hosted migration ledger:
- `20261011220000_map_editor_atomic_game_save_slot_v1.sql`
- `20261012200000_map_editor_load_save_slot_validated_v1.sql`

This confirms the two files remain **unapplied candidates**, while the older save/load pathway remains present. The absence of the candidate RPCs is not evidence that save/load as a whole is absent.

## Contract implications
- The atomic Save Slot candidate attempts to write authoritative World version, optional Exterior version, and slot payload within one RPC transaction. Its implementation depends on the current semantics of `map_editor_commit_merge_v1`, `map_editor_commit_identity_v1`, and the existing slot schema/constraints.
- The validated Load candidate checks the slot-to-version reference, canonical World snapshot identity, World/Exterior consistency, and persisted Exterior identity/version. This is an additional validation boundary not currently represented by that exact function name in hosted catalog.
- Do not apply either file until their SQL has been tested against a disposable database bootstrapped from the correct current schema, and lock ordering, exception behavior, RLS, function privileges, and legacy compatibility are verified. Avoid repairing migration history by hand.

## Next gate
1. Review hosted old save/load RPC definitions and their grants/RLS against both candidate contracts.
2. Verify candidate tests cover concurrent saves, rollback after World version write when Exterior/slot write fails, same-snapshot version reuse, slot owner mismatch, malformed/stale canonical version references, and World/Exterior identity mismatch.
3. Only after the schema/function/privilege comparison is complete should a migration be proposed for application. No production mutation occurred in this pass.

Foundation 11-table specification and ERD remain unchanged.
