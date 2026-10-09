# Vendrith Terrain System — Specification V1

- **Status:** Design specification; not an implementation claim
- **Version:** 1.0
- **Prepared:** 2026-10-09
- **Target:** `feat/vendrith-ecc-v1`
- **Scope:** 2D grid/tile terrain authoring, resolution, rendering contracts, and future-compatible metadata
- **Related audit:** [Map Editor Terrain Foundation Readiness Audit](./MAP_EDITOR_TERRAIN_REFERENCE_AUDIT_2026-10-01.md)
- **Related research matrix:** [Map Editor Reference Matrix](../MAP_EDITOR_REFERENCE_MATRIX.md)

> This document defines terminology, desired behavior, invariants, and implementation boundaries. It does not assert that every feature described here already exists. The dated foundation audit is a snapshot and must be re-verified against the current branch before implementation.

## 1. Purpose

The Terrain System describes what a map cell means as a surface, how that surface relates to neighboring cells, how the editor chooses approved visual tiles, and how terrain edits are validated, stored, rendered, tested, and eventually interpreted by gameplay systems.

The system must make large terrain areas practical to author without requiring a person to manually select every edge and corner tile. It must preserve map data integrity, asset provenance, deterministic editing behavior, and existing Vendrith boundaries.

### Goals

1. Separate semantic terrain identity from a particular image or tileset.
2. Resolve neighbor-aware terrain visuals from explicit, inspectable rules.
3. Support safe painting, erasing, line/rectangle operations, fill, preview, and history.
4. Support edges, corners, mixed terrain junctions, and intentional fallback behavior.
5. Use only assets and bindings that satisfy Vendrith approval and provenance requirements.
6. Make future variation and rule-driven decoration possible without forcing them into the first release.
7. Keep the editor document, rendering layer, asset registry, storage, and gameplay systems distinct.
8. Make behavior testable, deterministic where required, and diagnosable when a rule or asset is missing.

### Non-goals

This specification does not propose:
- replacing `MapDocument`, map history, Pixi rendering, Supabase asset registry, or canonical asset storage;
- creating a second Asset Library or a parallel terrain database;
- importing Tiled or LDtk formats as the canonical Vendrith format;
- automatically assigning every image to a terrain type;
- treating visual similarity as proof of license or asset approval;
- making terrain rules responsible for buildings, object placement, collision, navigation, biome simulation, or all world-generation logic;
- requiring a 3D terrain engine for the existing 2D grid editor.

## 2. Terminology

| Term | Definition |
|---|---|
| Terrain | A semantic category of ground/surface used by the map model. |
| Terrain key / ID | Stable machine-readable identity, e.g. `grass` or `deepwater`. |
| Terrain definition | Metadata describing a terrain key, label, category, and optional gameplay defaults. |
| Cell | One logical location in the map grid. |
| Tile / visual tile | A visual asset selected to represent a cell or part of a terrain transition. |
| Tileset | A collection of visual tiles or terrain-related assets. |
| Terrain palette | Editor UI for selecting semantic terrain tools. |
| Terrain brush | Tool that paints a semantic terrain and resolves affected visual neighbors. |
| Neighbor mask | Encoded state of neighboring cells used to select a visual tile. |
| Autotiling | Automatic selection of visual tiles based on terrain relationships and local neighborhood. |
| Transition | A visual connection between different terrain types, such as grass meeting sand. |
| Junction | A cell neighborhood in which several terrain types or boundaries meet. |
| Rule | Declarative criteria used to resolve a terrain, transition, or decoration result. |
| Binding | Approved mapping from semantic terrain + visual condition to an approved asset. |
| Variation | Selection among multiple compatible visual alternatives for a resolved condition. |
| Fallback | Explicit safe behavior when no valid binding/rule is available. |
| Biome | A larger environmental classification that can contain several terrain types. |
| Decoration | An overlay or object such as grass tufts, flowers, rocks, or debris. |
| Gameplay metadata | Non-visual properties such as walkability or movement cost. |
| Preview | A non-authoritative visualization of the result before committing an edit. |
| Derived visual state | Render-oriented information computed from semantic map data and rules. |

### Core distinction

