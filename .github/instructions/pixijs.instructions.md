---
applyTo: "apps/map-editor/**/*.tsx,apps/map-editor/**/*.ts"
---

# Vendrith PixiJS instructions

Before changing PixiJS rendering or interaction code, inspect `.ai/skills/pixijs/SKILL.md`, the Map Editor contracts, render-diff logic, and focused tests.

## Rendering boundary
- PixiJS is a rendering and interaction layer, never the canonical map-data model.
- Do not persist PixiJS Application, Container, Sprite, Graphics, Texture, or other display objects.
- Keep camera state separate from serializable MapDocument state.
- Translate user interaction into domain commands/state changes rather than mutating persistent map data from display objects.

## Performance
- Preserve incremental render paths when only terrain cells or isolated objects changed.
- Reuse textures and persistent containers where the existing renderer already does so.
- Avoid unnecessary full-scene rebuilds for local edits.
- Treat large maps as a performance-sensitive surface; consider batching, chunking, culling, and texture reuse before introducing per-cell rendering work.
- Destroy replaced PixiJS resources only when ownership is clear; do not destroy shared cached textures.

## Async and lifecycle safety
- Guard asynchronous asset/texture work against stale renders, unmounted components, and replaced documents.
- Do not allow an older render effect to overwrite a newer MapDocument.
- Keep asset-loading failures isolated from canonical editor state and preserve the renderer's safe fallback behavior.

## Verification
- For render behavior changes, update focused render-diff or renderer tests.
- For performance-sensitive changes, verify the affected incremental path rather than relying only on a full render test.
- When UI/runtime behavior changes, run the appropriate build or browser verification before claiming completion.
