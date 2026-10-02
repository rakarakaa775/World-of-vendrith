# Map Editor Save / Load Recovery Blueprint

Status: Active reference
Version: 1.0
Scope: World Map / Region Map / Playable Map
Last verified baseline: 2026-09-30

## 1. Purpose

Blueprint operasional untuk memahami, mendiagnosis, dan memperbaiki Save/Load tanpa mengulang investigasi dari nol. Ini melengkapi MAP_EDITOR_SAVE_LOAD_CONTRACT.md: contract mendefinisikan aturan, dokumen ini mendefinisikan jalur runtime dan recovery.

Masalah yang menjadi dasar blueprint:
- editor document vs parent document berbeda;
- Quick Save memakai snapshot stale;
- Load Latest dapat membaca cache/snapshot lama;
- mismatch seed document dan authoritative map identity;
- EditorShell history/mirror terbawa dari document lama;
- World Builder route memaksa mode create;
- persisted ground cells bernilai null sehingga canvas putih;
- normalization diperlukan saat Load;
- authoritative version perlu diverifikasi setelah commit.

## 2. Source of Truth

Urutan otoritas:

    Authoritative MapDocument
             ↓
    validated serialized snapshot
             ↓
    authoritative map version
             ↓
    Load Latest / Load Slot
             ↓
    editor runtime document
             ↓
    derived projections / renderer

Jangan menjadikan canvas, parent React state, browser cache, runtime projection, atau derived cells sebagai source of truth ketika mendiagnosis persistence.

Save:

    Editor-owned document
      → identity validation
      → document validation
      → serialization
      → authoritative commit
      → authoritative read-back verification
      → projection/reconciliation

Load:

    requested map identity
      → authoritative snapshot read
      → identity validation
      → schema/document validation
      → world normalization
      → replace EditorShell document/history atomically
      → render

## 3. Identity Contract

Setiap document harus membawa id, mapType, dimensions, layers, dan metadata schema/version yang diwajibkan.

Identity harus konsisten:

    local editor document == connected authoritative document

Jika muncul SAVE_DOCUMENT_IDENTITY_MISMATCH, cek langsung:
- local.id
- local.mapType
- connected.id
- connected.mapType

Jangan memperbaiki dengan mengganti ID secara paksa. Cari sumber document yang membuat identity berbeda.

Contoh map World yang dipakai dalam audit:
- map id: 87ba34eb-5a75-42fa-8919-63e44b700c02
- map type: world

ID tersebut adalah referensi audit, bukan nilai yang boleh di-hard-code untuk map lain.

## 4. Save Pipeline

### Quick Save

Quick Save harus memakai document yang sedang dimiliki EditorShell/editor, bukan snapshot parent yang mungkin tertinggal.

    Paint/Edit
      → EditorShell current document
      → Quick Save(document)
      → parent save(document)
      → validate identity
      → validate MapDocument
      → read authoritative remote version
      → resolve stale-version situation
      → three-way merge bila diperlukan
      → commit expected version
      → new authoritative version
      → read authoritative snapshot
      → verify saved cells
      → update base document/version

### Save Slot

Save Slot menyimpan snapshot/version yang berasal dari document authoritative yang benar. Slot adalah reference ke snapshot/version, bukan source of truth baru.

    current MapDocument → authoritative save/version → Save Slot N

### Save must never silently succeed

Jika save gagal:
- jangan tampilkan Saved;
- tampilkan stage error;
- pertahankan editor document yang sedang diedit;
- jangan mengganti document dengan snapshot lama;
- jangan menyamarkan error sebagai projection/rendering issue.

## 5. Stale Version / Three-Way Merge

Jika local berada pada version N tetapi remote sudah N+K, jangan langsung overwrite remote.

Gunakan:
- base = document saat local state dibuka/terakhir authoritative;
- local = document yang sedang diedit;
- remote = document authoritative terbaru.

Resolusi:
- local == remote → local;
- local == base → remote;
- remote == base → local;
- semuanya berbeda → conflict.

