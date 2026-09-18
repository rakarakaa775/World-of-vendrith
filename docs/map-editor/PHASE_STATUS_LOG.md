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

## 2026-09-18 — Phase 2 completion lock

**Status:** Phase 2 closed for transition to Phase 3.

### Phase 2 exit evidence verified
- Canonical schema remains `vandrith.map-document`.
- Document version remains `1`.
- Parser validation covers identity, dimensions, tile size, layer semantics, cell semantics, object semantics, and relationship metadata.
- Deterministic serialize → parse → compare coverage exists for World, Region, and Playable MapDocument types.
- Regression coverage exists for malformed envelope schema/version, missing document, requested identity mismatch, numeric dimensions, layer cell counts, layer/cell semantics, and relationship metadata.
- The latest Vercel status for commit `5b74b7e8812516da2cddd290ad06b41cdde9b073` is **success**.
- Supabase remains `ACTIVE_HEALTHY`; the authoritative map foundation remains intact: `maps` 1 row, `map_versions` 12 rows, `map_cells` 68 rows, with no Phase 2 migration added.
- No persistence RPC, ownership, save-slot, versioning, or snapshot-boundary redesign was introduced.

### Implementation commits
- `f4a92a5aee3dce576b3399e9f80423c73712a403` — strengthened serialization validation.
- `80f3d9d01f940d9a1e48ff0dc40f6c46146e9fc6` — added Phase 2 round-trip and malformed-payload tests.
- `8459db277d188f13bf5adb035689b5ca726145c9` — corrected TypeScript numeric narrowing for object dimensions.
- `5b74b7e8812516da2cddd290ad06b41cdde9b073` — corrected the cell-count validation error-path contract.

### Lock boundary
Phase 2 is now locked. Phase 3 must build on the existing MapDocument/serialization contract and the Phase 1 persistence foundation. No compatibility or persistence redesign is implied by this lock.

## 2026-09-18 — Phase 2 final audit summary

**Final status:** LOCKED COMPLETE.

### Ringkasan pekerjaan Phase 2
Phase 2 menetapkan dan memperkuat kontrak tunggal `MapDocument` pada batas serialisasi tanpa mengubah fondasi persistence Phase 1.

1. **Contract baseline dipertahankan**
   - Schema tetap `vandrith.map-document`.
   - Document version tetap `1`.
   - Model tetap mendukung `world | region | playable`.
   - Tidak ditambahkan format penyimpanan baru atau field storage-specific untuk Supabase.

2. **Parser validation diperkuat**
   - Identity: `id`, `name`, dan `mapType`.
   - Dimensions: `width`, `height`, dan `tileSize` harus positive integer.
   - Layer: id, name, kind, visibility/lock/active flags, cells, dan objects.
   - Cell: `tileId` harus null atau string non-empty.
   - Object: struktur, tipe, koordinat/dimensi, asset identity, collision, dan playable-map reference.
   - Relationship metadata: `parentMapId`, `playableSpace`, dan `parentPlayableMapId`.

3. **Round-trip contract diuji**
   - World, Region, dan Playable masing-masing memiliki deterministic serialize → parse → compare coverage.
   - World Map authoritative identity yang sudah diaudit juga tetap diterima parser.

4. **Malformed payload regression ditambahkan**
   - Envelope schema/version.
   - Missing document.
   - Requested map identity mismatch.
   - Invalid numeric dimensions.
   - Invalid layer/cell/object payload.
   - Cell-count mismatch.
   - Invalid relationship metadata.

5. **Build correction diselesaikan**
   - TypeScript narrowing pada object dimensions diperbaiki pada `8459db277d188f13bf5adb035689b5ca726145c9`.
   - Error-contract cell-count diperbaiki pada `5b74b7e8812516da2cddd290ad06b41cdde9b073`.
   - Vercel pada commit terakhir tersebut terverifikasi **success**.

6. **Persistence regression boundary diverifikasi**
   - Supabase tetap `ACTIVE_HEALTHY`.
   - Authoritative World Map tetap 20×12.
   - Latest persisted map version terpantau **12**.
   - `map_cells` tetap memiliki **68** persisted rows.
   - Tidak ada migration Phase 2 dan tidak ada perubahan pada persistence RPC, ownership, save-slot, versioning, atau snapshot boundary.

