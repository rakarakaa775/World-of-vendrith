# World of Vendrith — Master Product Roadmap
## New implementation order — 2026-09-26

This document replaces the previous Map Editor roadmap.

## Guiding order

The project is intentionally completed in this order:

1. **Finish WORLD asset ingestion and verification**
2. **Rebuild the main World Builder UI / workspace navigation**
3. **Finish World Map creation and editing**
4. **Build World Preview**
5. **Integrate World Engine + Time Engine for seasonal world state**
6. **Move to REGION**
7. Continue with downstream systems after Region is stable.

The existing map-editor foundations, persistence architecture, Supabase authority, GitHub implementation source, and Vercel verification flow are preserved.

### Hard boundaries

- Do not rewrite the existing building-system foundation.
- UI work may expose and organize Building World, but does not replace the building engine.
- Asset work must remain additive and provenance-aware.
- Do not approve an asset for runtime merely because its binary exists.
- Do not invent semantic mappings, tile regions, flow values, or runtime identifiers without source evidence.
- The six local inventory work files remain untracked unless explicitly requested otherwise.

---

# Phase 0 — WORLD Asset Completion

**Goal:** Finish the WORLD asset layer before major UI work.

## 0.1 Binary ingestion

- [x] Original WORLD binaries imported to Git LFS.
- [x] WORLD source package reconciled for the imported asset families.
- [x] 681 files identified under `02_TILES_AND_TERRAIN/`.
- [x] Original binaries preserved without conversion, resize, re-encoding, or rename.
- [x] Git LFS import verified.
- [x] Binary import manifest recorded.

## 0.2 LPC Terrains provenance

- [x] 59 LPC terrain binaries reconciled against the source package.
- [x] 59/59 exact SHA-256 matches.
- [x] 0 mismatches.
- [x] Source/license provenance recorded.
- [x] Binary verification synchronized to Supabase.
- [x] Registry metadata synchronized.
- [x] Visual source audit completed.
- [x] Source geometry audit completed.

## 0.3 WORLD semantic/runtime preparation

- [x] Existing WORLD water bindings audited.
- [x] Existing WORLD transition bindings audited.
- [x] Binary evidence attached to binding records.
- [x] Visual evidence attached to binding records.
- [x] Derived v7 terrain tileset identified.
- [x] Derived v7 transition tileset identified.
- [x] Optional runtime tile-region representation added.
- [x] Exact LPC base runtime tile-region mapping for dirt/grass/sand/water; transition mapping remains Phase 2 terrain/autotile work.
- [x] Runtime candidate generation/review for verified WORLD base terrain — 4 LPC v7 candidates approved.
- [x] Runtime candidate review.
- [x] Runtime approval only after semantic verification for the four consumed base terrain bindings.
- [x] Verify every registered WORLD asset family has a usable registry path.
- [x] Verify WORLD Asset Browser can enumerate the final approved registry.
- [x] WORLD asset validation pass.
- [x] WORLD asset credits / attribution registry view.
- [x] WORLD asset completion checkpoint — 2026-09-26.

### Phase 0 completion rule

WORLD is considered **asset-complete** only when:

- source binaries are present;
- provenance is recorded;
- required registry records exist;
- semantic classification is recorded where applicable;
- runtime mappings are verified where the editor consumes them;
- no unresolved binary provenance mismatch remains;
- Asset Browser can discover the approved WORLD inventory.

**Phase 0 status: COMPLETE.**

---

# Phase 1 — World Builder UI / Main Workspace

**Goal:** Turn the current editor into the main World of Vendrith workspace.

This phase is now the active UI integration phase. The established World Map editor remains the authoritative editing surface; new shell/navigation work is additive.

## Main menu

- [x] Preview — connected to dedicated Preview Engine workspace.
- [x] Building World — represented by the existing World editor/building foundation; no foundation rewrite.
- [x] Generate Life — reserved in Control Center for the downstream Life phase.
- [x] Spawn Life — reserved in Control Center for the downstream Life phase.
- [x] Organize the World — reserved in Control Center for the downstream organization phase.
- [x] Library Asset — reserved in Control Center; global Asset Library implementation remains Phase 8.
- [x] World Map — existing World Builder editor remains the authoritative map surface.
- [x] World Settings — reserved in Control Center / downstream workspace integration.
- [x] Weather — reserved for World Engine / Time Engine integration.
- [x] Time / Seasons — reserved for World Engine / Time Engine integration.
- [x] Validation — validation surfaces exist in the editor/runtime foundation; broader publish validation remains later phase work.
- [x] Save / Load / Versions — existing World Builder persistence and save-slot surface preserved.
- [x] Project / World management — Control Center and World Builder project context are established.