Jika commit berhasil, authoritative version menjadi N+1 dan base document harus diperbarui ke committed document.

Jika conflict nyata terjadi, jangan menyamarkannya sebagai successful save.

## 6. Load Latest Pipeline

Load Latest harus membaca authoritative snapshot terbaru, bukan hanya object/cache connection yang sudah ada.

    Load Latest
      → resolve current map identity
      → fresh authoritative snapshot read
      → validate persisted identity
      → validate schema
      → deserialize
      → normalizeWorldCanvas()
      → replace editor document
      → reset/replace history for loaded document
      → render

Jika Load Latest terlihat seperti version lama, cek authoritative version, fresh read vs cached connection, map identity, requested version, snapshot yang dideserialize, normalization, dan EditorShell replacement.

## 7. Load Slot Pipeline

    Load Slot N
      → validate slot N
      → resolve map identity
      → read slot snapshot/version
      → validate ownership/map identity/map type
      → deserialize
      → normalize
      → replace EditorShell document/history atomically
      → render

Load Slot harus menghasilkan document dengan identity yang sama dengan map yang sedang dibuka.

## 8. Critical Rule: Do Not Mount a Seed Over Authority

Salah satu akar bug terbesar adalah route membuat local seed document sebelum authoritative document selesai dimuat.

Bug pattern:

    startMode = create
      → local seed dibuat
      → EditorShell mounted
      → authoritative map selesai ditemukan/dimuat
      → history/mirror masih membawa seed
      → Save menerima document dengan ID berbeda
      → SAVE_DOCUMENT_IDENTITY_MISMATCH

Mismatch yang pernah ditemukan:
- local: world-map-1790873960886/world
- connected: 87ba34eb-5a75-42fa-8919-63e44b700c02/world

Rule untuk route World Builder authoritative:
- startMode = load;
- jangan mount EditorShell sebelum authoritative document siap;
- reset EditorShell ketika terjadi document replacement, misalnya dengan key berbasis active.id + loadRevision.

## 9. Document Replacement vs Normal Edit

Normal edit:

    paint → new MapDocument object → same map identity → history tetap berjalan

Jangan reset history hanya karena object reference berubah.

Load:

    Load Latest / Load Slot → document replacement → history lama diganti/reset atomically

Jika dua event ini diperlakukan sama, dapat muncul save document lama, undo/redo lintas snapshot, atau Load yang terlihat benar tetapi Quick Save mengembalikan state lama.

## 10. World Canvas Normalization

Snapshot lama dapat memiliki ground.cells[].tileId = null. Jika renderer tidak memiliki terrain, hasilnya canvas putih/kosong.

Untuk World Map, normalization saat load harus memastikan setiap ground cell memiliki terrain valid.

Baseline:

    missing ground tile → deepwater

Setelah itu water-depth gradient dapat direbuild:

    land
      ↓
    water       1 cell
      ↓
    brackish    2 cells
      ↓
    deepwater2  3–4 cells
      ↓
    deepwater   5+ cells

Normalization dilakukan setelah snapshot berhasil dibaca/dideserialize dan sebelum document diberikan ke editor.

## 11. Authoritative Save Verification

Jangan berhenti pada response success dari commit.

    commit
      → read authoritative snapshot
      → compare expected document
      → verify critical cells
      → accept save

Verifikasi minimal:
- cell count;
- dimensions;
- layer identity;
- ground layer;
- terrain cell yang baru diedit;
- version number;
- map identity;
- map type.

Jika editor meminta redsand tetapi authoritative read-back berisi deepwater, save harus dianggap mismatch walaupun RPC commit mengembalikan success.

## 12. Projection Separation

Projection seperti map_cells, objects, collision, navigation/geometry, dan runtime rendering state bukan otomatis source of truth.

Urutan diagnosis:

    MapDocument → authoritative version → projection → renderer

Jika authoritative snapshot benar tetapi canvas salah, audit projection/normalization/renderer. Jika authoritative snapshot salah, audit Save pipeline/database commit. Jangan memperbaiki renderer untuk bug persistence.

