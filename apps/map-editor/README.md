# Vendrith World Builder

World-authoring application for the Vandrith World project.

## Architecture

- Next.js App Router
- TypeScript
- PixiJS world-authoring canvas
- Local map-document state with history
- Supabase controlled persistence/runtime reads
- Vercel deployment target

## World Builder layers

The application is being migrated from the legacy **Map Editor** identity to **Vendrith World Builder**.

The active world-authoring layers are:

- **WORLD** — natural environment only.
- **REGION** — regional/location context.
- **PLAYABLE** — concrete exterior gameplay content.
- **INTERIOR** — indoor map content.

These are map roles, not four duplicated binary asset libraries.

## Current implementation

- World Builder shell and workspace layout
- Pixi world canvas
- Map/world document model and starter map
- Layer selection, visibility, locking, and reordering
- Tile painting and erase tools
- Brush sizes
- Rectangular selection and stamp workflow
- Building placement, selection, movement, and deletion
- Undo/redo history
- Inspector for world/building context
- Authoritative map bootstrap/load/save through Supabase
- Optimistic concurrency and three-way conflict resolution
- Runtime snapshot persistence and crash-recovery journal
- Authoritative terrain/environment read adapters

## Migration boundary

The source directory remains `apps/map-editor/` temporarily for compatibility. This is a technical legacy path, not the product name.

Do not create new architecture under the old Map Editor terminology. New World Builder work must follow the WORLD / REGION / PLAYABLE / INTERIOR contracts.

## Persistence boundary

Map persistence uses the verified `maps`, `map_versions`, and runtime snapshot contracts. Initial bootstrap creates the authoritative map and version through the merge gateway; subsequent saves use optimistic version checks and three-way merge conflict resolution.

## Deployment boundary

Vercel is the final deployment target. The latest verified production build must remain green before adding the next World Builder slice.

## Next implementation slices

1. World Builder terminology and shell migration.
2. Asset-library read model and verified asset selection.
3. Authoritative Season/Weather preview validation panel.
4. Save readiness gate and richer diagnostics.
5. Browser verification on the production deployment.
6. Phaser Play/Preview mode later.
