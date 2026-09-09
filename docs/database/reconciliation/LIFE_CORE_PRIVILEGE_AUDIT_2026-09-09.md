# Life Core Privilege Audit — 2026-09-09

## Authenticated role

The live database grants `EXECUTE` on the two intended public gateways to `authenticated`:

- `get_life_social_targets(uuid)`
- `execute_social_interaction(uuid, uuid, text, timestamptz)`

No `authenticated` EXECUTE grant was observed for the audited internal primitives:

- `apply_relationship_change(...)`
- `evolve_social_relationship(...)`

The routine security modes observed are:

- `get_life_social_targets` — SECURITY DEFINER
- `execute_social_interaction` — SECURITY DEFINER
- `apply_relationship_change` — SECURITY DEFINER
- `evolve_social_relationship` — SECURITY INVOKER

The table-grant query did not return direct table privileges for `authenticated` on the six audited Life Core tables.

## Interpretation

This supports the intended application boundary: authenticated clients are expected to use the narrow gateway RPCs rather than direct Life Core table access or low-level relationship mutation primitives.

The absence of direct table grants should not be interpreted as proof that every possible database path is inaccessible; RLS and function ownership/security context remain separate controls.

## Test implication

The Test A client must call the public gateway using an authenticated session. It must not call internal primitives directly.

## Safety

Observational audit only. No grants, policies, functions, tables, or data were modified.
