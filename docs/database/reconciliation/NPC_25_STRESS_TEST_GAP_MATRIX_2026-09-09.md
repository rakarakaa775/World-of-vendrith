# NPC 25 Stress Test Gap Matrix — 2026-09-09

## Basis

This matrix is based on the live Supabase runtime counts plus the currently available uploaded-source search. The uploaded-source search did not return the historical 25-NPC stress-test document, so no historical requirement is silently inferred beyond the already established project target discussed in the audit trail.

## Current runtime vs 25-NPC fixture readiness

| Component | Current runtime | 25-NPC target | Status |
|---|---:|---:|---|
| Lives | 5 | 25 | GAP — fixture expansion needed |
| NPC seed catalog | 5 | 25 | GAP — seed set needed |
| NPC seed entries | 5 | 25 | GAP — materialization needed |
| Schedules | 5 | 25 | GAP — scales with Life |
| Schedule entries | 35 | expected per seeded schedule | READY primitive |
| AI profiles | 5 | 25 | GAP — scales with Life |
| AI goals | 0 | design-dependent | VERIFY policy |
| Relationships | 0 | graph required for stress coverage | GAP — fixture coverage |
| Family groups | 1 | distribution required | VERIFY fixture design |
| Family memberships | 3 | distribution required | VERIFY fixture design |
| Birth records | 0 | scenario-dependent | NOT REQUIRED for basic 25 seed unless lifecycle test includes birth |
| Inventory aggregates | 5 | 25 or household-based | VERIFY ownership model |
| Inventory entries | 2 | scenario-dependent | VERIFY fixture design |

## Runtime capabilities already available

- deterministic/catalog-driven Life materialization via `seed_npc_from_catalog()`;
- per-Life schedules and schedule entries;
- AI profiles and decision/execution infrastructure;
- relationship storage;
- family groups and memberships;
- birth records;
- inventory/container infrastructure;
- simulation tick and activity completion.

## Missing fixture coverage

The current five-Life fixture does not provide enough coverage for a 25-NPC stress test because it has no relationship rows, no persisted AI goals, only one family group, and only two inventory entries globally.

These are coverage gaps, not automatically implementation defects.

## Proposed acceptance matrix

A future 25-NPC test should verify, at minimum:

1. 25 intended Lives are materialized without duplicates;
2. every Life receives required core components;
3. schedules are created and executable;
4. AI decisions can be reevaluated under simulation ticks;
5. relationships can be represented across multiple Lives;
6. household/family memberships remain internally consistent;
7. inventory ownership can be resolved through containers;
8. the simulation can advance for a meaningful test window without invariant violations;
9. deterministic seed reproduction produces the same intended fixture;
10. no population/lifecycle behavior is accidentally hard-coded into the seed fixture.

## Safety boundary

Do not create the 25-NPC production fixture yet. First define the expected distribution and execute the test in an isolated/test world. Production data remains unchanged.
