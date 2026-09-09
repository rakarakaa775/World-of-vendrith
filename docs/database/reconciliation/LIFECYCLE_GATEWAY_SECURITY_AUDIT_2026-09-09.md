# Lifecycle Gateway Security Audit — 2026-09-09

## Scope

Static/runtime audit of the two public authenticated Life→Social gateway functions: `get_life_social_targets()` and `execute_social_interaction()`.

## Verified boundary

Both gateways are `SECURITY DEFINER` functions with an empty `search_path` and are executable by the `authenticated` role.

`get_life_social_targets()` requires the supplied source Life to have a `user_lives` ownership row for `auth.uid()` before candidate selection occurs.

`execute_social_interaction()` requires an authenticated `auth.uid()`, verifies source ownership through `user_lives`, rejects self-targeting, validates source/target existence, and delegates relationship mutation to internal primitives that are not executable by `authenticated`.

## Internal primitive isolation

The audited relationship/social mutation primitives are not executable by `authenticated`. This preserves the intended gateway boundary: clients invoke the public gateway rather than low-level mutation functions.

## RLS observation

`lives`, `user_lives`, `relationships`, and `social_interactions` have RLS enabled and no table policies were found during this audit. This is recorded as a design-review item, not automatically classified as a vulnerability, because the application exposes narrow authenticated gateways and function-level authorization is explicit.

## Test limitation

This audit proves the function definitions and privilege boundary from the live database, but does not constitute a black-box authenticated session test. Such a test still requires a dedicated authenticated test client and disposable test target.

## Decision

Do not change RLS, grants, `SECURITY DEFINER`, or ownership checks solely to make the lifecycle test executable.

## Production impact

No production data, schema, RLS policy, or function permission was changed by this audit.
