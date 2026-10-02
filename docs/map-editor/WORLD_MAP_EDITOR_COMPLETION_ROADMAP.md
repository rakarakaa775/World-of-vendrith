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
- [ ] Rectangle brush
- [ ] Line brush
- [ ] Flood Fill
- [ ] Eyedropper
- [x] Continuous drag painting
- [ ] Modifier/shortcut behavior
- [ ] Tool state persistence selama sesi
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
- [ ] Shoreline masks
- [x] Transition rule registry — registry semantic sudah dibuat berdasarkan pasangan transition yang saat ini terverifikasi di Supabase
- [ ] Autotiling
- [ ] Dual-grid/corner-mask strategy bila dibutuhkan
- [x] Transition validation — reports unregistered cardinal terrain transitions without mutating or blocking logical authoring
- [x] Deterministic visual variation utility
- [ ] World-space variation/noise tanpa menyimpan random state per cell
- [ ] Fallback visual untuk transition yang belum tersedia

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
- [ ] Shoreline visual variants
- [ ] Water transition validation
- [ ] Large-water-body stress test

### Exit gate
Perubahan terrain tidak menghasilkan seam/transition yang tidak terdefinisi,
dan rendering tetap deterministic setelah save/load.

---

# Phase 2C — Brush & Selection Suite

### Tujuan
Membawa workflow editor mendekati editor map open-source yang telah direview.

- [ ] Selection rectangle
- [ ] Multi-cell selection
- [ ] Move selection
- [ ] Copy selection
- [ ] Paste selection
- [ ] Replace selection
- [ ] Brush presets
- [ ] Rectangle fill
- [ ] Line
- [ ] Flood
- [ ] Eyedropper
- [ ] Future lasso (staged, bukan blocker)

### Exit gate
Selection dan paint tidak membuat duplicate object/terrain state dan tetap
memiliki undo/redo transaction yang benar.

---

# Phase 2D — Debug & Diagnostic Views

### Tujuan
Membuat masalah map dapat dilihat langsung di canvas, bukan hanya lewat source.

- [ ] Grid overlay
- [ ] Terrain ID view
- [ ] Water depth view
- [ ] Collision/passability view
- [ ] Layer isolation
- [ ] Object bounds
- [ ] Chunk/debug bounds bila chunking diperkenalkan
- [ ] Invalid-cell highlight
- [ ] Diagnostic legend
- [ ] Read-only debug mode

### Exit gate
Setiap mode debug hanya merupakan projection/overlay dan tidak mengubah
MapDocument.

---

# Phase 2E — Layer System

- [ ] Layer tree
- [ ] Visibility toggle
- [ ] Lock
- [ ] Opacity
- [ ] Ordering
- [ ] Layer groups
- [ ] Duplicate layer
- [ ] Merge layer
- [ ] Layer isolation
- [ ] Layer template

### Exit gate
Layer operation mempertahankan identity, serialization, dan undo/redo.

---

# Phase 2F — Object / Asset Placement

### Tujuan
Memulai object authoring setelah terrain stabil.

- [ ] Asset browser → canvas
- [ ] Drag/drop
- [ ] Stamp placement
- [ ] Object selection
- [ ] Object move
- [ ] Delete
- [ ] Rotation
- [ ] Scale
- [ ] Transform inspector
- [ ] Duplicate
- [ ] Multi-select
- [ ] Scatter
- [ ] Deterministic random placement
- [ ] Collision-aware placement
- [ ] Object bounds/debug
- [ ] Object metadata/provenance

### Boundary
Object placement tidak mengubah terrain engine dan tidak mengubah building
engine foundation.

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
