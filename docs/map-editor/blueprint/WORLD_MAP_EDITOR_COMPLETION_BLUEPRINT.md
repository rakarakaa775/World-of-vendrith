# World Map Editor — Completion Blueprint
## 2026-10-02

Blueprint ini menjadi kontrak teknis untuk implementasi Phase 2 completion.
Ia melengkapi blueprint terrain paint dan save/load recovery yang sudah ada.

---

# 1. Architecture Boundary

```
MapDocument
 ├─ Terrain Engine
 ├─ Water Engine
 ├─ Brush Engine
 ├─ Selection Engine
 ├─ Validation
 ├─ Serialization
 ├─ Layer Rules
 └─ Object Rules
        ↓
   Editor Commands
        ↓
   Editor UI / Tool State
        ↓
   Pixi Runtime Projection
        ↓
   Debug / Preview Overlays
```

Aturan:
- Core engine tidak bergantung pada React/Pixi.
- Renderer tidak menjadi source of truth.
- Debug overlay tidak menulis document.
- Derived water/visual state boleh dihitung ulang dari document.
- Save hanya menyimpan authoring state yang memang merupakan source of truth.

---

# 2. Terrain Contract

Terrain cell menyimpan semantic terrain identifier.

17 WORLD base terrain:
`grass, grassalt, sand, redsand, dirt, dirt2, pavement, water,
deepwater, deepwater2, brackish, tallgrass, hole, holek, holemid,
lava, lavarock`.

Water-facing authoring rule:
- User memilih land terrain.
- User tidak memilih water depth secara manual.
- Water depth diturunkan oleh Water Engine.
- Rebuild setelah load harus menghasilkan hasil yang sama.

---

# 3. Brush Contract

Setiap tool menerima:

```ts
type BrushCommand = {
  tool: ToolKind;
  points: GridPoint[];
  tileId?: string | null;
  size?: number;
};
```

Pipeline:

```
pointer input
 → grid coordinates
 → brush geometry
 → affected cells
 → terrain command
 → derived water update
 → document revision
 → renderer projection
 → history transaction
```

Satu gesture paint harus menjadi satu logical undo transaction.

---

# 4. Selection Contract

Selection adalah editor state, bukan MapDocument content.

```
SelectionState
 ├─ cells
 ├─ bounds
 └─ mode
```

Selection dapat digunakan oleh:
- paint
- replace
- copy
- paste
- delete
- transform

Selection tidak boleh mengubah document sampai command dieksekusi.

---

# 5. Transition / Autotile Contract

Terrain semantic dan visual transition dipisahkan.

```
semantic terrain
      ↓
neighbor query
      ↓
compatibility / transition rule
      ↓
mask
      ↓
visual tile / fallback
```

Transition rules harus:
- deterministic
- testable tanpa renderer
- fallback-safe
- tidak mengubah terrain ID hanya karena renderer membutuhkan tile lain.

Jika dual-grid digunakan, corner mask menjadi implementation detail visual,
bukan bagian wajib dari persisted terrain semantic.

---

# 6. Water Contract

Water tetap derived.

```
land
 ↓ 1
water
 ↓ 2
brackish
 ↓ 3–4
deepwater2
 ↓ 5+
deepwater
```

Water Engine:
1. mencari sumber land;
2. menghitung distance field;
3. mengklasifikasikan water cells;
4. menulis hasil derived terrain ke ground projection sesuai kontrak saat ini;
5. memastikan hasil deterministic.

Perubahan land harus memicu recomputation pada area yang relevan.

---

# 7. Visual Variation Contract

Visual variation tidak disimpan sebagai random state per cell.

Gunakan deterministic function:

```
variant = f(worldSeed, x, y, terrainId)
```

Dengan demikian:
- save/load tidak mengubah tampilan;
- map yang sama menghasilkan variation yang sama;
- tidak ada ribuan random values yang harus dipersist.

---

# 8. Debug View Contract

Debug views adalah projection:

```
MapDocument
   ↓
DebugProjection
   ↓
Overlay
```

Mode minimum:
- Grid
- Terrain ID
- Water depth
- Collision/passability
- Layer isolation
- Object bounds
- Invalid cells

Tidak boleh ada debug mode yang mengubah persisted MapDocument.

---

