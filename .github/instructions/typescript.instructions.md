---
applyTo: "**/*.ts,**/*.tsx"
---

# Vendrith TypeScript and domain-contract instructions

Before changing TypeScript contracts or domain logic, inspect .ai/rules/typescript.md, the relevant domain types, serialization/migration code, and focused contract tests.

## Type safety
- Prefer explicit domain types and discriminated unions over broad structural types.
- Avoid any; use unknown at untrusted boundaries and narrow it with runtime validation.
- Do not use type assertions to hide unknown runtime behavior or bypass a contract mismatch.
- Preserve strict nullability and make impossible states unrepresentable where practical.
- Keep public function inputs and outputs explicit when they cross module or persistence boundaries.

## Domain contracts
- Canonical game data must remain typed, serializable, deterministic, and framework-independent.
- Preserve stable IDs for maps, layers, objects, tilesets, and relationships.
- Preserve schema/version fields and reject unsupported versions rather than guessing.
- Keep MapDocument, GameSaveSnapshot, persistence RPC results, and renderer state as distinct contracts.
- Do not persist React, DOM, PixiJS, Texture, Sprite, Container, Application, or other runtime objects in domain data.

## Runtime validation
- Validate unknown external data at trust boundaries before narrowing it into domain types.
- Treat JSON, RPC results, local storage, uploaded/imported assets, URL parameters, and browser input as untrusted.
- Prefer small reusable validators with clear error codes over scattered unchecked casts.
- Keep validation failures explicit and fail closed for security, provenance, persistence, and schema boundaries.

## Transformations and migrations
- Preserve data during serialization round trips.
- Make migrations explicit, deterministic, and covered by focused tests.
- Do not silently drop unknown required fields or relationship metadata.
- Stable IDs should change only when the operation explicitly creates or deletes an entity.
- Separate editor undo/redo history from durable database version history.

## Map Editor integration
- Follow Tool -> Command -> State -> Renderer.
- Domain commands should be testable without React or PixiJS.
- Keep terrain mask conventions centralized and typed; do not introduce a second bit ordering.
- Preserve save-slot, world/playable-map, and conflict-resolution invariants during type changes.

## Verification
- Update focused contract tests when a type or runtime contract changes.
- Test invalid data, boundary conditions, and serialization round trips.
- Run the appropriate TypeScript/build/test verification before claiming completion.
- Review diffs for unnecessary casts, widened types, duplicated contracts, and accidental framework coupling.
