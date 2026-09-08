# NPC Template Implementation Gap — 2026-09-09

## Audit conclusion

The runtime has a concrete seed-driven NPC/Life materialization mechanism, but the uploaded-source search did not recover the referenced `NPC_TEMPLATE_SYSTEM_v0.1` document itself. Therefore the detailed design claims about that document are not re-proven here from source.

## Runtime evidence

The public schema contains:

- `npc_seed_catalog`
- `npc_seed_runs`
- `npc_seed_entries`
- `households`
- `occupations`

`npc_seed_catalog` contains the inputs needed by the current seed mechanism, including identity data, age/sex/race, settlement/location, household key, occupation, fate grade, attributes, needs, skills, schedule, and metadata.

`npc_seed_entries` records the materialized result, including `life_id`, location, household, occupation, attributes, needs, skills, and metadata.

The runtime creation primitive is `seed_npc_from_catalog(seed_key)`.

## What this proves

The current runtime supports deterministic, catalog-driven Life materialization with rich initialization data.

## What this does not prove

It does not prove that the full historical NPC Template System design has been implemented, nor that a 25-NPC stress-test seed exists, nor that a 75-NPC permanent village seed exists.

The current catalog is a small controlled test fixture and should remain so until the stress-test plan is explicitly executed.

## Next implementation checkpoint

Before creating a 25-NPC fixture, verify:

1. household distribution rules;
2. occupation distribution;
3. relationship graph generation;
4. schedule generation;
5. inventory initialization;
6. AI profile/goal initialization;
7. location/settlement assignment;
8. deterministic seed reproducibility;
9. simulation tick behavior at 25 Lives.

No production data or schema was modified by this audit.
