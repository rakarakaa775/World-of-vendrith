# World Map Editor — Completion Roadmap
## 2026-10-02

Dokumen ini memperinci Phase 2 pada `WORLD_BUILDER_MASTER_ROADMAP.md`.
Fondasi MapDocument, persistence, save/load, water derivation, dan terrain paint yang
sudah diverifikasi tetap dipertahankan.

## Prinsip utama

1. MapDocument tetap source of truth.
2. Terrain, water, collision, objects, dan debug views tetap memiliki batas tanggung jawab.
3. Water tetap derived; tidak menjadi terrain yang dipaint manual.
4. Visual variation/autotiling tidak boleh mengubah data authoring secara diam-diam.
5. Setiap tool editor harus deterministic dan undo/redo-safe.
6. Fitur baru masuk secara additive; tidak mengganti persistence/building foundation.
7. Setiap fase memiliki runtime verification sebelum dianggap selesai.

---

# Phase 2A — Terrain Authoring Core

### Tujuan
Membuat painting terrain nyaman dan lengkap sebelum masuk object placement.

- [x] Single-cell paint
- [x] Erase
- [x] Undo/redo
- [x] 17 basic WORLD terrain keys
- [x] Water auto-depth gradient
- [x] Water terrain disembunyikan dari palette
- [x] Round brush sizes 1 / 3 / 5 / 7 cells
- [x] Round brush preview
- [x] Rectangle brush
- [x] Line brush
- [x] Flood Fill
- [x] Eyedropper
- [x] Continuous drag painting
- [x] Modifier/shortcut behavior
- [x] Tool state persistence selama sesi
- [x] Transaction grouping untuk satu gesture menjadi satu undo step

### Exit gate
Semua tool menghasilkan perubahan MapDocument yang deterministic, undoable,
dan tidak merusak water derivation.

---

# Phase 2B — Terrain Transition & Visual Rules

### Tujuan
Memisahkan terrain semantic dari cara terrain divisualkan.

- [x] Terrain compatibility matrix — validation distinguishes verified non-water transitions from unregistered pairs; derived water family remains compatible with authored land
- [x] Edge/neighbor masks
- [x] Shoreline masks — derived 8-way water-neighbor mask is exposed at render time without persisting it
- [x] Transition rule registry — registry semantic sudah dibuat berdasarkan pasangan transition yang saat ini terverifikasi di Supabase
- [x] Autotiling — render-time perimeter re-evaluation resolves terrain masks/bindings without persisting visual variants
- [x] Dual-grid/corner-mask strategy foundation — derived 2x2 corner mask is available to the render projection without persisting visual state
- [x] Transition validation — reports unregistered cardinal terrain transitions without mutating or blocking logical authoring
- [x] Deterministic visual variation utility
- [x] World-space variation/noise tanpa menyimpan random state per cell — renderer-only deterministic variation
- [x] Fallback visual untuk transition yang belum tersedia — renderer memakai terrain fallback deterministik saat approved binding tidak tersedia

### Asset/binding boundary

Runtime binding tetap hanya menerima candidate dan asset yang telah melewati
approval/provenance boundary. Saat ini database authoritative memiliki full
256-mask rule tiles untuk beberapa rule, tetapi approved runtime workbench
belum menyediakan seluruh pasangan mask tersebut untuk semua terrain semantic.
Karena itu implementasi tidak akan melewati workbench atau mensintesis binding
baru hanya untuk membuat visual terlihat lengkap.

### Water rules

- [x] Land → water valid
- [x] Water depth derived dari jarak ke land
- [x] water → brackish → deepwater2 → deepwater
- [x] Shoreline visual variants — render-time exact approved shoreline mask is used when bound; otherwise verified base mask 255 fallback
- [x] Water transition validation — all derived water-depth bands are treated as one compatible family at validation time
- [x] Large-water-body stress test — 64×64 derived water body regression verifies complete coverage, all depth bands, and deterministic rebuild

### Exit gate
Perubahan terrain tidak menghasilkan seam/transition yang tidak terdefinisi,
dan rendering tetap deterministic setelah save/load.

