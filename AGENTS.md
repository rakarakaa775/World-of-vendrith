# Vendrith Engineering Instructions

Vendrith is a game-development project with a Map Editor.

## Workflow
Understand -> inspect -> research unfamiliar APIs -> plan -> implement -> test -> review -> verify -> document durable decisions.

## Architecture
- Game data is independent from rendering frameworks.
- PixiJS is a rendering/interaction layer, not canonical map data.
- Next.js/React owns application UI and server/client boundaries.
- Phaser is a game/runtime layer, not the editor persistence model.
- Domain state is typed, serializable, versionable, and testable.
- Meaningful editor mutations should support undo/redo.
- Asset provenance and licensing metadata must be preserved.
- Never commit secrets.

## Map Editor
Map, Layer, Tile, Tileset, Object, Collision, Event, Property, Selection, Tool, Camera, History.

Prefer Tool -> Command -> State -> Renderer.

## Verification
Use the smallest appropriate pipeline: typecheck, lint, tests, build, browser/runtime verification, final diff review.
