# WORLD OF VENDRITH — WORLD MAP TERRAIN PAINT CANVAS BLUEPRINT

## Tujuan
Dokumen ini menjadi blueprint/handoff teknis untuk sistem base terrain paint pada World Map. Tujuannya agar penambahan atau pembaruan base paint berikutnya mengikuti jalur yang sudah terbukti bekerja.

## 1. Rantai Paint

Terrain Palette → Terrain Key / Tile ID → Terrain Resolver → Brush / Pointer Input → Terrain Paint Engine → Ground Layer → Document Mutation → commit() → Pixi Renderer → Fallback Color → VISIBLE PAINT

Untuk history: Paint / Erase → commit() → Undo / Redo.

Jangan menganggap palette saja sebagai sistem paint. Semua bagian pipeline saling terhubung.

## 2. Terrain Palette

File: apps/map-editor/editor/tile-palette.ts

Komponen penting:
- TerrainPaletteKey
- TERRAIN_ASSETS
- STARTER_TILES
- loadTerrainTiles()

Tugasnya mendefinisikan terrain, label UI, nama asset, starter/fallback tile, dan metadata approved dari asset_registry bila tersedia.

Base terrain saat ini:

grass, grassalt, sand, redsand, dirt, dirt2, pavement, water, deepwater, deepwater2, brackish, tallgrass, hole, holek, holemid, lava, lavarock

Terrain baru tidak boleh hanya ditambahkan sebagai tombol UI.

## 3. Canonical Terrain Key

File: apps/map-editor/editor/terrain-engine.ts

TERRAIN_KEYS adalah daftar canonical terrain dan menghasilkan TerrainKey.

Jika terrain baru ditambahkan, terrain tersebut wajib dikenalkan sebagai canonical TerrainKey.

## 4. Tile ID ke Terrain Key

File: apps/map-editor/editor/terrain-engine.ts

Fungsi terrainFromTileId() menerjemahkan tile ID menjadi terrain logis.

Compatibility yang harus dipertahankan:
- starter-tile → grass
- stone-tile → pavement
- water-tile → water

Canonical ID terrain juga harus dikenali.

TerrainKey adalah identitas logis; label UI bukan identitas terrain.

## 5. Terrain Resolver

File: apps/map-editor/editor/terrain-resolver.ts

Alur: TerrainKey → tile ID yang dapat digunakan paint engine.

Fallback menjaga basic paint tetap bekerja ketika metadata registry tidak tersedia.

Contoh:
- grass → starter-tile
- pavement → stone-tile
- water → water-tile
- deepwater → deepwater

Asset registry adalah sumber metadata, tetapi bukan satu-satunya syarat agar basic paint bekerja.

## 6. Brush dan Pointer Input

File utama:
- apps/map-editor/components/pixi-map-canvas.tsx
- apps/map-editor/editor/terrain-brush-preview.ts

Pointer/brush menghasilkan GridPoint[]. Input kemudian diteruskan sebagai tile/terrain ke paint engine.

Alur: Pointer → GridPoint[] → tile ID → paint engine.

Document tetap menjadi source of truth; input tidak langsung menjadi visual permanen di canvas.

## 7. Ground Layer

Terrain paint harus menargetkan layer dengan kind = ground.

Implementasi mengambil ground layer aktual dari document.layers dan menggunakannya sebagai activeLayerId.

Jangan menggunakan persisted activeLayer secara buta untuk terrain paint. Terrain paint harus memastikan targetnya adalah ground layer.

## 8. Terrain Paint Engine

File: apps/map-editor/editor/terrain-engine.ts

Fungsi penting: applyTerrainPaint() dan paintCell().

Alur: GridPoint → validasi → cek layer → tulis tile ID ke cell → return document baru.

paintCell() adalah bagian yang melakukan perubahan cell.

## 9. Validasi Paint

Sebelum cell dicat, pipeline memastikan:
- layer ada
- layer adalah ground
- layer tidak terkunci
- layer visible
- selected tile dapat di-resolve
- point berada di grid

Jika tidak valid, paint tidak dilakukan.

## 10. Commit

Setelah paint engine menghasilkan document baru, perubahan harus melalui commit(result.document).

commit() menghubungkan mutation dengan render, history, undo/redo, dan save/load.

Jangan membuat jalur paint yang hanya mengubah visual canvas dan melewati commit.

## 11. Undo / Redo