Terrain identity is not the same thing as a sprite, layer, biome, collision shape, or decoration. A cell may semantically be `grass` even if the selected visual changes from a center tile to an edge tile. A flower placed on grass should normally remain a decoration rather than changing the cell's terrain key.

## 3. Conceptual model

The intended flow is:

```text
Terrain Definitions + MapDocument
                |
                v
       Terrain Edit Operation
                |
                v
  Determine Changed Cells + Neighborhood
                |
                v
       Neighbor / Junction Analysis
                |
                v
     Approved Rule and Binding Resolver
                |
        +-------+-------+
        |               |
        v               v
   Visual Tile       Diagnostics /
   Resolution        Safe Fallback
        |               |
        +-------+-------+
                v
         Renderer (Pixi)
```

Asset provenance and approval are upstream constraints on bindings. Gameplay metadata is read through its own contract; the visual resolver must not silently decide collision or navigation.

## 4. Terrain definitions and semantic vocabulary

A terrain definition should have a stable key independent of display label and image file name. Suggested conceptual fields:

- `key`: stable, lowercase identifier;
- `label`: user-facing name;
- `description`: meaning and intended use;
- `category`: optional broad group, e.g. land or water;
- `enabled`: whether the terrain is available to authoring tools;
- `paletteOrder`: optional presentation order;
- `gameplayProfileId`: optional reference to separately governed gameplay metadata;
- `tags`: controlled descriptive tags, not an unbounded replacement for semantics;
- `schemaVersion`: version for future migration.

This is a conceptual contract, not a required literal schema. Adapt it to existing Vendrith types rather than introducing duplicate models.

### Existing vocabulary from the dated audit

The audit dated 2026-10-01 reported these recognized keys:
- `grass`
- `sand`
- `dirt`
- `pavement`
- `water`
- `deepwater`

Treat this as a baseline to verify, not as a guarantee about current code or live data. New types such as snow, lava, mud, ice, or rock must not be added merely because a matching asset exists. Each addition needs an explicit semantic decision, UI need, valid assets, and tests.

### Naming and identity rules

1. Keys must be stable and unique.
2. Labels may be translated or renamed without changing saved terrain identity.
3. File paths, asset names, palette labels, and terrain IDs must not be treated as interchangeable identifiers.
4. Unknown terrain keys must be reported and handled safely; never silently reinterpret them as another terrain.
5. Deprecated keys require an explicit migration plan.

## 5. Map cells, layers, and authority

Terrain data belongs to the existing map document/layer model. The logical map state is authoritative; rendered tiles and neighbor masks are derived outputs unless the existing persistence contract explicitly says otherwise.

Maintain clear separation among:
- ground/terrain semantics;
- objects and decorations;
- collision data;
- navigation data;
- editor-only selection and preview state;
- derived render plans.

The terrain resolver must not mutate unrelated object or collision layers merely to produce a visual transition. If terrain edits are intended to affect collision or navigation, that behavior must be an explicit, separately tested rule.

## 6. Neighbor topology and masks

### 6.1 Eight-neighbor model

A square grid can inspect eight positions around a cell:

```text
NW  N  NE
 W  C   E
SW  S  SE
```

The dated audit reports an 8-bit neighbor mask in the range 0–255. A bitmask can encode a binary property for each neighbor, but its meaning must be documented exactly: bit order, whether it means same terrain or matching rule, and how empty/out-of-bounds cells are treated.

Do not assume every 8-bit mask is valid for every tileset. A mask is a neighborhood descriptor, not a promise that an approved visual exists for it.

### 6.2 Required mask contract

Before extending mask resolution, document:
- stable bit order for NW, N, NE, E, SE, S, SW, W (or the already-established order);
- what qualifies as a match: same terrain, compatible terrain group, explicit transition, or rule-specific predicate;
- whether diagonal matches are gated by adjacent cardinal matches;
- treatment of empty cells, map boundaries, unknown keys, and unsupported terrain;
- canonical normalization for equivalent shapes;
- versioning rules if mask semantics ever change.

Do not change the established mask bit order without migration and regression tests.

### 6.3 Cardinal and diagonal constraints

Diagonal matching can create visual corner artifacts if diagonal neighbors are considered connected when the corresponding cardinal edges are not. A resolver may normalize or constrain diagonal bits to avoid impossible shapes, but it must follow the selected tileset/rule model and be covered by fixtures. Do not globally impose a normalization algorithm that contradicts the actual art.

