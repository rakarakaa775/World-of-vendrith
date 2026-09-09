# Test A — Executable Harness Contract

## Environment variables

The future executable runner must read these values from the process environment and never commit credentials:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_TEST_USER_EMAIL`
- `SUPABASE_TEST_USER_PASSWORD`

## Runner contract

```text
create Supabase client
signInWithPassword(test user)
assert session exists

create disposable life_a
create disposable life_b
link life_a to authenticated user through the approved test setup path

snapshot baseline:
  social_interactions(life_a, life_b)
  active relationships(life_a, life_b)

call execute_social_interaction(
  life_a,
  life_b,
  'socialize',
  fixed test timestamp
)

assert RPC succeeds
assert returned outcome == 'neutral'
assert returned relationship_delta == 2
assert active relationship type == 'acquaintance'
assert active relationship strength == 2
assert exactly one interaction was created

cleanup fixtures
signOut
```

## Negative cases

Run each case in a fresh disposable fixture:

```text
anonymous client
  → execute_social_interaction()
  → expect authentication_required

authenticated client
  + source Life owned by another user
  → expect source_life_not_owned

authenticated client
  + source_life_id == target_life_id
  → expect social_self_target
```

## Isolation requirements

- Never use production user credentials.
- Never reuse production Life IDs.
- Never call internal relationship primitives from the client.
- Never disable RLS or change grants for the test.
- Prefer a disposable database/project; if unavailable, use a separately provisioned non-production environment.
- Cleanup must be attempted in a `finally`/teardown path.

## Current execution blocker

The connected Supabase organization does not permit creating a development branch on the current plan. The existing development branch is `MIGRATIONS_FAILED`. Therefore this contract is intentionally not executed against production.

## Expected baseline

The deterministic baseline assumes no existing active relationship and no `sociability` attribute. The gateway's observed fallback yields zero sociability for both sides, producing the baseline expectation of neutral outcome and relationship delta 2.

This file defines the runner contract; it does not contain real credentials and does not mutate any database.
