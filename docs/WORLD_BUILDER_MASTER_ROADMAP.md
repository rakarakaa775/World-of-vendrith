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
- [ ] Runtime candidate review.
- [ ] Runtime approval only after semantic verification.
- [x] Verify every registered WORLD asset family has a usable registry path.
- [ ] Verify WORLD Asset Browser can enumerate the final approved registry.
- [ ] WORLD asset validation pass.
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

---

# Phase 1 — World Builder UI / Main Workspace

**Goal:** Turn the current editor into the main World of Vendrith workspace.

This phase is primarily UI/navigation organization. It must not destabilize the established editor engines.

## Main menu

Create a persistent World Builder shell containing:

- [ ] Preview
- [ ] Building World
- [ ] Generate Life
- [ ] Spawn Life
- [ ] Organize the World
- [ ] Library Asset
- [ ] World Map
- [ ] World Settings
- [ ] Weather
- [ ] Time / Seasons
- [ ] Validation
- [ ] Save / Load / Versions
- [ ] Project / World management

## Workspace behavior

- [ ] Persistent navigation
- [ ] Active workspace state
- [ ] Breadcrumbs
- [ ] World/project selector
- [ ] Contextual toolbar
- [ ] Global save state
- [ ] Validation status
- [ ] Error/warning surface
- [ ] Responsive desktop layout
- [ ] Clear separation between World, Region, and Map scopes

## World Builder shell

- [ ] World overview/dashboard
- [ ] World metadata
- [ ] World hierarchy
- [ ] World-level settings
- [ ] Asset/library access
- [ ] Navigation between World tools without losing editor state

---

# Phase 2 — WORLD Map Editor Completion

**Goal:** Finish the actual World map authoring workflow before Region.

## Terrain

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

- [ ] Preview workspace
- [ ] Camera controls
- [ ] Zoom levels
- [ ] World overview
- [ ] Terrain rendering
- [ ] Objects rendering
- [ ] Water rendering
- [ ] Roads/path rendering
- [ ] Labels/POIs
- [ ] Layer visibility controls
- [ ] Preview-only interaction mode
- [ ] Performance profiling
- [ ] Preview validation report

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

**Finish Phase 0 — WORLD assets.**

Do not begin the major World Builder UI overhaul until the WORLD asset completion checkpoint is reached.