### Phase 2 conclusion
Phase 2 memenuhi exit evidence yang ditetapkan pada `PHASE2_EXECUTION.md` dan telah dikunci untuk transisi ke Phase 3. Fondasi Map Editor dari Phase 1 tetap menjadi baseline yang tidak berubah.


## 2026-09-18 — Phase 3 persistence checkpoint

**Status:** In progress.

- Added explicit authoritative map resolution before Save.
- Resolution checks access, authoritative maps row, durable snapshot identity, and version.
- Existing map_editor_commit_merge_v1 remains the server-controlled commit boundary.
- Supabase audit found one persisted map (world) and an existing maps.map_type constraint of world | exterior | interior.
- MapDocument uses world | region | playable; the current database vocabulary does not uniquely identify region versus playable.
- The implementation rejects ambiguous non-World persistence rather than silently mapping types.
- Phase 3 is therefore not complete yet. Next step is to establish the intended existing contract mapping before any compatibility migration.

Implementation commits: ff2857fd0a027599eefdcd57a197e61a6996c152, af1e85571ce992fb7f2fda3223afecf3b38f7f65, f43a89d4e8d54e7056a38b42d833d3d4453fc131.


## 2026-09-19 — Phase 3 Migration A source parity checkpoint

**Status:** Migration A applied; source file now present in GitHub.

- Supabase migration history records `20260918173802 / 20260919120000_map_editor_hierarchy_identity_v1`.
- Post-migration audit confirms the new hierarchy tables are present and currently contain no production identity rows.
- Canonical `World Map` remains the existing legacy `maps` row; its persisted version history remains at 12 versions with max version 12.
- GitHub source added at `supabase/migrations/20260919120000_map_editor_hierarchy_identity_v1.sql` in commit `8659a963346cd8ae2fd96c6147a87ce774927dc6`.
- No World bootstrap, child-map creation, persistence RPC, or existing map/version data was changed in this checkpoint.
- Security advisor output was reviewed; existing anonymous-access warnings concern pre-existing project policies and are not evidence of a new hierarchy-table exposure.

**Next gate:** controlled World identity bootstrap / resolution RPC design. Do not create Region/Playable/Interior production identities until the RPC contract and interior representation are explicitly resolved.


## 2026-09-19 — Phase 3 Migration B RPC checkpoint

**Status:** Controlled identity RPC boundary added; child hierarchy remains gated.

- Added authenticated, owner-scoped `map_editor_bootstrap_world_identity_v1`.
- Bootstrap is idempotent and binds the existing World editor identity to the existing legacy World Map ID; it does not create or rename a `maps` row.
- Added authenticated, owner-scoped `map_editor_resolve_identity_v1`.
- Verified in Supabase that both RPCs execute for `authenticated` and not `anon`.
- Updated the authoritative resolver to bootstrap the explicit World identity before loading the existing authoritative snapshot.
- GitHub source commit for RPC migration: `16fae48bbd9fa814b3f10974d3339ed3aaf671c8`.
- Resolver implementation commit: `a5092e08bcc8d25994ef3627193926bd0a5887de`.
- No Region/Playable/Interior production identities have been created yet.

**Next gate:** exercise the authenticated World bootstrap through the application boundary, then design the child-creation RPC with explicit Region → Playable and Playable → Interior semantics before enabling durable child creation.


## 2026-09-19 — Map Browser identity bridge

- Supabase-first audit before implementation: hierarchy identity rows = 0, interior relation rows = 0, legacy maps rows = 1, canonical World Map versions = 12.
- Map Browser now calls the controlled authenticated RPCs for child identity creation instead of generating client-only IDs:
  - World → Region via `map_editor_create_child_v1`.
  - Region → Playable via `map_editor_create_child_v1`.
  - Playable → Interior via `map_editor_create_interior_v1`.
- The returned `editor_map_id` becomes the MapDocument identity before the child is opened in the UI.
- No legacy `maps` row is created by these browser actions; no existing World Map/version/save-slot data was changed.
- Child documents are explicitly reported as **unsaved document** because the persistence bridge for non-World MapDocument saves is not yet enabled.
- GitHub commits: `11deb988fd2d048fa47cc5535e1b47e794895c32` (Map Browser RPC bridge), `22d2d322b1e111f5bcd21abfa13d15359450911c` (app client/status wiring).
- CI status is not yet reported for these commits; no production child identity was created during implementation.
- Next gate: implement the non-World authoritative load/save bridge against `editor_map_identity`, without changing the existing World persistence foundation.
