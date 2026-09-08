# NPC Schedule / Inventory / Relationship Audit — 2026-09-09

## Schedule

All 5 currently materialized Lives have exactly 1 schedule and 7 schedule entries.

This confirms schedule initialization is present for the current seed fixture.

## Relationships

The current five-Life fixture has no rows in `relationships` involving those Lives.

This means the existing seed fixture does not currently exercise relationship graph initialization.

It should not be treated as proof that relationship creation is missing from the runtime; it only proves the current fixture has no relationship rows.

## Inventory

The runtime contains `inventory_entries` and `inventory_aggregates` plus item/container infrastructure. The current global `inventory_entries` count is 2, and both entries reference a container.

`inventory_entries` does not directly contain `life_id`; ownership is modeled through container/item infrastructure. Therefore inventory ownership for each Life requires a container/ownership join and was not inferred from a direct Life column.

## Stress-test implication

Before creating a 25-NPC stress fixture, explicitly verify:

1. every seeded Life gets the intended schedule;
2. household/container ownership is created correctly;
3. inventory can be resolved back to a Life through its container chain;
4. relationship graph generation is an explicit fixture step rather than an accidental side effect;
5. AI goals remain an explicit policy decision.

## Current readiness

- Schedule initialization: PASS for current 5-seed fixture.
- Relationship fixture coverage: NOT YET TESTED.
- Inventory per-Life ownership: NOT YET VERIFIED.
- 25-NPC stress test: NOT YET RUN.

No production data or schema was modified.
