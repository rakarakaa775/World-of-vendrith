---
applyTo: "apps/map-editor/editor/**/*.ts,apps/map-editor/data/**/*.ts,apps/map-editor/**/*.json"
---

# Vendrith game-data instructions

Before changing canonical game data, inspect `.ai/skills/game-data/SKILL.md`, the relevant Map Editor contracts, serialization code, migrations, and focused tests.

## Domain boundary
- Canonical game data must remain plain, typed, serializable structures.
- Never persist PixiJS, React, DOM, canvas, or other runtime objects.
- Preserve the separation between Map, Layer, Tile, Tileset, Object, Collision, Event, and Property domain concepts.
- Keep renderer-specific concerns outside domain models.

## Schema integrity
- Treat schema versioning as an explicit compatibility boundary.
- Preserve stable map, layer, object, and relationship IDs during transformations unless the operation explicitly creates or deletes an entity.
- Validate untrusted serialized data before it enters canonical state.
- Reject unsupported schema versions rather than silently guessing.
- Keep serialization deterministic where practical.

## Migration and compatibility
- Add focused tests for new schema fields, migrations, invalid documents, and relationship invariants.
- Preserve backward compatibility intentionally; document breaking changes.
- Do not silently discard unknown or required data during round trips.
- Keep local editor history separate from durable version history.

## Editor integration
- Changes should follow Tool -> Command -> State -> Renderer.
- Domain commands should be testable without PixiJS or React.
- Save-slot and persistence flows must preserve authoritative world/playable-map relationships.
- Conflict resolution must not recreate entities that authoritative state explicitly deleted.

## Verification
- Run focused contract tests for every domain/schema behavior change.
- Expand to the Map Editor suite and build/runtime verification when integration boundaries are affected.
- Review serialized round trips and failure paths before claiming completion.
