# Vandrith Map Editor

Map Editor foundation for the Vandrith World project.

## Architecture
- Next.js App Router
- TypeScript
- PixiJS editor canvas
- Local map-document state with history
- Supabase reserved for controlled persistence/runtime reads
- Vercel reserved for final deployment

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
- Season definitions are represented only as the existing four-season enum and must not be used to invent calendar mappings

## Season / Weather boundary
Season and Weather remain backend World Engine concerns. The editor may consume authoritative resolver results for preview, but it must fail closed when the Time Engine seasonMapping or Weather transition canon is not configured/verified. The UI must not invent season durations, transition durations, transition tags, modifiers, or calendar mapping JSON shapes.

## Persistence boundary
No production Supabase mutation is claimed by this editor slice yet. Save/load integration must use verified database contracts and approved mutation gateways rather than fabricating SQL or runtime-only database state.

## Deployment boundary
Vercel is the final deployment target. Deployment comes after the GitHub implementation and verification pass.

## Next implementation slices
1. Read-only map/project loading from verified Supabase contracts.
2. Asset-library read model and verified asset selection.
3. Map persistence through approved mutation gateways.
4. Authoritative Season/Weather preview adapters.
5. Validation panel and save readiness gate.
6. Vercel deployment and browser verification.
7. Phaser Play/Preview mode later.