## 13. Error Classification

| Error | Periksa |
|---|---|
| IDENTITY_ERROR | map id, map type, connected document |
| SAVE_DOCUMENT_IDENTITY_MISMATCH | local vs authoritative document |
| DOCUMENT_VALIDATION_ERROR | dimensions, layers, schema |
| SERIALIZATION_ERROR | snapshot conversion |
| PERSISTENCE_ERROR | RPC/database commit |
| SLOT_ERROR | slot number/ownership/reference |
| LOAD_ERROR | authoritative read |
| DESERIALIZATION_ERROR | persisted snapshot shape |
| PROJECTION_ERROR | derived/runtime projection |
| canvas putih | null cells, normalization, renderer |

Jangan mengubah semua error menjadi Save failed atau Load failed tanpa stage.

## 14. Fast Diagnostic Checklist

### A. Paint benar, Save kembali ke deepwater

1. Apakah diagnostic paint menunjukkan target ground?
2. Apakah Quick Save menerima document terbaru dari EditorShell?
3. Apakah local.id == connected.id?
4. Apakah local.mapType == connected.mapType?
5. Apakah route membuat seed document?
6. Apakah EditorShell sudah mounted sebelum authoritative load selesai?
7. Berapa authoritative version sebelum Save?
8. Berapa version setelah Save?
9. Apa isi authoritative snapshot setelah commit?
10. Apakah read-back menunjukkan terrain yang sama?

Jangan langsung menyalahkan database.

### B. Load Latest mengambil state lama

1. authoritative version;
2. fresh read vs cached connection;
3. map identity;
4. requested version;
5. snapshot yang benar-benar dideserialize;
6. normalization;
7. EditorShell replacement.

### C. Load berhasil tetapi canvas putih

1. ground layer ada?
2. ground.cells memiliki null tile?
3. normalization berjalan?
4. null ground berubah menjadi deepwater?
5. water gradient dijalankan?
6. renderer menerima document hasil normalization?

### D. Save gagal identity mismatch

Periksa local.id, connected.id, local.mapType, connected.mapType, route startMode, EditorShell mount timing, dan loadRevision.

## 15. Known Fix History

| Commit | Fungsi |
|---|---|
| 56c5912 | Save memakai editor-owned document |
| e8bedd1 | Quick Save meneruskan current document |
| 56eea25 | Quick Save diarahkan melalui current document |
| 32f282eed0b9e824374eb15556774cccc84cc28c | Save trace dibuat |
| e0fd84c95eabfe9fd59674f3b0e35c82623014db | Trace local/base/remote/resolved/serialized |
| c793be61940394c41f82994e9fa4eab35147f0f6 | Trace ground-cell mismatch |
| 5cb9eb2a7819ada69b80ef985450e1b0d753a5e1 | Authoritative post-commit verification |
| 6fac478051838bacf9e4008cb350090ba686dc57 | Parent save input trace + identity check |
| f5bccc18e72f0695d07c20eff3e41179395bd073 | Exact save error surfaced to UI |
| 0d1702022c63415be5b5e6edc6d771c638897f65 | EditorShell gated until authoritative document ready |
| 7a67455d4d302b2bf15d61c02cc555ab84e93cb8 | World Builder route create → load |
| b0c7c9e3ca055b9adcdab84dfad0e19403dcb004 | Null World ground cells normalized to deepwater |

Short hashes di tabel adalah shorthand dokumentasi. Untuk audit Git gunakan full SHA dari repository history.

## 16. Database Rule

Jangan mengubah migration lama hanya untuk memperbaiki bug runtime yang sebenarnya berasal dari frontend state/identity.

Runtime stale-snapshot protection sudah berada pada migration/database state yang lebih baru:

    20260917052620_guard_runtime_snapshot_against_stale_versions

Function yang pernah diaudit:
- public.map_editor_get_runtime_snapshot_v1
- public.map_editor_commit_merge_v1