---

# Phase 2C — Brush & Selection Suite

### Tujuan
Membawa workflow editor mendekati editor map open-source yang telah direview.

- [x] Selection rectangle
- [x] Multi-cell selection
- [x] Move selection
- [x] Copy selection
- [x] Paste selection
- [x] Replace selection
- [x] Brush presets
- [x] Rectangle fill
- [x] Line
- [x] Flood
- [x] Eyedropper
- [ ] Future lasso (staged, bukan blocker)

### Exit gate
Selection dan paint tidak membuat duplicate object/terrain state dan tetap
memiliki undo/redo transaction yang benar.

---

# Phase 2D — Debug & Diagnostic Views

### Tujuan
Membuat masalah map dapat dilihat langsung di canvas, bukan hanya lewat source.

- [~] Grid overlay — implemented; browser click-level verification pending
- [~] Terrain ID view — implemented; browser click-level verification pending
- [~] Water depth view — implemented; browser click-level verification pending
- [~] Collision/passability view — implemented; browser click-level verification pending
- [~] Layer isolation — implemented; browser click-level verification pending
- [~] Object bounds — implemented; browser click-level verification pending
- [ ] Chunk/debug bounds bila chunking diperkenalkan
- [~] Invalid-cell highlight — implemented; browser click-level verification pending
- [~] Diagnostic legend — implemented; browser click-level verification pending
- [~] Read-only debug mode — implemented; browser click-level verification pending

### Exit gate
Setiap mode debug hanya merupakan projection/overlay dan tidak mengubah
MapDocument.

**Implementation status:** Phase 2D diagnostic views are implemented and merged. The remaining gate is browser runtime verification; the connected Codespace currently has no browser/Chromium runner.

---

# Phase 2E — Layer System

- [~] Layer tree — implemented; browser click-level verification pending
- [~] Visibility toggle — implemented; browser click-level verification pending
- [~] Lock — implemented; browser click-level verification pending
- [~] Opacity — implemented; browser click-level verification pending
- [~] Ordering — implemented; browser click-level verification pending
- [~] Layer groups — implemented; browser click-level verification pending
- [~] Duplicate layer — implemented; browser click-level verification pending
- [~] Merge layer — implemented; browser click-level verification pending
- [~] Layer isolation — implemented in Phase 2D; browser click-level verification pending
- [~] Layer template — implemented; browser click-level verification pending

### Exit gate
Layer operation mempertahankan identity, serialization, dan undo/redo.

---

# Phase 2F — Object / Asset Placement

### Tujuan
Memulai object authoring setelah terrain stabil.

- [~] Asset browser → canvas — temporary semantic palette is wired; approved registry-backed browser and previews remain
- [ ] Drag/drop
- [~] Stamp placement — click-to-place via Building tool; drag stamping remains
- [~] Object selection — existing canvas selection is connected to inspector; browser interaction verification pending
- [~] Object move — Alt-drag path exists; browser interaction verification pending
- [~] Delete — inspector delete action added; browser interaction verification pending
- [~] Rotation — inspector 90° controls added; browser interaction verification pending
- [~] Scale — width/height transform controls added; bounds/overlap guard is in the domain helper
- [~] Transform inspector — single-selected-object position/size/rotation controls added
- [~] Duplicate — deterministic, bounds/collision-safe helper and inspector button wired; browser interaction check remains
- [~] Multi-select — inspector X/Y translate the group and rotation applies a shared delta; atomic bounds/collision regression tests pass; resizing remains single-object only
- [~] Scatter — seeded placement control wired; partial-placement count is reported in diagnostics
- [~] Deterministic random placement — stable seed/position/layer/asset identity; CI verified
- [~] Collision-aware placement — core avoids existing object footprints and applies minimum Manhattan spacing; UI wiring is partial
- [~] Object bounds/debug — existing debug overlay toggle exists; object-specific visual verification remains
- [~] Object metadata/provenance — stable asset ID/name stored; approved registry/license/source provenance remains

### Boundary
Object placement tidak mengubah terrain engine dan tidak mengubah building
engine foundation.

