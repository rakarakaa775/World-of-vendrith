# Supabase Performance and Concurrency Rules

- Prefer narrow queries and explicit columns over broad row fetches.
- Treat RPC contracts as typed, versioned API boundaries.
- Use optimistic concurrency/version checks for authoritative map writes.
- Keep transactions short and avoid unnecessary locks.
- Design RLS/access checks before exposing write paths.
- Do not use service-role credentials in browser code.
- Test stale-version, unauthorized-map, invalid-input, and rollback behavior for critical RPCs.
- Inspect query/runtime evidence before making performance claims.
