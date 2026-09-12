# Vandrith Map Editor — Master Roadmap

Target: **Incarnate-class world-building editor**.

## Legend
- [x] Done / verified
- [~] Partial / foundation exists
- [ ] Not yet complete

## Current Status — 2026-09-12

- **Foundation & persistence:** COMPLETE for the currently verified editor flow.
- **Terrain painting:** basic paint is working; advanced tools remain.
- **Save / Load:** Save, update/overwrite, Load Latest, Save Slot and Load Slot are verified working in the current deployment test.
- **Next implementation target:** Phase 1 Terrain Editing Tools.

**Storage / implementation locations**
- **GitHub** — editor UI, engine, serializers, client-side interaction.
- **Supabase** — authoritative world/editor state, persistence, commands, navigation, geometry, environment.
- **Asset Library / Storage** — asset files, metadata, manifests.
- **Vercel** — deployment and browser/runtime verification.

---

## 0. Foundation & Engine Contract

- [x] MapDocument canonical model — GitHub
- [x] Serialization / deserialization — GitHub
- [x] Map hierarchy — GitHub + Supabase
- [x] Command architecture — GitHub + Supabase
- [x] Command groups — Supabase
- [x] Undo / Redo — GitHub MapHistory
- [~] Terrain state — GitHub + Supabase
- [~] Object state — GitHub + Supabase
- [x] Runtime snapshot — Supabase `map_editor_runtime_snapshots`
- [x] Document snapshot persistence — GitHub + Supabase
- [x] Terrain resolver — Supabase
- [x] Environment resolver — Supabase
- [x] Navigation projection — Supabase
- [x] Object footprint — Supabase
- [x] Object geometry / OBB — Supabase
- [x] Collision foundation — Supabase
- [x] Selection model — Supabase `map_editor_selections`
- [x] Clipboard model — Supabase `map_editor_clipboards`
- [x] Gizmo sessions — Supabase `map_editor_gizmo_sessions`
- [x] Snap settings — Supabase `map_editor_snap_settings`
- [x] Layer rules — Supabase `map_editor_layer_rules`
- [x] Validation/readiness gate — GitHub
- [~] Autosave — GitHub + Supabase
- [~] Crash recovery integration — GitHub + browser localStorage
- [x] Save / Load baseline — GitHub + Supabase
- [~] Save / Load controller tests — GitHub
- [~] Save status state machine — GitHub
- [~] Network-loss persistence queue — GitHub
- [~] Conflict detection foundation — GitHub
- [~] Conflict resolution model — GitHub
- [~] Snapshot comparison diff model — GitHub

---

## 1. Professional 2D Canvas

- [~] Pan — GitHub UI
- [~] Zoom — GitHub UI
- [ ] Zoom-to-selection — GitHub UI
- [ ] Zoom-to-map — GitHub UI
- [ ] Fit canvas — GitHub UI
- [ ] Minimap — GitHub UI
- [ ] Coordinate ruler — GitHub UI
- [~] Grid — GitHub + Supabase snap settings
- [~] Snap-to-grid — GitHub UI + Supabase
- [ ] Snap-to-cell — GitHub UI
- [ ] Multi-resolution zoom — GitHub UI

## 2. Selection & Transform

- [~] Single selection UI — GitHub UI
- [~] Multi-select — GitHub + Supabase
- [ ] Box selection — GitHub UI
- [ ] Shift-add / toggle selection — GitHub UI
- [ ] Select by layer/type — GitHub UI
- [ ] Select all — GitHub UI
- [~] Move — GitHub + Supabase
- [~] Rotate — GitHub + Supabase
- [~] Scale — GitHub + Supabase
- [x] Duplicate command foundation — GitHub + Supabase
- [ ] Align — GitHub UI
- [ ] Distribute — GitHub UI
- [ ] Mirror — GitHub UI
- [ ] Numeric transform — GitHub UI

## 3. Terrain Painting Engine

- [x] Cell painting foundation — GitHub
- [x] Terrain resolver — Supabase
- [x] Basic brush / paint — GitHub UI
- [x] Basic terrain palette — GitHub UI
- [ ] Eraser — GitHub UI
- [ ] Line — GitHub UI
- [ ] Rectangle — GitHub UI
- [ ] Fill — GitHub UI
- [ ] Gradient — GitHub UI
- [ ] Stamp — GitHub UI
- [ ] Terrain categories — GitHub + Supabase
- [ ] Terrain transitions — GitHub engine
- [ ] Autotiling — GitHub engine
- [ ] Multi-cell brush — GitHub engine
- [ ] Brush falloff — GitHub UI
- [ ] Brush opacity — GitHub UI
- [ ] Brush presets — GitHub + Asset Library
- [ ] Terrain compatibility rules — Supabase
- [ ] Edge rules — Supabase
- [ ] Biome tagging — Supabase
- [~] Walkability integration — Supabase navigation