### Current implementation note

The editor now exposes a temporary semantic object palette, click-to-place,
seed/count/minimum-distance scatter controls, and a transform inspector with
delete, duplicate, and 90-degree rotation actions. X/Y inspector changes translate
a multi-selection atomically relative to the primary object; rotation applies a
shared delta, while resizing remains single-object only. Operations fail closed
when bounds or collision checks fail. Placement/scatter IDs are deterministic
and include layer identity; objects preserve asset labels. CI on commit
`ba023983db57d9e6490977b504f8c50a4b01386a` passed TypeScript, Next.js build,
and Vitest (latest run: 38059438543). Regression coverage includes group
transform/collision rejection and an in-memory serialization round trip for
object transforms and asset provenance. The palette entries remain editor
prototypes, not approved registry entries. Drag/drop, approved registry/license
provenance, browser interaction checks, and a true persistent save/load round trip
remain open.

### Exit gate
Object dapat ditempatkan, disimpan, dimuat ulang, dipilih, diubah, dan
dihapus tanpa mengubah terrain/collision secara tidak sengaja.

---

# Phase 2G — Geography Tools

Dilakukan setelah terrain/object authoring stabil.

- [ ] Elevation foundation
- [ ] Height field
- [ ] Water level
- [ ] River
- [ ] Lake
- [ ] Stream
- [ ] Coastline
- [ ] Road
- [ ] Path
- [ ] Bridge
- [ ] Forest region
- [ ] Settlement region
- [ ] Landmark region

### Boundary
Geography tools menghasilkan semantic map data; renderer hanya memproyeksikan
hasilnya.

---

# Phase 2H — Cartography

- [ ] Labels
- [ ] Icons
- [ ] Pins
- [ ] Notes
- [ ] POIs
- [ ] Borders
- [ ] Political regions
- [ ] Trade routes
- [ ] Compass
- [ ] Scale
- [ ] Legend

---

# Phase 2I — Validation & Publish Readiness

### Terrain
- [ ] Unknown terrain IDs
- [ ] Missing required terrain
- [ ] Invalid transitions
- [ ] Broken water gradient

### Geometry
- [ ] Invalid bounds
- [ ] Disconnected/invalid water structures
- [ ] Invalid elevation

### Objects
- [ ] Unknown asset
- [ ] Missing runtime mapping
- [ ] Out-of-bounds object
- [ ] Collision overlap

### Persistence
- [ ] Save/load round trip
- [ ] Version consistency
- [ ] Snapshot integrity
- [ ] Conflict-safe save

### Exit gate
Map dapat dinyatakan editor-valid sebelum masuk Preview/World Runtime.

---

# Phase 2J — Performance & Large Map Readiness

Dilakukan setelah semantics stabil.

- [ ] Chunked terrain projection
- [ ] Lazy asset loading
- [ ] Asset cache
- [ ] Spatial indexing
- [ ] Object culling
- [ ] Background validation
- [ ] Worker-safe pure terrain operations
- [ ] Large map stress test
- [ ] 100k+ object target assessment

---

# Phase 2 Final Exit Gate

Phase 2 dianggap selesai jika:

1. Terrain authoring lengkap.
2. Water derivation tetap deterministic.
3. Transition/autotile tidak merusak semantic terrain.
4. Brush/selection suite berfungsi.
5. Debug views dapat memverifikasi runtime visual.
6. Layer system stabil.
7. Object placement stabil.
8. Geography dasar tersedia.
9. Validation mendeteksi map yang tidak valid.
10. Save/load + conflict flow tetap lulus.
11. Browser runtime verification selesai.
12. Tidak ada perubahan pada locked foundation tanpa alasan dan bukti.

---

# Deferred / bukan blocker Phase 2

- Procedural world generation penuh
- Biome simulation
- Life generation
- World Engine
- Time/Seasons
- Region runtime
- Building engine rewrite
- Advanced navigation mesh
- Full collaborative editing

Fitur-fitur tersebut mengikuti roadmap master setelah World Map authoring stabil.
