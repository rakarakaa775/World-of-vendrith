# Supabase Migration History Audit — 2026-09-09

## Verified state

The live Supabase project reports a long migration history beginning with the Vandrith foundation/simulation migrations on 2026-08-15 and continuing through map-maker/asset work on 2026-08-31. The history includes the complete social/relationship, event, travel, AI, security, quest, and map systems relevant to the current project.

Examples directly relevant to the lifecycle audit:

- `20260823000049` — `add_social_interaction_engine`
- `20260823000111` — `fix_social_interaction_relationship_creation`
- `20260823000316` — `add_relationship_evolution_policy`
- `20260823000438` — `integrate_relationship_consequences`
- `20260824004204` — `travel_engine_core_lifecycle_v1`
- `20260824084031` — `travel_route_lifecycle_hooks_v1`
- `20260824151304` — `event_execution_claim_idempotency_v1`
- `20260824152147` — `event_failure_atomicity_guard_v1`
- `20260827162948` — `create_user_life_identity_bridge_v1`
- `20260828061811` — `harden_social_rpc_life_ownership`
- `20260828072525` — `lock_relationship_mutation_primitives`
- `20260828080352` — `enable_rls_social_interactions`
- `20260828173158` — `fix_active_relationship_mutation`
- `20260829131436` — `enforce_unique_active_relationship_pair`

The current GitHub `supabase/migrations` directory, however, does not mirror this history; the repository currently exposes only `20260908_inventory_mutation_gateways.sql` there.

## Reconciliation decision

Do not generate a synthetic full-schema migration from the live catalog. The authoritative migration source should be recovered/exported first so the exact historical definitions, ordering, grants, RLS policies, triggers, and function bodies are preserved.

## Lifecycle consequence

The database is substantially more mature than the current GitHub migration tree suggests. In particular, the migration history confirms that Relationship, Event, Travel, ownership security, and idempotency infrastructure were deliberately implemented and hardened.

Therefore the next engineering action is source recovery/reconciliation, not reimplementation of those systems.

## Safety

This audit is documentation only. No production schema or data was modified.
