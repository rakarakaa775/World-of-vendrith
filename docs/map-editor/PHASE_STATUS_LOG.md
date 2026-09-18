# Vandrith Map Editor — Phase Status Log

## 2026-09-18 — Phase 1 completion lock

**Status:** Phase 1 closed for transition to Phase 2.

### Phase 1 evidence recorded
- Map Editor foundation contracts remain locked.
- Local editor state remains separated from network persistence.
- Paint interaction was repaired for mobile pointer/touch input without changing persistence.
- Authoritative Save was verified to create durable map versions; the audited World Map reached version 11 with persisted painted cells.
- Load Latest was hardened with an authoritative fallback path.
- Vercel status for the latest editor fix is successful.
- Existing Supabase persistence RPCs, versioning, ownership, save-slot semantics, and snapshot boundaries were not redesigned.

### Lock rule
Phase 2 and later feature work must build on the locked foundation in:
- `docs/map-editor/FOUNDATION_LOCK.md`

Ordinary feature work must not redesign the locked persistence, ownership, versioning, or editor-state contracts. Any foundation exception requires explicit change-control documentation and a new lock baseline.

## 2026-09-18 — Phase 2 started

**Roadmap phase:** Phase 2 — MapDocument & Serialization Contract.

**Goal:** one canonical, validated, versioned MapDocument representation that survives serialize → parse → compare round trips for World, Region, and Playable maps.

### Phase 2 work boundary
1. Audit the current `MapDocument`, serializer, parser, and focused tests.
2. Strengthen parser validation only at the document contract boundary.
3. Cover World, Region, and Playable round trips.
4. Cover malformed envelope/schema/version/identity/dimension/layer payloads.
5. Preserve the existing schema identifier and document version unless evidence requires a compatibility change.
6. Do not modify Supabase persistence tables/RPCs merely to complete Phase 2.
7. Run focused tests and then verify the deployed/runtime boundary where applicable.

### Current audited baseline
- Schema: `vandrith.map-document`
- Document version: `1`
- Map types: `world | region | playable`
- Current canonical fields include identity, parent relationship, dimensions, tile size, layers, and Playable-space metadata.
- Existing parser already validates schema/version, identity, positive dimensions, layer presence, and cell-count consistency.
- Existing tests already cover dimension allocation, World identity, object-shaped persisted snapshots, malformed numeric fields, and cell-count mismatch.

### Phase 2 implementation checkpoint — 2026-09-18
- Strengthened the parser to validate layer kind/flags, cell tile identity, object structure, and relationship metadata at the serialization boundary.
- Added World/Region/Playable deterministic round-trip coverage and malformed envelope/layer/relationship regression cases.
- Implementation commits: `f4a92a5aee3dce576b3399e9f80423c73712a403`, `80f3d9d01f940d9a1e48ff0dc40f6c46146e9fc6`.
- Vercel deployment status for the latest test commit is currently `pending`; Phase 2 is therefore **in progress**, not locked complete.

### Phase 2 build correction — 2026-09-18
- Vercel build on commit `f643321` failed during TypeScript checking in `apps/map-editor/editor/map-serialization.ts` because `candidate.width` / `candidate.height` were still typed as `unknown` at the positivity comparison.
- This was a TypeScript narrowing issue introduced by the strengthened object validation, not a Supabase/persistence failure.
- Fixed with explicit numeric narrowing and finite/positive dimension checks in commit `8459db277d188f13bf5adb035689b5ca726145c9`.
- Supabase was re-audited before the correction; project remains `ACTIVE_HEALTHY`, and no Phase 2 database migration is required.
- Post-fix Vercel status is currently `pending`; Phase 2 remains **in progress** until the new build completes.

### Phase 2 exit evidence
Serialize → parse → compare tests plus malformed-payload tests for all three map types, with no regression to the locked editor/persistence foundation.
