# NPC Seed Component Integrity — 2026-09-09

## Scope

Audit of the five currently materialized NPC/Life seed results against the major Life components required by the current runtime.

## Result

All 5 seeded Lives have:

- exactly 1 `life_identity` row;
- exactly 8 `life_attributes` rows;
- exactly 3 `life_skills` rows for four adults and 2 for the child seed;
- exactly 4 `life_needs` rows;
- exactly 1 `life_energy` row;
- exactly 1 `life_ai_profiles` row.

No seeded Life is missing its core identity, attribute, need, energy, or AI profile record.

## Current fixture observations

- Aldren Vale: Village, household assigned, alive.
- Elira Vale: Village, household assigned, alive.
- Tomas Vale: Village, household assigned, alive.
- Bram Stone: Village, no household assignment, alive.
- Mira Ashwood: Forest, no household assignment, alive.

The existing fixture therefore already exercises both a household resident pattern and a non-household Life.

## Important gap

All five currently have `0` AI goals. This means the presence of an AI profile does not imply that goal initialization is populated in the current fixture.

This should be treated as a fixture/design question, not automatically as a runtime defect: some AI archetypes may legitimately operate without explicit persisted goals, but that rule is not established by this audit.

## 25-NPC readiness

The seed primitive can create a reasonably complete Life record, but a 25-NPC stress fixture should not be generated until its distribution rules are defined and verified. In particular, household assignment, occupation distribution, relationships, schedules, inventory, and AI goals need explicit expectations.

## Production changes

None.
