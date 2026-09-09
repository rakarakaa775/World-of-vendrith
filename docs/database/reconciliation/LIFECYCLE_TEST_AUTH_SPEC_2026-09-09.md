# Lifecycle Test — Authenticated Fixture Specification

## Objective

Define the exact authenticated fixture required to execute Test A against the existing `execute_social_interaction()` implementation without weakening production security.

## Verified preconditions

The live function requires `auth.uid()` to be non-null and requires the source Life to be owned by that authenticated user through `public.user_lives`.

The function rejects:

- unauthenticated execution (`authentication_required`)
- a source Life not owned by the authenticated user (`source_life_not_owned`)
- source and target being the same Life (`social_self_target`)
- missing source or target Lives

## Fixture contract

The test environment must provide:

1. A dedicated Supabase Auth test user.
2. Two disposable Life records, `life_a` and `life_b`.
3. An ownership row `(test_user, life_a)` in `user_lives`.
4. Valid `sociability` attributes for both fixture Lives, if the existing Life contract requires them.
5. No production Life IDs.

The target Life does not need to be owned by the test user unless another RLS or application contract explicitly requires it; this must be verified before execution.

## Execution contract

Run `execute_social_interaction(life_a, life_b, 'socialize', test_timestamp)` using a real authenticated Supabase session for the dedicated test user.

Capture:

- returned `interaction_id`
- returned `outcome`
- returned `relationship_delta`
- returned `relationship_strength`
- count of matching `social_interactions` before/after
- count of active matching `relationships` before/after

## Cleanup contract

All fixture rows must be removed after the test, preferably by destroying the disposable test environment. If row cleanup is used, it must be performed by an authorized test-only mechanism and verified by before/after counts.

## Safety boundary

Do not alter `execute_social_interaction()`, RLS, `SECURITY DEFINER`, `auth.uid()`, or ownership checks to make the test pass.

Do not insert fixture data into the production five-Life population.

## Current status

The specification is complete. Executable Test A remains blocked until an authenticated test client/session and disposable database target are available.
