---
applyTo: "app/**/*.{ts,tsx},apps/**/*.{ts,tsx},components/**/*.{ts,tsx},middleware.ts,proxy.ts,next.config.*"
---

# Vendrith Next.js instructions

Before changing Next.js application architecture, inspect .ai/rules/nextjs.md, the relevant App Router boundaries, existing loading/error patterns, and affected tests.

## Server and Client boundaries
- Respect Server Component and Client Component boundaries.
- Browser APIs, PixiJS, canvas, pointer interaction, and editor-only runtime state belong client-side.
- Keep server-only credentials, privileged database access, and secrets out of client bundles.
- Add "use client" only where client behavior actually requires it.
- Do not move domain state into React client state merely to cross a boundary; use typed serializable contracts.

## App Router
- Keep route responsibilities explicit: pages compose UI, server boundaries own privileged data access, and reusable domain logic stays framework-independent.
- Preserve loading, error, and not-found boundaries where they already exist.
- Avoid unnecessary client wrappers around server-rendered content.
- Keep navigation and URL state separate from canonical MapDocument state.

## Data fetching and mutations
- Fetch data at the owning server/client boundary and avoid duplicate requests.
- Run independent server-side operations in parallel where safe.
- Validate all external/RPC results before they enter domain state.
- Treat Server Actions/API handlers as trust boundaries: authenticate, authorize, validate input, execute narrowly scoped operations, and return safe typed results.
- Do not silently overwrite authoritative durable map versions.

## Caching and freshness
- Preserve the intended cache/revalidation semantics of each route and data source.
- Do not add caching merely for perceived performance when data is user-specific or authorization-sensitive.
- Durable map/version data must not be served from an inappropriate shared cache.
- When changing caching or revalidation behavior, document the expected freshness contract and test the affected path.

## Editor integration
- Keep PixiJS initialization and rendering inside the client boundary.
- Keep MapDocument and game-data contracts independent of Next.js/React.
- UI state must not bypass Tool -> Command -> State -> Renderer.
- Save, version, conflict, and asset approval flows must retain their existing validation boundaries.

## Production verification
- For routing, Server/Client boundary, caching, or server-action changes, verify the production build when practical.
- For runtime UI changes, perform browser verification when appropriate.
- Review the final diff for accidental client-bundle exposure, duplicated fetching, stale caching, and broken loading/error states.
