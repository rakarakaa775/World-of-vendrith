# Isolated Lifecycle Fixture Audit — 2026-09-09

## Finding

The live schema exposes deterministic NPC seed infrastructure through `npc_seed_catalog`, `npc_seed_entries`, and `npc_seed_runs`. Seed runs explicitly carry `seed_version`, `deterministic`, and `seed_hash` metadata.

The simulation clock is world-scoped through `simulation_clock.world_id`.

However, the current `lives` table does not expose `world_id`. Therefore a world-scoped simulation clock cannot by itself isolate a subset of Lives.

## Consequence

The existing NPC seed mechanism is suitable for deterministic fixture construction, but this audit did not establish a safe database-native transaction or world-isolation mechanism that can be used to run the relationship test without touching the current five-Life dataset.

The correct next step is therefore NOT to execute `execute_social_interaction()` against the live five-Life fixture.

## Safe test strategy

Use one of these paths, in this order of preference:

1. a dedicated Supabase project/branch/database clone for integration testing;
2. a repository-provided test harness that creates disposable data and rolls it back;
3. an explicitly isolated test schema if the project's RLS/functions support it;
4. only after isolation is verified, execute Test A against two fixture Lives.

## Required Test A instrumentation

Capture before/after counts for:

- `relationships`;
- `social_interactions`;
- affected Life state;
- relationship strength/type.

Execute the same logical test interaction twice only if the function's existing idempotency semantics are confirmed; do not assume social interactions themselves are idempotent merely because lifecycle events will be.

## Safety boundary

No production data was changed. This audit intentionally stops before invoking the relationship mutation function.