Model: Document A → paint → Document B; undo kembali ke A dan redo kembali ke B.

Setiap perubahan paint harus melalui history/commit mechanism.

Test minimum: paint → undo → redo.

## 12. Erase World Map

Base terrain World Map adalah deepwater.

Karena itu erase bukan blank/null. Perilakunya adalah mengembalikan cell ke deepwater.

Contoh: grass → erase → deepwater; sand → erase → deepwater; lava → erase → deepwater.

Kontrak: World Map erase = restore base deepwater.

## 13. Renderer

File utama: apps/map-editor/components/pixi-map-canvas.tsx

Terrain dirender ke Graphics yang sama dengan map grid yang sudah terbukti tampil.

Konsep: Pixi Graphics → background → terrain cells → grid lines.

Terrain tidak boleh bergantung sepenuhnya pada remote texture agar terlihat.

## 14. Fallback Color

Fungsi colorForTile(tileId) memberikan warna fallback.

Warna baseline:
- grass: 0x4f9d50
- grassalt: 0x6fae58
- sand: 0xe6c36a
- redsand: 0xc9784f
- dirt: 0x98633e
- dirt2: 0x7f5135
- pavement: 0x8b949e
- water: 0x3b82c4
- deepwater: 0x24527a
- deepwater2: 0x1d4162
- brackish: 0x397b78
- tallgrass: 0x3f873f
- hole: 0x3f3028
- holek: 0x4a372e
- holemid: 0x554238
- lava: 0xc4472d
- lavarock: 0x5b4542

Fallback color adalah safety net visibility. Jika texture gagal load, terrain tetap harus terlihat.

## 15. Texture adalah Enhancement

Fondasi visibility adalah fallback Graphics. Texture asset menjadi enhancement setelahnya.

Document → Terrain → Fallback Graphics → Paint terlihat → Texture enhancement.

Remote texture tidak boleh menjadi satu-satunya syarat agar terrain terlihat.

## 16. Deepwater Special Case

Deepwater adalah base terrain World Map. Renderer mempertahankan penanganan khusus untuk deepwater agar base world tetap dapat dirender pada map campuran.

Hal ini berkaitan langsung dengan perilaku erase → deepwater.

## 17. Brush Preview Mapping

File: apps/map-editor/editor/terrain-brush-preview.ts

Brush harus dapat menerjemahkan TerrainKey menjadi tile ID melalui tileIdForTerrain() dan mapping input terrain.

Jangan mempertahankan mapping lama yang hanya berisi subset terrain ketika TerrainKey sudah diperluas.

## 18. UI Swatch

File: apps/map-editor/editor/editor-shell.tsx

UI menampilkan swatch terrain dan jumlah terrain mengikuti tileOptions.length, bukan angka hard-coded enam.

Jika jumlah base terrain berubah, UI harus mengikuti data palette.

## 19. Save / Load

Paint → Document mutation → Commit → Save → Load → Cell terrain tetap benar.

Test minimum: paint → save → load → cek cell.

## 20. Diagnostic

Diagnostic yang sudah digunakan berbentuk:

apply: layer=ground requested=1 affected=9 changed=YES tile=grass validation=9

Interpretasi:
- layer=ground: target layer benar
- requested=1: input brush valid
- affected=9: brush menghasilkan 9 cell
- changed=YES: document benar-benar berubah
- tile=grass: terrain berhasil di-resolve
- validation=9: cell lolos validasi

Jika diagnostic menunjukkan changed=YES tetapi canvas kosong, jangan langsung mengubah paint engine. Periksa renderer, Graphics, colorForTile(), dan terrain-to-visual mapping.

## 21. Failure Mode yang Sudah Terbukti

1. Hanya menambah palette → UI punya terrain tetapi TerrainKey belum mengenalnya → build/type error.
2. Hanya menambah TerrainKey → resolver/brush belum mengenalnya → terrain tidak menghasilkan tile yang dapat dicat.
3. Paint engine berhasil tetapi renderer tidak menggambar → document berubah tetapi canvas kosong.
4. Renderer hanya menunggu remote texture → texture belum tersedia sehingga terrain tidak terlihat.
5. Erase menulis null → tidak sesuai kontrak World Map; harus kembali ke deepwater.
6. Paint bypass commit → visual dapat berubah tetapi undo/redo/save/load dapat tidak konsisten.

## 22. Blueprint Penambahan Base Terrain Baru

