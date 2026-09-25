---
applyTo: "supabase/**/*,database/**/*,apps/map-editor/**/*.{ts,tsx}"
---

# Vendrith Supabase instructions

Before changing Supabase integration, inspect the repository Supabase skill, schema/migrations, RPC contracts, persistence tests, and relevant Map Editor domain contracts.

## Trust boundary
- Treat Supabase as a persistence and authorization boundary, not as the canonical in-memory editor model.
- Validate data returned from RPCs before it enters domain state.
- Never trust client-provided map IDs, slot numbers, version metadata, or serialized snapshots without contract validation.
- Keep authoritative durable versions distinct from runtime/editor cache and local undo/redo history.
- Never expose service-role credentials or secrets to browser/client code.

## Schema and migrations
- Preserve existing relationship invariants between world maps, playable maps, save slots, and map versions.
- Make schema changes through reviewable migrations rather than ad-hoc production mutations.
- Keep migrations backward-compatible where required by existing clients.
- Add focused tests for constraints, RPC result shapes, authorization boundaries, and migration-sensitive behavior.

## RPC and persistence
- Treat RPC result contracts as versioned interfaces.
- Normalize array/object RPC responses only at the adapter boundary.
- Validate identity, version metadata, snapshot presence, and relationship invariants before accepting results.
- Handle stale-version/conflict responses explicitly; do not silently overwrite authoritative durable state.
- Keep transactional operations atomic and avoid leaving test fixtures in production.

## Security
- Preserve RLS and authorization semantics.
- Never bypass RLS or approval boundaries merely to make editor flows work.
- Keep privileged operations server-side and narrowly scoped.
- Do not log secrets, tokens, private credentials, or sensitive database payloads.

## Verification
- Use focused contract/integration tests for persistence changes.
- Verify rollback behavior for transactional workflows.
- For production-facing schema changes, inspect migration status and relevant database constraints before claiming completion.
- Do not mutate production data unless explicitly authorized.