## Workspace behavior

- [x] Persistent navigation
- [x] Active workspace state
- [x] Breadcrumbs
- [x] World/project selector
- [x] Contextual toolbar
- [x] Global save state
- [x] Validation status
- [x] Error/warning surface
- [x] Responsive desktop layout
- [x] Clear separation between World, Region, and Map scopes
- [x] Collapsible World Builder navigation so the canvas can use more space
- [x] Four primary World Builder scopes: World, Region, Playable, Interior
- [x] Control Center return path

## World Builder shell

- [ ] World overview/dashboard entry surface
- [x] World metadata/project context
- [ ] World hierarchy shell
- [ ] World-level settings entry surface
- [ ] Asset/library access entry surface
- [x] Navigation between the four World Builder scopes without replacing the established editor foundation

### Phase 1 current implementation boundary

The World Builder shell and Control Center are established, but downstream workspace implementations remain intentionally staged. Region/Playable/Interior currently expose additive workspace landing surfaces and do not replace or modify the existing Building World foundation.

---

# Phase 2 — WORLD Map Editor Completion

**Goal:** Finish the actual World map authoring workflow before Region.

## Terrain

- [x] World Map Studio authoring toolbar
- [x] Select / Paint / Erase / Line / Rectangle / Flood tool access
- [ ] Complete terrain brush suite
- [ ] Eraser
- [ ] Line
- [ ] Rectangle
- [ ] Flood Fill
- [ ] Multi-cell brush
- [ ] Terrain transitions
- [ ] Autotiling
- [ ] Terrain compatibility
- [ ] Edge rules
- [ ] Biome tags

## World geography

- [ ] Elevation foundation
- [ ] Height field
- [ ] Water level
- [ ] Rivers
- [ ] Lakes
- [ ] Oceans
- [ ] Streams
- [ ] Coastlines
- [ ] Roads
- [ ] Paths
- [ ] Bridges
- [ ] Forests
- [ ] Settlements
- [ ] Major landmarks

## Layers

- [ ] Complete layer tree
- [ ] Layer groups
- [ ] Visibility
- [ ] Lock
- [ ] Opacity
- [ ] Ordering
- [ ] Duplicate layer
- [ ] Merge layer
- [ ] World layer templates

## Asset placement

- [ ] Asset browser integration
- [ ] Drag/drop
- [ ] Stamp placement
- [ ] Scatter
- [ ] Random placement
- [ ] Rotation/scale variation
- [ ] Collision-aware placement
- [ ] Object inspector

## Cartography

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

## World validation

- [ ] Geometry validation
- [ ] Terrain validation
- [ ] Navigation validation
- [ ] Asset validation
- [ ] World hierarchy validation
- [ ] Publish-readiness gate

---

# Phase 3 — World Preview

**Goal:** Let the creator inspect the WORLD as a playable/visual world before full simulation.

- [x] Preview workspace shell
- [x] Camera controls
- [x] Zoom levels
- [x] World overview
- [x] Layer visibility controls
- [x] Preview-only interaction controls
- [ ] Terrain rendering from authoritative World Map
- [ ] Objects rendering from authoritative World Map
- [ ] Water rendering
- [ ] Roads/path rendering
- [ ] Labels/POIs
- [ ] Performance profiling
- [ ] Preview validation report

**Current status:** Preview workspace UI/interaction shell is established; authoritative runtime rendering remains a later implementation step and must not be inferred from the mock preview scene.

---

# Phase 4 — World Engine + Time Engine

**Goal:** Make the created WORLD respond to time and seasonal state.

## World Engine

- [ ] Runtime world state
- [ ] World state loading
- [ ] World entity projection
- [ ] World navigation projection
- [ ] Dynamic world state
- [ ] Simulation state boundary
- [ ] Preview/runtime separation

## Time Engine

- [ ] World clock
- [ ] Calendar
- [ ] Day/night
- [ ] Dawn/dusk
- [ ] Moon phase
- [ ] Seasons
- [ ] Seasonal state transitions
- [ ] Time persistence
- [ ] Deterministic time state