## 7. Autotiling and terrain rule models

Autotiling is the process of choosing the best visual tile for a semantic cell using its neighborhood and the available approved bindings.

Possible models include:
- **Blob / 47-tile:** compact set of common shapes using a normalized neighborhood;
- **16-tile / dual-grid:** reduced corner/edge representation;
- **Wang-style rules:** edge and/or corner labels define compatible adjacency;
- **Explicit rule sets:** conditions and outcomes declared as data;
- **Custom resolver:** algorithmic resolution where existing Vendrith contracts require it.

These models are alternatives, not features that must all be implemented. Select the smallest model that fits existing Vendrith data and art. Avoid supporting several incompatible mask systems in production without a clear adapter boundary.

### Resolution precedence

A future resolver should follow a documented deterministic precedence, such as:
1. validate terrain key and map context;
2. compute canonical neighborhood/junction state;
3. locate an exact approved binding;
4. if the rule model supports it, resolve an explicitly defined compatible transition;
5. apply a compatible deterministic variation set, if enabled;
6. return a safe fallback plus diagnostic if no valid result exists.

Do not silently choose a visually similar asset whose terrain role or approval is unknown.

## 8. Terrain transitions and junctions

A transition is a visual treatment where terrain types meet. Examples include grass–sand, grass–dirt, sand–water, and shallow–deep water. The allowed combinations depend on game semantics and the approved art catalog.

Transition requirements:
- define which terrain pairs are allowed;
- define direction/orientation and corner handling;
- support multi-terrain junctions where the art model allows them;
- identify whether the transition is represented by the cell's base tile, an overlay, or another existing layer;
- use only approved asset bindings;
- produce diagnostics when a transition is missing;
- do not fabricate bindings by guessing from filenames or spritesheets.

Do not require 256 authored bindings for every terrain. Many masks are equivalent after normalization, and many terrain types do not need all combinations. Build a coverage matrix from actual rules and approved assets.

### Transition coverage report

A useful report should show:
- terrain key or pair;
- required normalized masks/rules;
- approved binding count;
- missing conditions;
- rejected/unapproved candidates excluded;
- fallback behavior;
- visual fixture/test status.

## 9. Asset bindings, approval, and provenance

A binding connects a semantic terrain condition to an asset approved for that purpose. The dated audit reports that the loader checks candidate approval, asset approval, terrain key, mask, asset ID, and license registry ID. Re-verify these checks against current code before relying on them.

Rules:
1. Asset presence in storage is not approval.
2. Asset Library visibility is not proof of terrain suitability.
3. License metadata and provenance must remain traceable.
4. Never bypass the candidate/asset approval pipeline for convenience.
5. Do not create a binding to a missing, unreviewed, or unlicensed asset.
6. A binding must refer to a stable asset identity, not only a mutable path.
7. If an asset is removed or approval is revoked, resolution must fail safely and produce a diagnostic.
8. Keep source code license, art license, attribution requirements, and derivative permissions distinct.
9. Do not copy source project assets just because its code is open-source.

A conceptual binding record may include a stable binding ID, terrain key, normalized condition/mask, asset ID, approval/provenance references, optional priority, and schema version. Reuse the existing schema if it already provides these fields.

## 10. Editing tools

### Terrain Brush

The brush paints semantic terrain, then recalculates the affected neighborhood. It should not require the user to paint individual visual edge tiles manually.

Expected behavior:
- respect selected terrain and active layer;
- preview the semantic change and its visual consequences;
- resolve changed cells and impacted neighbors;
- preserve unrelated data;
- record one coherent history operation per user action;
- surface missing transition or asset diagnostics.

### Erase

Erase must have a clearly defined meaning: remove terrain assignment, restore a default terrain, or erase only the selected layer. These are not interchangeable. Match existing MapDocument semantics and make the UI label explicit. Recompute neighboring visuals after an erase.

### Fill / Flood Fill

Fill must define:
- connectivity (4-neighbor or 8-neighbor);
- matching criterion (same semantic terrain, same rule group, or another explicit predicate);
- behavior at map boundaries and layer gaps;
- maximum/large-region behavior and cancellation strategy;
- whether preview and commit use the same selection result;
- how the operation is recorded in undo/redo.

