# 5-Life Implementation Readiness Matrix — 2026-09-09

## Purpose

Map the six 5-Life lifecycle tests to functions that actually exist in the live runtime. This is a capability audit only; no lifecycle test was executed and no production state was changed.

| Test | Existing primitive | Readiness | Gap |
|---|---|---|---|
| A Relationship prerequisite | `execute_social_interaction`, `apply_relationship_change`, `evolve_social_relationship` | READY for isolated relationship test | Marriage semantics are separate |
| B Newcomer / Migration In | `plan_travel_from_route`, `start_travel`, `complete_travel`, `schedule_travel_arrival` | PARTIAL | No dedicated population-residency/admission consequence found |
| C Migration Out | travel functions + location infrastructure | PARTIAL | No dedicated residence/household departure function found |
| D Marriage | relationship functions + family/household tables | NOT READY | No dedicated marriage function found |
| E Birth | `birth_records` storage + Life seed primitive | NOT READY | No dedicated birth lifecycle function found |
| F Terminal departure/death | Life/status storage + activity cancellation primitives | PARTIAL | No dedicated population departure/death orchestrator found |
| G Simulation continuation | `vandrith_simulation_tick` + activity/AI functions | READY as smoke-test primitive | Depends on successful lifecycle state transition |

## Important distinction

Travel is implemented, but travel is not automatically equivalent to population migration. A travel arrival changes travel state and records travel history; migration additionally requires residence, household/family, and population-history consequences.

Likewise, relationship evolution is implemented, but marriage is a higher-level lifecycle transition involving family and potentially household/residence changes.

## Recommended implementation order

1. Run/validate Test A using the existing social interaction primitive in an isolated world.
2. Add a narrowly scoped migration-in/out consequence layer over the existing travel primitives.
3. Add marriage consequence orchestration over relationship + family + household primitives.
4. Add birth consequence orchestration over Life seed + birth records + family/household.
5. Add terminal departure/death orchestration.
6. Run simulation continuation smoke tests.
7. Scale to 25 Lives only after all required tests pass.

## Safety

No production data, schema, event definitions, or lifecycle functions were modified by this audit.