Jika ada terrain baru, ikuti urutan ini tanpa melompati tahap:

1. Tambahkan canonical key ke TERRAIN_KEYS.
2. Tambahkan definisi ke TERRAIN_ASSETS: terrain, name, label.
3. Pastikan STARTER_TILES menghasilkan entry tersebut.
4. Pastikan terrainFromTileId() mengenali tile ID baru.
5. Tambahkan FALLBACK_TILE bila diperlukan.
6. Pastikan tileIdForTerrain() dan brush mapping mengenalinya.
7. Tambahkan colorForTile() untuk fallback rendering.
8. Tambahkan/update UI swatch bila mapping UI masih eksplisit.
9. Jalankan build.
10. Test select → click → drag → visible.
11. Test paint → undo → redo.
12. Test paint → erase → deepwater.
13. Test paint → save → load.

## 23. Search Checklist Sebelum Mengubah Terrain Base

Sebelum menambah terrain, cari asumsi lama yang hanya mengenal subset terrain:

- Record<TerrainKey
- TerrainKey
- TERRAIN_INPUTS
- FALLBACK_TILE
- colorForTile
- terrainFromTileId
- tileIdForTerrain
- mapping grass/sand/dirt/pavement/water/deepwater

Tujuannya menemukan mapping yang masih hanya berisi subset terrain.

Jangan memperbaiki file yang tidak relevan. Perubahan harus mengikuti dependency nyata atau error build yang ditemukan.

## 24. Verification Matrix

| Test | Expected |
|---|---|
| Palette muncul | Semua terrain tersedia |
| Select terrain | Terrain menjadi active |
| Single click | Cell berubah |
| Drag brush | Banyak cell berubah |
| Canvas render | Terrain terlihat |
| Undo | Paint kembali ke state sebelumnya |
| Redo | Paint muncul kembali |
| Erase | World kembali deepwater |
| Save | Document tersimpan |
| Load | Terrain tetap benar |
| Invalid point | Tidak crash |
| Missing registry metadata | Fallback tetap bekerja |
| Missing texture | Fallback color tetap terlihat |

## 25. Source of Truth Saat Debugging

Urutan pemeriksaan:

1. Document
2. Ground layer
3. TerrainKey
4. Tile ID
5. Terrain resolver
6. Paint engine
7. commit/history
8. Renderer
9. Asset texture

Jika changed=YES, document sudah berubah; periksa renderer sebelum mengubah engine.

Jika terrain ID tidak ter-resolve, periksa resolver sebelum renderer.

Jika layer bukan ground, periksa pemilihan ground layer.

## 26. Prinsip Arsitektur

1. Document adalah source of truth.
2. TerrainKey adalah identitas logis, bukan label UI.
3. Ground layer adalah target terrain paint.
4. Fallback rendering wajib tersedia.
5. Paint harus melalui commit/history.
6. World Map erase mengembalikan deepwater.
7. Registry adalah sumber metadata, bukan satu-satunya syarat basic paint.
8. Penambahan terrain dilakukan end-to-end.

## 27. Current Proven Baseline

Baseline yang sudah dinyatakan berhasil:

- Terrain palette ✓
- 17 basic terrain ✓
- Terrain resolver ✓
- Terrain validation ✓
- Ground layer targeting ✓
- Single-cell paint ✓
- Brush / multi-cell paint ✓
- Fallback color rendering ✓
- Texture-independent visibility ✓
- Erase → deepwater ✓
- Undo ✓
- Redo ✓
- Save/load flow ✓

Dokumen ini menjelaskan mekanisme paint. Texture eksternal bukan satu-satunya fondasi basic renderer; fallback color tetap menjadi fondasi visibility.

## 28. Quick Handoff

Urutan cepat:

TERRAIN_KEYS → TERRAIN_ASSETS → STARTER_TILES → terrainFromTileId() → FALLBACK_TILE → brush mapping → colorForTile() → UI swatch → build → paint → undo/redo → erase → deepwater → save/load.

Jika gagal, cari masalah pada tahap yang sesuai sebelum mengubah tahap lain.

## Aturan Utama

**Base terrain baru tidak dianggap selesai hanya karena muncul di palette. Base terrain baru selesai jika seluruh rantai TerrainKey → Palette → Resolver → Brush → Paint Engine → Ground Layer → Commit/History → Renderer → Fallback Color → Save/Load bekerja.**