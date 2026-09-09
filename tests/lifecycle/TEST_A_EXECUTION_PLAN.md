# Test A — Execution Plan

## Purpose

Turn the verified lifecycle gateway contract into a black-box authenticated integration test without changing production security.

## Preconditions

- Dedicated Auth test user/session is available.
- Disposable database target is available.
- `SUPABASE_TEST_URL` and `SUPABASE_TEST_ANON_KEY` are supplied through environment variables.
- No production Life IDs are used as fixtures.

## Positive path

1. Authenticate as the dedicated test user.
2. Create two disposable Lives: `life_a` and `life_b`.
3. Insert only the ownership relation for `life_a` into `user_lives` using an authorized test-only setup path.
4. Ensure both Lives satisfy the existing Life/attribute contract needed by the social gateway.
5. Snapshot matching `social_interactions` and active `relationships` counts.
6. Call `execute_social_interaction(life_a, life_b, 'socialize', test_timestamp)` through the authenticated client.
7. Assert a successful RPC result.
8. Assert the expected new/updated social interaction and relationship state.
9. Cleanup the fixture or destroy the disposable target.

## Negative paths

- No session → expect `authentication_required`.
- Authenticated user but unowned source → expect `source_life_not_owned`.
- Source equals target → expect `social_self_target`.

## Non-goals

This test does not prove that social interaction itself is idempotent. Lifecycle-event idempotency is a separate test contract.

## Production safety

The test must not change RLS, grants, `SECURITY DEFINER`, RPC bodies, or production fixture data.
