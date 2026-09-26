# Vendrith World Builder — Migration Plan

## 1. Tujuan

Mengubah konsep **Map Editor** menjadi **Vendrith World Builder** sebagai sistem authoring dunia Vandrith World.

Perubahan ini bukan sekadar rename. World Builder menjadi lapisan kerja yang mengatur pembuatan, penyusunan, validasi, dan navigasi dunia berdasarkan empat layer map yang sudah ditetapkan:

1. WORLD — alam/natural environment
2. REGION — konteks wilayah/lokasi
3. PLAYABLE — konten exterior yang benar-benar dimainkan
4. INTERIOR — ruang/interior yang dapat dimasuki

Style dunia tetap **medieval fantasy**.

## 2. Prinsip Utama

- Nama produk/editor: **Vendrith World Builder**.
- Istilah **Map Editor** dipensiunkan sebagai nama utama UI/fitur.
- WORLD, REGION, PLAYABLE, dan INTERIOR adalah **map-role layers**, bukan empat salinan library binary.
- Asset tetap disimpan pada canonical library seperti `assets/objects/`, `assets/vehicles/`, `assets/effects/`, `assets/inventory/`, dan source archive jika itu merupakan lokasi provenance yang benar.
- World Builder memakai binding/reference ke asset canonical; tidak menggandakan binary tanpa alasan.
- Editor UI, gizmo, thumbnail, cursor, helper, dan editor-only graphics tetap berada di domain `assets/map-editor/` sampai penggantiannya selesai.
- Provenance, license, attribution, dan SHA-256 tetap menjadi bagian dari pipeline asset verification.
- Binary asset asli **tidak menjadi bagian dari tahap migrasi ini**. Rekonsiliasi binary dilakukan kemudian di project conversation.

## 3. Target Information Architecture

Main menu:

```
VENDRITH WORLD BUILDER
├── 01_PREVIEW
├── 02_WORLD MAP
├── 03_REGION MAP
└── 04_PLAYABLE MAP
```

INTERIOR tetap menjadi layer authoring yang dapat dibuka dari building/entry point pada REGION atau PLAYABLE:

```
REGION
└── Building
    ├── Exterior → PLAYABLE
    └── Interior → INTERIOR
        ├── Floor
        └── Room
```

## 4. Tahap Migrasi

### Phase 0 — Baseline & Freeze

- Inventaris seluruh referensi `map-editor`.
- Tentukan mana yang merupakan editor UI/tooling dan mana yang sebenarnya map-role asset.
- Jangan memindahkan binary hanya karena nama folder.
- Bekukan aturan WORLD/REGION/PLAYABLE/INTERIOR yang sudah selesai.
- Tandai pekerjaan binary sebagai deferred.

**Output:** baseline migrasi yang tidak mengubah asset provenance.

### Phase 1 — Terminologi

**Status: COMPLETE — Phase 1 application terminology and route migration finished.**

Completed:
- Product metadata renamed to **Vendrith World Builder**.
- Home screen title/menu terminology updated.
- Editor loading text updated.
- Package identity changed from `@vandrith/map-editor` to `@vandrith/world-builder`.
- CI workflow display/job terminology updated.

Still intentionally retained:
- `apps/map-editor/` technical directory path.
- Legacy `/editor` is now a redirect to `/world-builder`.
- Database/RPC names that are existing persistence contracts.

Ganti istilah produk/UI:

- Map Editor → Vendrith World Builder
- Map → World/Region/Playable/Interior sesuai konteks
- Map asset → World Builder asset/reference bila memang editor-specific
- Editor preview → World Builder Preview

Jangan melakukan global replacement buta pada identifier teknis atau historical documentation.

**Output:** vocabulary resmi World Builder.

### Phase 2 — Asset/Folder Boundary

Evaluasi `assets/map-editor/`.

Pisahkan secara konseptual:

- **Editor-only:** UI, gizmo, cursor, thumbnail, navigation helper, selection helper.
- **WORLD:** natural terrain/environment.
- **REGION:** regional/location context.
- **PLAYABLE:** exterior gameplay content.
- **INTERIOR:** interior map content.

WORLD/REGION/PLAYABLE/INTERIOR tidak perlu menjadi physical duplicate library.

**Output:** canonical ownership + role binding yang jelas.

### Phase 3 — World Builder Data Model

Bangun model authoring:

```
World
├── Regions
│   ├── Region
│   │   ├── Playable Maps
│   │   │   ├── Buildings
│   │   │   ├── Architecture
│   │   │   ├── Interactables
│   │   │   ├── Resource Nodes
│   │   │   ├── Crafting Stations
│   │   │   ├── Combat Interactables
│   │   │   ├── Gameplay Props
│   │   │   └── Vehicles
│   │   └── Buildings
│   │       └── Interiors
│   │           ├── Floors
│   │           └── Rooms
└── Natural World
    ├── Ground
    ├── Water
    ├── Mountains
    ├── Hills
    ├── Cliffs
    ├── Forest
    ├── Jungle
    ├── Desert
    ├── Swamp
    └── Snow Biomes
```

