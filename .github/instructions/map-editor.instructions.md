---
applyTo: "apps/map-editor/**/*.ts,apps/map-editor/**/*.tsx"
---

# Vendrith Map Editor instructions

Before Map Editor changes, inspect the relevant domain contracts, tests, and .ai/skills/map-editor/SKILL.md.

## Architecture
- Keep canonical map state framework-independent and serializable.
- Keep PixiJS rendering concerns out of domain models and persistence contracts.
- Prefer Tool -> Command -> State -> Renderer.
- Treat undo/redo history as editor history; do not conflate it with durable database version history.
- Preserve map IDs, layer IDs, object IDs, schema versions, and relationship metadata during transformations.

## Terrain
- Use the existing terrain-engine mask convention; do not introduce a second neighbor-mask ordering.
- Terrain autotiling must be deterministic and covered by focused tests.
- Asset selection must respect the approved asset/provenance boundary and fail closed when required metadata is missing.
- When integrating external tilesets, preserve source attribution/license information and verify the source format before mapping tile IDs.

## Persistence and conflicts
- Validate serialized documents at trust boundaries.
- Treat durable map versions as authoritative for recovery.
- Preserve three-way merge semantics and deletion-vs-edit behavior.
- Never silently recreate entities that were explicitly deleted by the authoritative change.
- Save-slot snapshots must be validated against the expected world/playable-map relationship before use.

## Testing
- Add or update focused contract tests for every behavior change.
- For rendering changes, test render-diff decisions separately from PixiJS implementation details where possible.
- Do not weaken an existing assertion merely to make a test pass; investigate the contract mismatch first.
