# Population Automation Status — 2026-09-09

## Investigation

The runtime was checked for population, resident, migration, and spawn routines/tables.

## Confirmed

The only population-adjacent persistent tables found are:

- `npc_seed_catalog`
- `npc_seed_runs`
- `npc_seed_entries`

The only matching creation routine found is:

- `seed_npc_from_catalog(p_seed_key text) → uuid`

No runtime routine was found with a population/resident/migration/spawn naming pattern that implements a Village population target or automatic population scaling.

## Seed system role

The seed system is a deterministic materialization mechanism. `npc_seed_entries` records the materialized Life, location, occupation, and optional household for a seed run. It therefore provides a foundation for creating controlled test populations.

It does **not** currently prove an automatic rule such as “maintain 75–100 Life per Village”.

## Project population design

The intended Village model is:

- initial population target around 100 Life;
- normal Village population can be around 75 or more/less;
- population changes dynamically;
- newcomers can arrive, including merchants and people moving for relationships/marriage;
- residents can leave or migrate elsewhere.

These are project design requirements, not claims about currently implemented runtime automation.

## Architectural gap identified

There is currently no verified runtime population manager/scaler connecting:

`Village population target → NPC seed selection/materialization → resident lifecycle → migration in/out`

That should be treated as a **future simulation layer**, not silently added during schema reconciliation.

## Recommended implementation boundary

Keep `seed_npc_from_catalog` as the low-level deterministic Life creation primitive. If/when the population manager is implemented, it should orchestrate this primitive rather than duplicate Life initialization logic.

The population manager should eventually be responsible for policy such as target/min/max population, newcomer composition, migration events, and replenishment—not for rebuilding the Life initialization internals.

## Production changes

None.
