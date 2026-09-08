# Reconciliation SQL Manifest

Updated: 2026-09-09

This manifest classifies SQL records under `database/reconciliation/`. They are runtime reconciliation records, not automatically part of the Supabase migration chain.

| File | Classification | Replay status |
|---|---|---|
| DUNGEON_MUTATION_AUTHORITY_HARDENING_2026-09-07.sql | Runtime privilege/authority patch record | Verify signatures/runtime before replay |
| DUNGEON_NAVIGATION_PATHFINDING_HARDENING_2026-09-07.sql | Runtime privilege/authority patch record | Verify signatures/runtime before replay |
| DUNGEON_VALIDATOR_AUTHORITY_HARDENING_2026-09-07.sql | Runtime privilege/authority patch record | Verify signatures/runtime before replay |

The paired markdown records provide the context for each patch. These files are intentionally kept out of `supabase/migrations/` because the repository is not a complete mirror of the live Supabase migration history.

## Exact migration source currently captured

`supabase/migrations/20260908_inventory_mutation_gateways.sql` is the exact Inventory gateway source captured during the audit session and is the only current file in the repository's Supabase migration directory.

## Safety rule

Never promote a reconciliation SQL file into the migration chain merely by moving or renaming it. First establish its exact migration identity, ordering, dependency state, and replay behavior.