## 4. Layer System

- [x] Layer model — Supabase
- [x] Layer rules — Supabase
- [~] Layer tree UI — GitHub UI
- [ ] Layer groups — GitHub + Supabase
- [~] Visibility toggle — GitHub + Supabase
- [~] Lock — GitHub + Supabase
- [ ] Opacity — GitHub UI
- [~] Ordering — Supabase
- [ ] Duplicate layer — GitHub engine
- [ ] Merge layer — GitHub engine
- [ ] Layer templates — GitHub + Asset Library
- [ ] GM-only layers — Supabase Auth
- [ ] Player-visible layers — Supabase Auth

## 5. Asset Browser

- [~] Asset browser foundation — GitHub UI
- [ ] Search — GitHub UI
- [ ] Categories — Asset Library
- [ ] Tags — Supabase / Asset Library
- [ ] Favorites — Supabase
- [ ] Recent assets — Supabase
- [ ] Collections — Supabase / Asset Library
- [ ] Preview — GitHub UI
- [~] Asset metadata — Asset Library
- [ ] Asset validation — GitHub + Supabase

## 6. Object Placement

- [x] Object persistence — Supabase
- [x] Object footprint — Supabase
- [x] OBB geometry — Supabase
- [x] Collision data — Supabase
- [~] Drag & drop — GitHub UI
- [ ] Stamp placement — GitHub UI
- [ ] Random placement — GitHub engine
- [ ] Scatter — GitHub engine
- [ ] Random rotation — GitHub engine
- [ ] Random scale — GitHub engine
- [ ] Density control — GitHub engine
- [~] Collision-aware placement — GitHub + Supabase

## 7. Procedural World Generation

- [ ] Random terrain — GitHub engine
- [ ] Biome generation — GitHub engine
- [ ] Elevation generation — GitHub engine
- [ ] River generation — GitHub engine
- [ ] Road generation — GitHub engine
- [ ] Coastline generation — GitHub engine
- [ ] Forest generation — GitHub engine
- [ ] Settlement generation — GitHub engine
- [ ] Dungeon generation — GitHub engine
- [ ] Scatter rules — GitHub engine
- [ ] Seed system — GitHub engine
- [ ] Deterministic generation — GitHub engine
- [ ] Generation preview — GitHub UI
- [ ] Procedural presets — GitHub + Supabase

## 8. Elevation & 3D-Aware Data

- [ ] Height field — Supabase + GitHub engine
- [ ] Elevation painting — GitHub UI
- [ ] Slope — GitHub engine
- [ ] Cliff — GitHub engine
- [ ] Contour — GitHub engine
- [ ] Hill / valley — GitHub engine
- [ ] Water level — Supabase + GitHub engine
- [ ] Underground levels — Supabase
- [ ] Multi-floor maps — Supabase + GitHub
- [ ] 2.5D preview — GitHub UI
- [ ] 3D preview — GitHub UI
- [ ] Height-aware objects — GitHub + Supabase

## 9. Water & Hydrology

- [ ] Rivers — GitHub engine + Supabase
- [ ] Lakes — GitHub engine + Supabase
- [ ] Oceans — GitHub engine + Supabase
- [ ] Streams — GitHub engine + Supabase
- [ ] Water boundaries — GitHub engine
- [ ] Flow direction — GitHub engine + Supabase
- [ ] Water depth — Supabase
- [ ] Shoreline generation — GitHub engine
- [ ] Wetland detection — GitHub engine
- [ ] Bridges — GitHub + Supabase
- [ ] Water traversal rules — Supabase navigation

## 10. Roads, Paths & Structures

- [ ] Road drawing — GitHub UI
- [ ] Path graph — Supabase + GitHub
- [ ] Road width — GitHub UI
- [ ] Junctions — GitHub engine
- [ ] Road/terrain integration — GitHub engine
- [ ] Building footprint — Supabase + GitHub
- [ ] Building placement — GitHub UI
- [ ] Building rotation — GitHub UI
- [ ] Interior/exterior relationship — Supabase
- [ ] Door connection — Supabase
- [ ] Structure groups — GitHub + Supabase

## 11. Navigation & Gameplay Layer

