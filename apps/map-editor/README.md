# Vandrith Map Editor

Map Editor foundation for the Vandrith World project.

## Architecture
- Next.js App Router
- TypeScript
- PixiJS editor canvas
- Local map-document state with history
- Supabase controlled persistence/runtime reads
- Vercel deployment target

## Current implementation
- Editor shell and workspace layout
- Pixi map canvas
- Map document model and starter map
- Layer selection, visibility, locking, and reordering
- Tile painting and erase tools
- Brush sizes
- Rectangular selection and stamp workflow
- Building placement, selection, movement, and deletion for non-world maps
- Undo/redo history
- Inspector for world/building context
- Authoritative map bootstrap/load/save through Supabase
- Optimistic concurrency and three-way conflict resolution
- Runtime snapshot persistence and crash-recovery journal
- Authoritative terrain/environment read adapters
- Season definitions are represented only as the existing four-season enum and must not be used to invent calendar mappings

## Season / Weather boundary
Season and Weather remain backend World Engine concerns. The editor may consume authoritative resolver results for preview, but it must fail closed when the Time Engine seasonMapping or Weather transition canon is not configured/verified. The UI must not invent season durations, transition durations, transition tags, modifiers, or calendar mapping JSON shapes.

## Persistence boundary
Map persistence uses the verified `maps`, `map_versions`, and runtime snapshot contracts. Initial bootstrap creates the authoritative map and version through the merge gateway; subsequent saves use optimistic version checks and three-way merge conflict resolution. The internal reconciliation primitive is not directly executable by client roles.

## Deployment boundary
Vercel is the final deployment target. The latest verified production build must remain green before adding the next editor slice.

## Next implementation slices
1. Persistence smoke test against the deployed editor.
2. Asset-library read model and verified asset selection.
3. Authoritative Season/Weather preview validation panel.
4. Save readiness gate and richer diagnostics.
5. Browser verification on the production deployment.
6. Phaser Play/Preview mode later.
