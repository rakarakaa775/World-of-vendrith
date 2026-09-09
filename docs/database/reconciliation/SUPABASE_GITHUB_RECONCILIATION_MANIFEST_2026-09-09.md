# Supabase ↔ GitHub Reconciliation Manifest — 2026-09-09

## Scope

This manifest records what is currently verified from the live Supabase runtime versus what is explicitly present in the GitHub migration tree. It is intentionally conservative: missing source is recorded as a gap rather than reconstructed from assumptions.

## Verified runtime capabilities

- Population/Life data exists in Supabase.
- `relationships` exists and currently has zero rows at the time of the lifecycle probe.
- `social_interactions` exists and currently has zero rows at the time of the lifecycle probe.
- `user_lives` exists and is used by authenticated mutation functions.
- `execute_social_interaction()` exists and requires an authenticated `auth.uid()` plus ownership through `user_lives` before mutation.
- `npc_seed_catalog`, `npc_seed_entries`, and `npc_seed_runs` provide deterministic NPC seed infrastructure.
- `simulation_clock` is world-scoped through `world_id`.
- No public Edge Functions were present during the audit.

## Verified GitHub migration source

The migration tree currently exposes `20260908_inventory_mutation_gateways.sql`. Its SQL source is exact and includes authenticated inventory mutation gateways plus grants/revokes.

## Reconciliation gaps

The GitHub migration tree does not currently expose the complete SQL source for the runtime objects listed above. Therefore this manifest does **not** create replacement migrations for them.

Missing exact source must be obtained from an authoritative project snapshot/export before generating migrations.

## Test implication

The lifecycle test harness must not target a fresh database built only from the current GitHub migration directory. That database would not be proven equivalent to the live Vandrith runtime.

Until the migration source is reconciled, lifecycle integration tests remain blocked on a reproducible test database.

## Next authoritative source

Use a Supabase schema/migration export or an exact project checkpoint containing the original migration files. Compare object definitions before committing any generated reconciliation migration.

## Safety

No production schema or data is changed by this manifest.