- [x] Navigation cells — Supabase
- [x] Navigation obstacles — Supabase
- [x] Navigation projection — Supabase
- [x] Object collision foundation — Supabase
- [ ] Walkability visualization — GitHub UI
- [ ] Movement cost visualization — GitHub UI
- [ ] Path preview — GitHub UI
- [ ] Pathfinding test — GitHub engine
- [ ] LOS preview — GitHub engine
- [ ] Spawn validation — Validation engine
- [ ] Trigger zones — Supabase
- [ ] Encounter zones — Supabase
- [ ] Safe zones — Supabase
- [ ] Restricted zones — Supabase

## 12. Weather & Environment

- [x] Environment catalog — Supabase
- [x] Environment resolver — Supabase
- [~] Runtime environment foundation — Supabase
- [ ] Temperature — GitHub + Supabase
- [ ] Humidity — GitHub + Supabase
- [ ] Wind — GitHub + Supabase
- [ ] Clouds — GitHub rendering
- [ ] Rain — GitHub rendering
- [ ] Snow — GitHub rendering
- [ ] Fog — GitHub rendering
- [ ] Storm — GitHub rendering
- [ ] Weather transitions — GitHub engine
- [ ] Seasonal effects — GitHub + Supabase

## 13. Time & Seasons

- [ ] World clock — GitHub + Supabase
- [ ] Calendar — GitHub + Supabase
- [ ] Day/night cycle — GitHub rendering
- [ ] Dawn / dusk — GitHub rendering
- [ ] Moon phase — GitHub engine
- [ ] Seasons — GitHub + Supabase
- [ ] Seasonal terrain — GitHub engine
- [ ] Seasonal vegetation — GitHub engine
- [ ] Seasonal weather — GitHub engine
- [ ] Event calendar — Supabase

## 14. Lighting & Visual Presentation

- [ ] Ambient lighting — GitHub rendering
- [ ] Directional light — GitHub rendering
- [ ] Point lights — GitHub rendering
- [ ] Area lights — GitHub rendering
- [ ] Shadows — GitHub rendering
- [ ] Fog — GitHub rendering
- [ ] Color grading — GitHub rendering
- [ ] Night mode — GitHub rendering
- [ ] Cave lighting — GitHub rendering
- [ ] Indoor lighting — GitHub rendering
- [ ] Dynamic weather lighting — GitHub rendering

## 15. Labels, Annotation & Cartography

- [~] Annotation persistence foundation — Supabase
- [ ] Labels — GitHub UI + Supabase
- [ ] Icons — GitHub UI + Supabase
- [ ] Pins — GitHub UI + Supabase
- [ ] Notes — GitHub UI + Supabase
- [ ] POI markers — GitHub UI + Supabase
- [ ] Custom symbols — GitHub UI + Asset Library
- [ ] Annotation layers — GitHub + Supabase
- [ ] Scale bar — GitHub UI
- [ ] Compass — GitHub UI
- [ ] Legend — GitHub UI
- [ ] Coordinate system — GitHub + Supabase
- [ ] Map title — GitHub UI
- [ ] Borders — Supabase + GitHub
- [ ] Political regions — Supabase + GitHub
- [ ] Trade routes — Supabase + GitHub

## 16. Search & World Explorer

- [ ] Global search — GitHub UI + Supabase
- [ ] Map search — Supabase
- [ ] Object search — Supabase
- [ ] Region search — Supabase
- [ ] Asset search — Asset Library
- [ ] Coordinate search — GitHub UI
- [ ] Tag search — Supabase
- [ ] Layer search — Supabase
- [ ] World explorer — GitHub UI

## 17. Collaboration

- [ ] Project sharing — Supabase Auth
- [ ] Permissions — Supabase Auth/RLS
- [ ] Viewer role — Supabase
- [ ] Editor role — Supabase
- [ ] Admin role — Supabase
- [ ] Comments — Supabase
- [ ] Change history — Supabase
- [ ] Version comparison — Supabase + GitHub
- [ ] Version restore — Supabase
- [ ] Review workflow — Supabase
- [ ] Publish workflow — Supabase + GitHub

## 18. Import / Export

- [x] JSON document — GitHub
- [ ] PNG — GitHub export engine
- [ ] JPG — GitHub export engine
- [ ] SVG — GitHub export engine
- [ ] Map package — GitHub + Supabase Storage
- [ ] Asset manifest — Asset Library / Supabase
- [~] Full project backup — Supabase Storage
- [~] Full restore — GitHub + Supabase

## 19. Reliability