A flood-fill preview and its eventual commit should not disagree because of different traversal rules. Large fills must be tested for responsiveness and memory usage.

### Line and rectangle

Shape tools should use the same semantic painting and neighbor-resolution pipeline as the brush. They must not create a separate autotiling algorithm.

### Picker, preview, undo, and redo

If terrain picking is supported, it should pick semantic terrain rather than merely copying a rendered edge sprite. Preview must not commit mutations. Undo/redo must restore the logical map state and recompute or restore derived visual state consistently.

## 11. Variations and randomness

Variation is an optional layer of visual choice among assets that are compatible with the same semantic terrain and neighborhood condition.

Examples include grass texture variants, scattered dirt details, or alternate sand centers.

Rules:
- variation must not change the semantic terrain key;
- only approved, compatible assets may be selected;
- variation must not violate edge/transition constraints;
- selection must be deterministic when reproducible maps, stable tests, undo/redo, or multiplayer synchronization require it;
- use a stable seed or deterministic hash based on documented inputs rather than ambient randomness;
- changing a variation weight must have defined effect on future resolution and should not corrupt saved semantic terrain;
- avoid storing a random visual choice as canonical map data unless a deliberate art-locking requirement exists.

Weighted variation should follow stable base transition resolution, not precede it.

## 12. Rule-based mapping and decoration

A future rule layer may map terrain/environment context to additional visual details, but it must remain distinct from the core terrain identity.

Examples:
- add small grass tufts on grass;
- place sparse stones on dirt;
- place reeds beside shallow water;
- choose region-specific decoration based on biome tags.

Each rule should define its inputs, conditions, output type, priority/weight, deterministic behavior, and conflict handling. Rules must not overwrite semantic terrain unless explicitly designed to do so.

The dated audit reported a small rule catalog such as grass → world_grass, dirt → road_dirt, and water → world_water. Verify these mappings before extending them. Do not turn a small bridge into a second asset ingestion or world-generation framework.

## 13. Terrain, biome, decoration, collision, and navigation boundaries

- **Terrain** describes the cell's surface semantics.
- **Biome** describes a larger environmental region and can contain multiple terrain types.
- **Decoration** adds visual objects without changing terrain identity.
- **Collision** determines physical blocking/contact.
- **Navigation** determines movement graph/path constraints.
- **Gameplay metadata** describes effects such as movement cost, hazard, or traversal requirements.

A visual water tile is not sufficient to decide whether a boat can traverse it. A visual cliff edge is not sufficient to infer collision. Gameplay systems must consume explicit, validated data through their own contracts.

## 14. Rendering contract

The renderer should receive resolved visual output from the existing terrain pipeline, not independently reimplement semantic rules.

Requirements:
- render plans should be derived from current logical map state and approved bindings;
- rendering a map should not mutate its canonical semantic data;
- missing bindings should use a documented safe fallback and diagnostic;
- renderer lifecycle should remain consistent with the existing Pixi application lifecycle;
- visual changes should update only the affected region where practical;
- rendering must not query external search services or infer asset licenses at runtime;
- editor preview state must not leak into persisted world state.

The renderer is not the source of truth for terrain identity.

## 15. Persistence, history, and deterministic recovery

Terrain edits must use the existing map document, history, and persistence contracts. Do not create a separate terrain save file or bypass authoritative persistence.

The logical terrain state should be sufficient to reconstruct derived masks and render plans, subject to the existing map schema. If the current persistence contract intentionally stores derived visual data, document why and how it is verified.

For operations that participate in runtime persistence:
- respect existing mutation-journal/checkpoint and authorization boundaries;
- do not write around authoritative RPCs;
- make operation boundaries clear;
- ensure undo/redo semantics are consistent with the editor's persistence model;
- test recovery and deterministic replay if terrain edits are part of authoritative runtime mutations.

This specification does not itself authorize changes to database schema or runtime persistence.

## 16. Diagnostics and observability

Terrain diagnostics should be actionable and should distinguish:
- unknown terrain key;
- missing rule;
- missing binding for a required condition;
- binding points to an unavailable asset;
- asset or candidate not approved;
- license/provenance metadata missing;
- invalid or unsupported mask;
- invalid rule configuration;
- fallback used;
- stale preview or resolution result.

