# Test A — Negative Security Contract

## Purpose

Validate the public `execute_social_interaction()` gateway's authentication, ownership, and self-target boundaries without calling internal relationship primitives from the client.

## Case N1 — Anonymous caller

### Setup
- Use the publishable/anon client without an authenticated session.
- Use disposable Life IDs that exist only in a non-production test target.

### Action
Call `execute_social_interaction(source_life_id, target_life_id, 'socialize', occurred_at)`.

### Expected
The gateway rejects the call with the authentication-required error path.

### Safety assertion
No interaction or relationship mutation is created.

## Case N2 — Source Life not owned by authenticated caller

### Setup
- Authenticate as test user B.
- Use a disposable source Life owned by test user A.
- Use a disposable target Life.

### Action
Call the public `execute_social_interaction()` gateway as user B with A's Life as source.

### Expected
The gateway rejects the request with `source_life_not_owned`.

### Safety assertion
No interaction or relationship mutation is created.

## Case N3 — Self target

### Setup
- Authenticate as a test user who owns the disposable source Life.
- Use the same Life ID as both source and target.

### Action
Call the public `execute_social_interaction()` gateway.

### Expected
The gateway rejects the request with `social_self_target`.

### Safety assertion
No interaction or relationship mutation is created.

## Execution boundary

All three cases must execute against a non-production target. The production project `ojtmfokjcirvjvhnbnos.supabase.co` is prohibited.

The test client must call only the public gateway. `apply_relationship_change()` and `evolve_social_relationship()` are internal database primitives and are not valid client test entry points.

## Pass criteria

A negative case passes only when:

1. the expected error path is returned;
2. no unexpected interaction row is created;
3. no relationship mutation is created; and
4. teardown completes successfully.

## Current status

Contract locked from the live Supabase function validation. Execution remains blocked until a healthy non-production environment is available.
