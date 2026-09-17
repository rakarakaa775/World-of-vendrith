# Map Editor Change Log Addendum — Foundation Grid Repair

## 2026-09-17 — Dimension-safe MapDocument grid allocation

- **Type:** Fixed
- **Reason:** Phase 0 audit identified that the shared layer constructor could allocate a hardcoded 240 cells even when the document dimensions changed.
- **Details:** Added the canonical `createEmptyCells(width, height)` allocation boundary. It validates positive integer dimensions and allocates exactly `width * height` cells. The shared layer constructor now uses this boundary.
- **Affected:** `apps/map-editor/editor/map-document.ts`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Added executable Vitest coverage for exact allocation, invalid dimensions, default document dimensions, non-default dimensions, and persisted layer-size rejection. Test execution is still pending in this session.
- **Notes:** No Supabase schema/RPC, asset binary, or hierarchy persistence behavior was changed.

## 2026-09-17 — Foundation grid regression suite added

- **Type:** Added
- **Reason:** Convert the audited grid invariant into a durable automated contract.
- **Details:** Added `apps/map-editor/editor/map-foundation.test.ts` covering allocation and serialization boundaries.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Test source committed; execution pending.