Diagnostics should identify the affected cell/terrain/rule/binding when safe and useful. They should not expose secrets or private storage credentials. Missing optional art may be a warning; invalid semantics or approval violations may need to block the operation. Define severity deliberately.

## 17. Performance and scalability

Performance work must be measured against real map sizes and current architecture.

Expected considerations:
- recalculate changed cells plus the required neighborhood, not the entire map for every brush stroke;
- avoid duplicate work when a shape operation touches many adjacent cells;
- use stable rule/binding indexes rather than repeatedly scanning all assets;
- cache only derived data with explicit invalidation rules;
- do not allow caches to become an alternative source of truth;
- test fill operations on large connected regions;
- batch render updates when the renderer supports it;
- profile before adding complex caching or worker architectures.

Any optimization must preserve deterministic results and correct invalidation after edits, undo/redo, asset approval changes, and map reloads.

## 18. Validation and testing strategy

### Unit tests
- terrain key validation and migration;
- neighbor bit order and mask encoding;
- normalization of supported neighborhood shapes;
- transition precedence and fallback;
- rule priority/conflict behavior;
- deterministic variation;
- binding approval and provenance requirements.

### Integration tests
- paint changes semantic cells and recomputes affected neighbors;
- erase recomputes boundaries;
- fill preview matches committed fill;
- line/rectangle uses the same resolver;
- undo/redo restores logical and visual state;
- approved binding resolution works end-to-end;
- missing/revoked bindings do not crash or silently select unapproved art;
- renderer updates without rebuilding the entire application;
- persistence/recovery behavior matches the existing authoritative contract.

### Visual fixtures
Maintain small canonical maps for:
- isolated cell;
- straight edge;
- convex and concave corners;
- diagonal-only contact;
- narrow corridor;
- enclosed area;
- grass–sand–water coast;
- dirt road crossing grass;
- mixed multi-terrain junction;
- map boundary and missing binding;
- erase/fill/undo sequence.

### Property/invariant tests
- mask values remain in their documented range;
- resolver output is stable for identical inputs and registry state;
- no unapproved asset is returned;
- unrelated cells remain unchanged;
- applying the same semantic edit twice has documented idempotent behavior;
- preview does not mutate canonical state;
- rule or binding absence produces a safe, diagnosable result.

Do not report tests as passed unless they have actually been run against the relevant code.

## 19. UI and authoring experience

The palette should expose only terrain types approved for authoring and should be generated from the canonical semantic definitions where practical, rather than duplicated hardcoded lists.

The editor should communicate:
- selected terrain and tool;
- whether a preview is pending or valid;
- when required transition art is missing;
- whether a fill affects a large area;
- whether an operation is reversible;
- the difference between terrain painting and decoration placement.

A terrain being recognized by engine code does not automatically mean it has approved visual assets or should be shown in the palette.

## 20. Security, licensing, and supply-chain rules

- Treat external repositories, downloaded asset packs, metadata, and generated manifests as untrusted until reviewed.
- Verify code license separately from asset license.
- Record author/source, version or commit, audit date, license, attribution, and intended use.
- Do not infer a license from a repository's popularity or from a missing notice.
- Never allow an external reference's configuration to bypass Vendrith approval checks.
- Validate identifiers and rule data at boundaries.
- Avoid arbitrary code execution in data-driven terrain rules; prefer a constrained declarative format.
- Do not fetch or execute remote code while painting or rendering terrain.

## 21. Open-source reference principles

These references inform the vocabulary and design comparisons; they are not dependencies and their code/assets must not be copied without a separate license/provenance review.

- **Tiled:** terrain sets, Terrain Brush, Wang-style matching, terrain fill, probabilities.  
  https://github.com/mapeditor/tiled  
  https://doc.mapeditor.org/en/stable/manual/terrain/
- **Godot Engine:** TileSet terrain peering bits and tile metadata concepts.  
  https://github.com/godotengine/godot  
  https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
- **LDtk:** Auto-Layer rules and structured level-authoring concepts.  
  https://github.com/deepnight/ldtk
