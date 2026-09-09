# Life Core Schema Reconciliation Manifest — 2026-09-09

## Source of truth

This manifest records the current live Supabase schema observed during the 2026-09-09 reconciliation audit. It is a schema manifest, not an executable migration and must not be treated as historical migration source.

## Core tables

### `public.lives`

- `id uuid NOT NULL DEFAULT gen_random_uuid()`
- `name text NOT NULL`
- `sex text`
- `birth_date timestamptz`
- `death_date timestamptz`
- `status text NOT NULL DEFAULT 'alive'`
- `location_id uuid`
- `household_id uuid`
- `fate_grade text`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`
- RLS enabled; FORCE RLS disabled.

### `public.user_lives`

- `user_id uuid NOT NULL`
- `life_id uuid NOT NULL`
- `created_at timestamptz NOT NULL DEFAULT now()`
- RLS enabled; FORCE RLS disabled.
- Ownership bridge from authenticated user to Life.

### `public.life_attributes`

- `life_id uuid NOT NULL`
- `attribute_type text NOT NULL`
- `value numeric NOT NULL`
- `source text`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`
- RLS enabled; FORCE RLS disabled.

### `public.life_emotions`

- `life_id uuid NOT NULL`
- `emotion_definition_id uuid NOT NULL`
- `intensity numeric NOT NULL DEFAULT 0`
- `updated_at timestamptz NOT NULL DEFAULT now()`
- RLS enabled; FORCE RLS disabled.

### `public.relationships`

- `id uuid NOT NULL DEFAULT gen_random_uuid()`
- `life_a uuid NOT NULL`
- `life_b uuid NOT NULL`
- `relationship_type text NOT NULL`
- `strength numeric NOT NULL DEFAULT 0`
- `status text NOT NULL DEFAULT 'active'`
- `start_time timestamptz`
- `end_time timestamptz`
- RLS enabled; FORCE RLS disabled.

### `public.social_interactions`

- `id uuid NOT NULL DEFAULT gen_random_uuid()`
- `source_life_id uuid NOT NULL`
- `target_life_id uuid NOT NULL`
- `interaction_type text NOT NULL DEFAULT 'socialize'`
- `outcome text NOT NULL`
- `relationship_delta numeric NOT NULL DEFAULT 0`
- `metadata jsonb NOT NULL DEFAULT '{}'`
- `occurred_at timestamptz NOT NULL DEFAULT now()`
- RLS enabled; FORCE RLS disabled.

## Public authenticated gateways

- `get_life_social_targets(uuid)`
- `execute_social_interaction(uuid, uuid, text, timestamptz)`

Both were audited as `SECURITY DEFINER` functions with explicit authentication/ownership controls.

## Reconciliation rule

This manifest describes the current runtime object shape only. It does not recreate historical migration files and must not be used to infer missing SQL bodies, trigger definitions, policy definitions, grants, or migration ordering.

## Test dependency

The Life → Social → Relationship Test A requires a disposable target and authenticated session. The manifest is sufficient to define fixture shape, but does not itself provide Auth credentials or an isolated database.

## Production impact

No schema, data, policy, grant, or function was modified while producing this manifest.