# 9. Layer Contract

Layer memiliki:
- id
- kind
- visibility
- lock
- opacity
- order

Layer operations harus menggunakan command/history model dan menjaga identity.

Merge/duplicate hanya boleh dilakukan jika semantics dan serialization telah
ditentukan dengan jelas.

---

# 10. Object Contract

Object authoring dipisahkan dari terrain.

```
ObjectInstance
 ├─ id
 ├─ assetId
 ├─ position
 ├─ rotation
 ├─ scale
 ├─ layerId
 └─ metadata
```

Asset browser menyediakan asset identity/provenance.
Object placement hanya menyimpan reference dan transform authoring.

Renderer dapat menurunkan:
- sprite
- bounds
- collision proxy
- visual variant

tanpa mengubah object source data.

---

# 11. Scatter Contract

Scatter harus deterministic:

```
seed + region + assetId + cell
        ↓
deterministic placement
```

Generated scatter tidak disimpan sebagai ribuan random decisions bila dapat
diregenerasi dari source parameters.

Manual placements tetap persisted.

---

# 12. Geography Contract

Geography seperti river/road/bridge harus menjadi semantic entities atau
structured map data, bukan sekadar pixel decoration.

Contoh:

```
River
 ├─ id
 ├─ path
 ├─ width
 ├─ source
 └─ destination
```

Renderer kemudian menghasilkan visual representation.

---

# 13. Validation Contract

Validation dibagi:

### Structural
- schema
- layer
- cell
- object
- references

### Semantic
- terrain compatibility
- water consistency
- geography consistency
- asset runtime mapping

### Runtime
- renderer fallback
- out-of-bounds
- missing texture
- object/collision mismatch

### Publish
- semua required checks lulus
- tidak ada unresolved blocking error

Validation tidak boleh diam-diam memperbaiki source document.

---

# 14. Save/Load Contract

Semua fitur baru wajib melalui kontrak save/load yang sudah dikunci.

Minimum regression:
- edit
- save
- reload
- compare semantic state
- verify derived water
- verify objects
- verify layer state
- verify no stale local seed replaces authoritative document.

---

# 15. Undo/Redo Contract

Setiap mutating command harus:
- menghasilkan before/after yang jelas;
- dapat di-undo;
- dapat di-redo;
- tidak memecah satu gesture menjadi ratusan history entries;
- tidak menyimpan renderer state sebagai history source.

---

# 16. Performance Contract

Pure core operations harus dapat dipindahkan ke worker bila diperlukan.

Prioritas:
1. avoid full-map recomputation bila local recompute cukup;
2. avoid unnecessary Pixi redraw;
3. cache derived masks;
4. lazy-load assets;
5. gunakan spatial/chunk boundaries saat map membesar.

Optimisasi tidak boleh mengubah semantic result.

---

# 17. Testing Matrix

Setiap subsystem minimal memiliki:

### Unit
Pure terrain/brush/water/selection/validation functions.

### Integration
MapDocument + command + history + derived systems.

### Persistence
Serialize → save → load → semantic equality.

### Runtime
Actual browser canvas verification.

### Regression
Historical save/load identity, white canvas, water gradient, and paint failures.

---

# 18. Implementation Order

Urutan wajib:

1. Terrain brush suite
2. Selection tools
3. Transition/autotile foundation
4. Debug views
5. Layer system
6. Object placement
7. Geography
8. Cartography
9. Validation
10. Performance

Jangan melompati urutan hanya untuk menambah UI yang belum mempunyai
semantic contract.

---

# 19. Definition of Done

Sebuah fitur dianggap selesai hanya jika:

- source contract ada;
- implementation ada;
- unit/integration test ada bila relevan;
- browser runtime sudah diverifikasi;
- save/load tetap valid;
- undo/redo valid;
- tidak melanggar FOUNDATION_LOCK;
- status/log diperbarui.

---

# 20. Open-source Patterns Adopted

Terinspirasi dari pola yang kita review:
- command-based undo/redo;
- pure core map operations;
- deterministic terrain variation;
- derived doodad/scatter concepts;
- debug/passability views;
- brush/selection workflow;
- asset browser/object placement;
- versioned/validated map representation.

Kita tidak menyalin implementasi atau storage model proyek lain.