## Seasonal WORLD

- [ ] Seasonal terrain
- [ ] Seasonal vegetation
- [ ] Seasonal water presentation
- [ ] Seasonal weather hooks
- [ ] Seasonal visual transitions
- [ ] Preview seasonal controls

### Phase 4 completion rule

A WORLD created in the editor must be previewable under different seasonal states without rebuilding the underlying world data.

---

# Phase 5 — Region System

Only begin this phase after WORLD is complete through Phase 4.

## Region

- [ ] Region hierarchy
- [ ] Region boundaries
- [ ] Region metadata
- [ ] Region assets
- [ ] Region terrain
- [ ] Region map authoring
- [ ] Region/world relationship
- [ ] Region preview
- [ ] Region validation
- [ ] Region publishing

---

# Phase 6 — Life & World Organization

This phase turns the world into an organized living world.

## Generate Life

- [ ] Population generation
- [ ] Flora generation
- [ ] Fauna generation
- [ ] Settlement population
- [ ] Resource distribution
- [ ] Deterministic seed
- [ ] Generation preview
- [ ] Generation validation

## Spawn Life

- [ ] Manual spawn
- [ ] Spawn points
- [ ] Spawn rules
- [ ] Spawn validation
- [ ] Spawn visualization

## Organize the World

- [ ] World entities
- [ ] Organizations
- [ ] Factions
- [ ] Settlements
- [ ] Territories
- [ ] Relationships
- [ ] Ownership
- [ ] World-state organization

---

# Phase 7 — Building World

The existing building-system foundation remains intact.

- [ ] Building World workspace
- [ ] Building browser
- [ ] Building placement UI
- [ ] Building inspector
- [ ] Building groups
- [ ] Interior/exterior navigation
- [ ] Door connections
- [ ] Building/world relationships
- [ ] Building preview

**Boundary:** UI integration only until the existing building engine is explicitly audited and ready for further changes.

---

# Phase 8 — Asset Library

The Asset Library becomes the central discovery layer for all approved assets.

- [ ] Global asset browser
- [ ] Search
- [ ] Categories
- [ ] Tags
- [ ] Favorites
- [ ] Recent assets
- [ ] Collections
- [ ] Preview
- [ ] Provenance
- [ ] License information
- [ ] Runtime readiness
- [ ] Asset validation
- [ ] WORLD / REGION / INTERIOR / PLAYABLE separation

---

# Phase 9 — Reliability / Publishing

- [ ] Autosave hardening
- [ ] Offline queue
- [ ] Conflict UI
- [ ] Snapshot comparison
- [ ] Version history
- [ ] Restore
- [ ] World validation
- [ ] Publish workflow
- [ ] Full project backup
- [ ] Full project restore

---

# Phase 10 — Performance

- [ ] Virtualized canvas
- [ ] Chunked WORLD data
- [ ] Lazy asset loading
- [ ] Asset caching
- [ ] Spatial indexing
- [ ] Object culling
- [ ] Terrain chunking
- [ ] Worker generation
- [ ] Background persistence
- [ ] Large WORLD stress test
- [ ] 100k+ object target

---

# Product-level Definition of Done

The primary World workflow is complete when a creator can:

**Create World → Configure World → Select Assets → Build World Map → Paint Terrain → Place World Assets → Organize World → Generate/Spawn Life → Preview World → Run World Engine → Advance Time → Change Seasons → Save → Reopen → Validate → Publish**

Then:

**World → Region → Region Map → Region Preview → Region Runtime**

---

# Implementation policy

### Source of truth

- **GitHub:** implementation, migrations, documentation, source-controlled assets/manifests.
- **Supabase:** authoritative world/editor state, registry, bindings, persistence, validation state.
- **Asset Library:** binary assets, provenance, metadata and discovery.
- **Vercel:** deployment and browser/runtime verification.

### Change policy

Every phase must preserve already-verified foundations.

Before changing a subsystem:

1. inspect the current implementation;
2. inspect the current Supabase schema/data;
3. verify the existing runtime contract;
4. make the smallest additive change;
5. test;
6. document;
7. only then promote/approve.

### Current priority

**Phase 1 UI/workspace integration is active.**

The next implementation work should deepen the established World Map workflow and Preview without entering Region runtime, Life generation, or rewriting the Building foundation.