- [x] Runtime snapshot — Supabase
- [x] Persistence bridge — GitHub
- [~] Autosave controller — GitHub
- [~] Dirty state foundation — GitHub UI
- [~] Save status foundation — GitHub UI
- [~] Crash recovery integration — GitHub
- [~] Snapshot recovery foundation — Supabase
- [~] Network-loss persistence queue — GitHub
- [~] Conflict detection foundation — GitHub
- [~] Conflict resolution model — GitHub
- [~] Conflict resolution UI contract — GitHub
- [~] Snapshot comparison diff model — GitHub
- [~] Entity/cell-level merge strategy — GitHub + Supabase
- [~] Delete-vs-edit reconciliation — GitHub
- [~] Derived-state reconciliation contract — GitHub + Supabase
- [ ] Conflict resolution UI implementation — GitHub UI
- [ ] Offline editing queue — GitHub
- [ ] Network-loss recovery — GitHub + Supabase

## 20. Performance

- [ ] Virtualized canvas — GitHub
- [ ] Chunked map data — GitHub + Supabase
- [ ] Lazy asset loading — GitHub + Asset Library
- [ ] Asset caching — GitHub
- [ ] Spatial indexing — GitHub + Supabase
- [ ] Object culling — GitHub rendering
- [ ] Terrain chunking — GitHub
- [ ] Worker-based procedural generation — GitHub
- [ ] Background persistence — GitHub + Supabase
- [ ] Large-map stress test — GitHub/Vercel
- [ ] 100k+ object target — GitHub/Vercel

## 21. Professional UX

- [ ] Keyboard shortcuts — GitHub UI
- [ ] Command palette — GitHub UI
- [ ] Context menus — GitHub UI
- [ ] Dockable panels — GitHub UI
- [ ] Resizable panels — GitHub UI
- [ ] Persistent workspace — GitHub UI
- [ ] Workspace presets — GitHub UI + Supabase
- [ ] Dark/light theme — GitHub UI
- [~] Asset browser — GitHub UI
- [~] Inspector — GitHub UI
- [~] Layers panel — GitHub UI
- [~] Minimap — GitHub UI
- [~] Toolbar — GitHub UI

## 22. Validation & Publishing

- [x] Schema validation — GitHub + Supabase
- [x] Hierarchy validation — GitHub + Supabase
- [x] Terrain validation — GitHub + Supabase
- [x] Object validation — GitHub + Supabase
- [x] Geometry validation foundation — Supabase
- [x] Navigation validation — GitHub + Supabase
- [x] Environment validation — GitHub + Supabase
- [x] Asset validation — GitHub + Asset Library
- [x] Readiness gate foundation — GitHub
- [ ] Publish — Supabase + GitHub

## 23. Incarnate-Class Differentiation

- [ ] Procedural Map Wizard — GitHub
- [ ] Campaign/world templates — GitHub + Supabase
- [ ] Massive world maps — GitHub + Supabase
- [ ] Multi-resolution maps — GitHub + Supabase
- [ ] Nested maps — Supabase
- [ ] Linked locations — Supabase
- [ ] Cross-map portals — Supabase
- [ ] Dynamic world state — Supabase + GitHub
- [ ] Time-dependent world changes — GitHub + Supabase
- [ ] Weather-dependent terrain — GitHub + Supabase
- [ ] Gameplay simulation preview — GitHub
- [ ] AI-assisted terrain — GitHub + AI service
- [ ] AI-assisted object placement — GitHub + AI service
- [ ] AI-assisted world generation — GitHub + AI service
- [ ] AI-assisted cartography — GitHub + AI service

---

# Current Priority Queue

1. [x] Stabilize Save / Load and update / overwrite flow
2. [ ] Terrain tool suite: Line
3. [ ] Terrain tool suite: Rectangle
4. [ ] Terrain tool suite: Flood Fill
5. [ ] Robust Erase
6. [ ] Multi-cell brush validation
7. [ ] Paint performance optimization
8. [ ] Large-map stress test
9. [ ] Professional canvas camera UX
10. [ ] Selection + transform UX
11. [ ] Layer system UX
12. [ ] Asset browser
13. [ ] Object placement + inspector
14. [ ] Navigation visualization
15. [ ] Weather / time / seasons
16. [ ] Water / roads / elevation
17. [ ] Cartography
18. [ ] Procedural world generation
19. [ ] Collaboration
20. [ ] Large-world performance
21. [ ] Simulation preview
22. [ ] AI world-building

# Definition of Done — Map Editor v1

A user can:

**Create World → Create Region → Create Map → Paint Terrain → Place Assets → Edit Objects → Configure Navigation → Configure Environment/Weather → Save → Close → Reopen → State remains identical → Validate → Publish.**

# Vercel Policy

Vercel is used for deployment and browser/runtime verification. GitHub remains the implementation source and Supabase remains the authoritative persistence/world-state system.
