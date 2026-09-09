# Test A — Baseline Deterministic Case

## Fixture

- Dedicated authenticated test user: required, created outside repository and supplied through environment variables.
- `life_a`: disposable Life owned by the test user through `user_lives`.
- `life_b`: disposable Life not used by production data.
- No initial active relationship between `life_a` and `life_b`.
- No `sociability` attribute is required for the baseline because the gateway falls back to zero when it is absent.

## Call

Invoke the public authenticated RPC `execute_social_interaction(life_a, life_b, 'socialize', test_timestamp)` using the authenticated client session.

## Expected baseline

With both sociability values absent/zero and no pre-existing active relationship, the expected baseline is:

- successful RPC response;
- `outcome = neutral`;
- `relationship_delta = 2`;
- one resulting active relationship of type `acquaintance`;
- relationship strength starts at `2`;
- one `social_interactions` record for the call.

The exact returned JSON shape must be asserted against the live function result rather than guessed by the test harness.

## Negative controls

The same harness should separately assert:

- anonymous call → `authentication_required`;
- authenticated call with unowned `life_a` → `source_life_not_owned`;
- `life_a = life_b` → `social_self_target`.

## Isolation

All IDs are generated at runtime. The fixture must be destroyed after execution. No production Life, user, relationship, or interaction row may be reused.

## Current status

Specification locked. Execution remains pending until an authenticated test session and disposable healthy database target are available.