- **Terrain Lab:** small browser-based autotile algorithm and mask/preview/export concepts; inspect the current repository and license before adopting anything.  
  https://github.com/Kninen/terrainlab
- **Autotiler:** tileset generation, 47-tile/dual-grid representations, mask export concepts.  
  https://github.com/itsjavi/autotiler

These references use different assumptions and data models. Vendrith should adopt concepts selectively, not merge their formats or architectures wholesale.

## 22. Baseline reported by the 2026-10-01 audit

The related audit reported:
- a `MapDocument` with grid dimensions and logical layers;
- ground/object/collision separation;
- deterministic local map history with undo/redo;
- paint, erase, line, rectangle, and flood tools;
- 8-neighbor masks from 0–255 and affected-cell perimeter recalculation;
- terrain junction detection, render planning, and preview analysis;
- terrain autotile application/resolution hooks;
- approved terrain asset binding loader and Pixi rendering by mask;
- six recognized terrain keys listed in Section 4;
- terrain fill requiring runtime validation;
- production transition binding coverage incomplete;
- weighted variation not implemented in the described resolution path;
- the terrain palette exposing only Deepwater at that audit snapshot.

All of these are **historical audit observations**. Re-run repository and runtime checks before treating any item as current truth. In particular, do not infer current live binding counts or UI state from this document.

## 23. Recommended implementation sequence

1. **Re-audit current code and live binding data.** Confirm what still exists and update the readiness audit with evidence.
2. **Align terminology and semantic vocabulary.** Verify existing types; do not duplicate definitions.
3. **Verify palette exposure and approved base bindings.** Ensure the UI exposes only valid approved options.
4. **Write mask and resolver contract tests.** Lock down bit order, normalization, boundary behavior, and fallback.
5. **Build transition coverage from real approved assets.** Do not invent bindings to fill a numeric quota.
6. **Validate brush, erase, fill, history, and renderer behavior.** Include large-region and visual fixture tests.
7. **Add deterministic variation only after transition resolution is stable.**
8. **Consider declarative AutoMapping/decoration rules after the core terrain system is reliable.**
9. **Integrate gameplay metadata only through explicit domain contracts.**

Each stage should have an audit result, a clear acceptance criterion, and tests before advancing.

## 24. Definition of done for a production-ready terrain foundation

A terrain foundation is not complete merely because the brush can paint or the mask can be computed. At minimum:
- semantic terrain IDs and mask semantics are documented and stable;
- the palette reflects the approved vocabulary;
- required base and transition bindings are verified;
- missing rules/assets have safe, visible diagnostics;
- paint, erase, fill, shape tools, and undo/redo preserve logical data;
- render output is derived consistently from authoritative map state;
- large edits meet measured performance targets;
- provenance and approval constraints cannot be bypassed;
- deterministic and integration tests cover key edge cases;
- the readiness audit reflects the current branch rather than a past snapshot.

## 25. Decision log

| Topic | Decision for V1 | Reason |
|---|---|---|
| Canonical terrain identity | Reuse existing Vendrith model where possible | Avoid duplicate source of truth |
| Neighbor model | Document and preserve current 8-neighbor mask contract | Compatibility with existing resolver |
| Autotile format | Selectively adapt; do not force one external format | Existing architecture and art may differ |
| Asset binding | Require existing approval and provenance checks | Safety, licensing, traceability |
| Variation | Defer until transitions are stable | Avoid hiding incomplete base rules |
| Gameplay effects | Keep separate from visual terrain resolver | Clear domain ownership |
| Persistence | Reuse existing MapDocument and authoritative persistence | Avoid parallel state |
| External references | Research only, not automatic dependencies | Control license and architecture risk |

## 26. Follow-up checklist

- [ ] Re-audit current branch against Sections 4–18.
- [ ] Verify current terrain keys and palette options.
- [ ] Verify current mask bit order and diagonal normalization.
- [ ] Verify base and transition binding records, approval, and license provenance.
- [ ] Add or update canonical visual fixtures.
- [ ] Run targeted terrain tests and record actual results.
- [ ] Validate fill, undo/redo, and large-map behavior in the runtime.
- [ ] Update the dated readiness audit with new evidence.
- [ ] Record any implementation decision separately from this specification.

---
End of specification. This file is design documentation and does not claim that the follow-up checklist has been completed.