Commit merge memakai expected version dan three-way merge. Jika bug baru muncul, audit frontend input dan authoritative snapshot terlebih dahulu sebelum membuat migration baru.

## 17. Regression Test Minimum

### Save
- paint cell;
- Quick Save;
- verify authoritative version naik;
- verify authoritative snapshot menyimpan cell baru;
- reload;
- verify cell tetap.

### Save + stale remote
- load base;
- edit local;
- ubah remote;
- Quick Save;
- verify conflict-free merge;
- verify real conflict tidak silent overwrite.

### Load Latest
- save version N;
- save version N+1;
- Load Latest;
- verify N+1;
- verify editor identity;
- verify history replacement.

### Load Slot
- Save Slot N;
- edit map;
- Load Slot N;
- verify exact slot snapshot;
- verify history replacement.

### Null ground
- persisted snapshot dengan null ground cells;
- Load;
- verify all ground cells have valid terrain;
- verify canvas tidak putih.

### Identity
- inject mismatched local/connected IDs;
- verify SAVE_DOCUMENT_IDENTITY_MISMATCH;
- verify no silent database write.

## 18. Recovery Order

Jika Save/Load rusak lagi, ikuti urutan ini dan jangan melompat:

    1. Reproduce
       ↓
    2. Capture visible error + version
       ↓
    3. Capture local document identity
       ↓
    4. Capture connected/authoritative identity
       ↓
    5. Inspect EditorShell current document
       ↓
    6. Inspect parent save/load input
       ↓
    7. Inspect route startMode + mount timing
       ↓
    8. Inspect authoritative DB snapshot/version
       ↓
    9. Inspect serialization/deserialization
       ↓
   10. Inspect normalization
       ↓
   11. Inspect projection
       ↓
   12. Inspect renderer

Pada setiap tahap tanyakan: Apakah data sudah salah di sini?

Begitu titik pertama yang salah ditemukan, audit berhenti di sana sampai akar masalah diperbaiki.

## 19. Golden Rules

> Jika Paint benar tetapi Save salah, audit document identity dan Save input sebelum database.

> Jika Save benar tetapi Load salah, audit authoritative read, cache, normalization, dan document replacement.

> Jika data Load benar tetapi canvas salah, audit normalization/projection/renderer.

> Jika identity mismatch muncul, jangan menyamakan ID secara paksa; cari siapa yang membuat document stale.

> Load adalah document replacement. Paint adalah normal edit. Jangan perlakukan keduanya sebagai event yang sama.

## 20. Definition of Done

- [ ] Quick Save menyimpan document terbaru dari editor.
- [ ] Save Slot menyimpan snapshot yang benar.
- [ ] Load Latest selalu membaca authoritative latest.
- [ ] Load Slot mengembalikan snapshot slot yang benar.
- [ ] Identity map dan map type konsisten.
- [ ] Stale version tidak silent overwrite.
- [ ] Three-way merge/conflict workflow tetap aktif.
- [ ] Successful save diverifikasi melalui authoritative read-back.
- [ ] Failed save tidak dilaporkan sebagai success.
- [ ] Failed load tidak merusak document aktif.
- [ ] Load mengganti history secara atomik.
- [ ] Normal edit tidak mereset history.
- [ ] Null World ground cells dinormalisasi.
- [ ] Canvas tidak menjadi putih karena missing ground terrain.
- [ ] Projection failure tidak menghapus authoritative document.
- [ ] Regression tests mencakup identity, save, load, slot, stale version, dan null ground.

## Related Documents

- docs/map-editor/blueprint/MAP_EDITOR_SAVE_LOAD_CONTRACT.md
- docs/map-editor/blueprint/MAP_EDITOR_DATABASE_CONTRACT.md
- docs/map-editor/blueprint/MAP_EDITOR_TECHNICAL.md
- docs/map-editor/blueprint/MAP_EDITOR_BIBLE.md
- docs/map-editor/MAP_EDITOR_STATUS_LOG.md
- docs/map-editor/MAP_EDITOR_CHANGELOG.md