Gunakan reference/binding, bukan duplikasi binary.

### Phase 4 — Editor UI

Target UI:

```
VENDRITH WORLD BUILDER
├── World Browser
├── Region Browser
├── Playable Map Editor
├── Interior Editor
├── Asset Browser
├── Layer Panel
├── Properties / Inspector
├── Building / Room Hierarchy
├── Entry Point Manager
└── Validation / Provenance Panel
```

Asset Browser harus membedakan:

- canonical asset
- map-role binding
- source/provenance
- license
- attribution
- verification status

### Phase 5 — Layer-aware Editing

World Builder harus memahami role secara eksplisit:

- WORLD tidak menerima bangunan/kapal/desa sebagai natural terrain.
- REGION tidak menjadi tempat penyimpanan bangunan individual.
- PLAYABLE menerima exterior buildings/architecture dan gameplay bindings.
- INTERIOR menerima indoor construction/furniture/interior gameplay bindings.
- Living entities tetap berada pada Life Generation, bukan dipindahkan menjadi PLAYABLE asset library.

### Phase 6 — Building & Interior Workflow

Workflow utama:

```
Region
  ↓
Select Building
  ↓
Edit Exterior (PLAYABLE)
  ↓
Open Interior
  ↓
Select Floor
  ↓
Select Room
  ↓
Place Interior Assets
  ↓
Configure Entry Points
  ↓
Validate
```

Gunakan hubungan:

- `building_id`
- `floor_level`
- `room_id`
- `entry_id`
- `asset_id`
- `parent_region`

### Phase 7 — Validation

World Builder harus memvalidasi:

1. Layer role
2. Medieval-fantasy compatibility
3. Asset reference validity
4. Duplicate/broken reference
5. Building → interior linkage
6. Floor/room hierarchy
7. Entry/exit linkage
8. Gameplay binding
9. Provenance
10. License/attribution
11. SHA-256 ketika binary sudah tersedia

Status binary tetap **PENDING** sampai binary asli masuk dan dapat direkonsiliasi.

### Phase 8 — Migration & Cleanup

Setelah implementasi stabil:

- Migrasikan referensi kode dari Map Editor ke World Builder.
- Migrasikan konfigurasi/editor routes.
- Pertahankan historical references yang memang perlu untuk audit.
- Tandai folder/file lama sebagai legacy/deprecated sebelum penghapusan.
- Hapus hanya setelah tidak ada consumer aktif.
- Update CI dan documentation references.

## 5. Urutan Pengerjaan yang Disarankan

```
1. Terminology + architecture contract
2. Asset/map-role boundary
3. World Builder data model
4. World/Region/Playable/Interior layer model
5. World Browser
6. Region Browser
7. Playable Map Editor
8. Interior Editor
9. Asset Browser + Inspector
10. Building/Floor/Room hierarchy
11. Entry points
12. Validation
13. Provenance/license panel
14. CI/tests
15. Legacy Map Editor cleanup
16. Binary asset reconciliation
```

## 6. Definition of Done

Migrasi dianggap selesai ketika:

- Tidak ada lagi **Map Editor** sebagai nama produk utama.
- **Vendrith World Builder** menjadi entry point resmi.
- WORLD/REGION/PLAYABLE/INTERIOR memiliki boundary yang konsisten.
- Building → Floor → Room → Asset Instance dapat direpresentasikan.
- Exterior ↔ Interior entry points dapat direpresentasikan.
- Asset canonical library tidak diduplikasi hanya karena map role.
- Asset provenance/license/attribution tetap terlacak.
- Editor-only assets terpisah dari game-world roles.
- CI/test memahami struktur World Builder.
- Legacy Map Editor references hanya tersisa jika memang historis/kompatibilitas.
- Binary assets dapat direkonsiliasi kemudian tanpa mengubah taxonomy.

## 7. Hal yang Tidak Dilakukan Sekarang

- Tidak mengimpor binary asset asli.
- Tidak mengklaim asset binary sudah terverifikasi.
- Tidak memindahkan semua binary secara massal.
- Tidak menghapus `assets/map-editor/` sebelum consumer dan referensi diperiksa.
- Tidak mencampurkan Life Generation dengan PLAYABLE.
- Tidak mengubah WORLD menjadi tempat penyimpanan bangunan/kapal/desa.
- Tidak menggunakan nama "Engine Building Vendrith World".

## 8. Status Awal

- WORLD: taxonomy/source audit complete; binary pending.
- REGION: taxonomy/source audit complete; binary pending.
- PLAYABLE: taxonomy/source audit complete; binary pending.
- INTERIOR: taxonomy/source audit complete; binary pending.
- Vendrith World Builder migration: **PHASE 1 COMPLETE / TECHNICAL APP PATH RETAINED TEMPORARILY FOR COMPATIBILITY**.
