---
applyTo: "apps/map-editor/**/*.{ts,tsx},app/**/*.{ts,tsx},components/**/*.{ts,tsx},**/next.config.*,**/vercel.json"
---

# Vendrith performance instructions

Before performance-sensitive changes, inspect .ai/rules/nextjs-performance.md, .ai/rules/pixijs.md, the relevant renderer contracts, and existing performance tests.

## Next.js and React
- Keep server/client boundaries deliberate; avoid unnecessary client components.
- Dynamically load heavy editor-only modules when this improves initial load without harming editor responsiveness.
- Do not recreate expensive objects, callbacks, textures, or render structures unnecessarily.
- Keep transient pointer, drag, selection, and camera state out of broad React state when practical.
- Avoid duplicate or sequential data fetching when independent operations can run in parallel.
- Keep data fetching close to its owning boundary and preserve cache semantics.
- Virtualize or otherwise constrain large asset, layer, object, and history lists.

## PixiJS renderer
- Treat MapDocument as canonical and PixiJS as a rendering/interaction layer.
- Preserve incremental render paths for local terrain/object changes.
- Avoid full-scene rebuilds when a render diff can update only affected layers or cells.
- Reuse textures, containers, and caches where ownership permits.
- Never destroy shared cached textures or resources owned elsewhere.
- Guard asynchronous texture/asset work against stale documents, replaced renders, and unmounted components.
- Keep camera transforms separate from persisted domain state.

## Large maps and asset libraries
- Design for the existing 128x128 map ceiling without assuming every edit requires 16,384 independent render operations.
- Prefer batching, chunking, culling, or texture reuse before introducing per-cell work at scale.
- Avoid loading an entire asset library when a filtered/virtualized subset is sufficient.
- Preserve deterministic terrain/autotile behavior while optimizing lookup and rendering.

## Measurement
- Measure before and after performance changes when practical.
- Use focused render-diff/performance tests and runtime evidence for expensive paths.
- Do not trade away correctness, persistence integrity, provenance validation, or accessibility solely for speed.
- Do not claim a performance improvement without evidence from a test, profile, benchmark, or verified runtime observation.

## Verification
- For renderer changes, run the focused render tests and expand verification when UI/runtime behavior changes.
- For Next.js boundary or loading changes, verify the affected build/runtime surface.
- Review the final diff for accidental full-render regressions, duplicated requests, resource leaks, and stale async updates.
