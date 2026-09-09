# Migration Drift Finding — 2026-09-09

## Finding

The live Supabase project contains the full migration history from the Vandrith foundation through Life/AI, Social/Relationship, Event, Travel, security hardening, Quest, Map Maker, and asset systems. The current GitHub migration directory exposes only the inventory mutation gateway migration.

## Development branch state

The Supabase development branch is reported as `MIGRATIONS_FAILED`. A rebase against production was attempted and returned success, but the branch subsequently remained `MIGRATIONS_FAILED`.

## Diagnostic limitation

The available Supabase branch tooling exposes branch status and migration history, but does not expose the failed migration's execution error/log in this session. The migration list from the production project is healthy and includes the expected historical sequence; therefore the exact failing branch migration cannot be identified from the available evidence.

## Decision

Do not reset or recreate the branch yet. Do not apply synthetic historical migrations to production. Recover the authoritative SQL source first, then repair repository parity. Only after a disposable branch can be proven healthy should Lifecycle Test A use it.

## Relevant lifecycle migration sequence

- 20260822080220 — add_life_identity_and_seed_race
- 20260822080418 — add_life_ai_profiles
- 20260822235908 — add_social_target_selection
- 20260823000049 — add_social_interaction_engine
- 20260823000111 — fix_social_interaction_relationship_creation
- 20260823000316 — add_relationship_evolution_policy
- 20260823000438 — integrate_relationship_consequences
- 20260823000635 — social_relationship_feedback_outcomes
- 20260823000838 — add_social_memory_summary_v2
- 20260823001037 — integrate_social_memory_into_target_scoring_v2
- 20260827162948 — create_user_life_identity_bridge_v1
- 20260827163135 — enable_private_life_core_rls_v1
- 20260828061811 — harden_social_rpc_life_ownership
- 20260828072525 — lock_relationship_mutation_primitives
- 20260828080352 — enable_rls_social_interactions
- 20260828173158 — fix_active_relationship_mutation
- 20260829131436 — enforce_unique_active_relationship_pair

## Safety

No production data, schema, function, RLS policy, or grant was changed by this finding.
