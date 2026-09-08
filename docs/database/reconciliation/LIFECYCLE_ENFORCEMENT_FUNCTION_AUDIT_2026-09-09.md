# Lifecycle Enforcement Function Audit — 2026-09-09

## Finding

The runtime has substantial function-level enforcement around social relationships, inventory, activities, AI, travel, and simulation.

### Social relationship path

`execute_social_interaction()`:

1. requires authentication;
2. verifies source Life ownership;
3. prevents self-targeting;
4. verifies both Lives exist;
5. computes relationship delta from sociability and current relationship type;
6. records `social_interactions`;
7. creates an acquaintance relationship if none exists;
8. otherwise updates the active relationship through `apply_relationship_change()`;
9. calls `evolve_social_relationship()`.

`evolve_social_relationship()` changes relationship type by strength thresholds:

- strength >= 60 → `friend`
- strength <= -40 → `rival`
- otherwise → `acquaintance`

This proves that relationship creation/evolution is implemented at function level.

### Seed path

`seed_npc_from_catalog()` is idempotent at the seed-key level: if an existing `npc_seed_entries` row has a materialized `life_id`, it returns that Life rather than inserting another Life. It also refreshes the AI profile when an archetype is present.

The seed function initializes identity, AI profile, attributes, needs, skills, optional employment, and seed run/entry records.

### Simulation path

`vandrith_simulation_tick()` advances the simulation clock, dispatches due time events, starts scheduled activities, completes due activities, creates scheduled activities, and reevaluates a bounded AI set after completion.

The AI phase has a hard budget of 10 Lives per tick.

### Inventory path

Inventory aggregate synchronization is trigger-backed through `sync_inventory_aggregate_trigger()` and `refresh_inventory_aggregate_for_container()`.

## Lifecycle gap

Despite the mature function layer, no dedicated functions were found in the current runtime for:

- marriage lifecycle;
- migration in/out;
- newcomer arrival;
- household merge caused by marriage;
- population departure.

Birth has storage (`birth_records`) but no dedicated lifecycle event/function was established by this audit.

## Decision

Do not add generic database constraints or new lifecycle functions yet. The next implementation artifact should be a source-backed lifecycle contract defining the exact state transitions and idempotency rules for these missing population events.

No production data or schema was modified.
