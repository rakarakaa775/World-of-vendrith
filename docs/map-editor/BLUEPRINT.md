# Vandrith Map Editor — Construction Blueprint

**Status:** Foundation construction guide v0.1  
**Authority:** Derived from `MAP_EDITOR_BIBLE.md`, the audited Master Roadmap, Phase Goals, Save/Load Contract, Database Contract, Game Design, Technical specification, and the 2026-09-16 foundation audit.  
**Rule:** This blueprint is the construction guide. Implementation must satisfy it and the referenced contracts; when a conflict is discovered, stop implementation and document the conflict before changing architecture.

## 1. Construction order

`Blueprint → Requirements → Contracts → Implementation → Test → Audit → Logs`

Do not use an existing implementation as the design authority when it conflicts with the documented contract.

## 2. System architecture

The Map Editor consists of these boundaries:

1. **Map Hierarchy** — World → Region/Kingdom → Playable, with interior spaces explicitly attached to a Playable map.
2. **Editor State** — active map navigation, current editable document, local history, selections and tool state.
3. **Persistence State** — connected persisted map, base document/version, save/load status and server-confirmed metadata.
4. **MapDocument** — canonical editor state and serialization source.
5. **Asset System** — staged assets, provenance/approval, registry and terrain bindings.
6. **Editing Engine** — tools mutate documents; history remains local.
7. **Renderer** — reads the document and renders it; it is never the source of truth.
8. **Persistence Layer** — authenticated server operations for authoritative versions and save slots.
9. **Derived Projections** — map cells, objects, geometry, navigation and runtime snapshots rebuilt from authoritative snapshots.

## 3. Map identity

Every editing operation has one explicit `map_id` and `map_type`.

Required map types:

- `world`
- `region`
- `playable`

Identity must not be generated from screen position, dimensions, timestamps alone, or inferred hierarchy. A loaded document must match the requested persisted map identity before it is adopted into editor state.

## 4. Hierarchy

The intended relationship is:

`World Map → Kingdom/Region Map → Playable Map → Interior Space`

Each child has one explicit parent reference. Interior ownership must be unambiguous: an interior belongs to its Playable Map, not merely to the Playable Map's Region.

## 5. Editor state model

Keep these concepts separate:

### Navigation state
- `activeMapId`
- selected map/tree state

### Editing state
- `currentDocument`
- undo/redo history
- selected entity/tool/layer

### Persistence state
- `connectedMapId`
- `baseDocument`
- `baseVersion`
- save/load status

Changing navigation must not silently publish a stale document or reuse persistence metadata from another map.

## 6. Open/Adopt contract

1. Receive requested map ID.
2. Resolve the authoritative snapshot for that ID.
3. Parse and validate the serialization envelope.
4. Validate `document.id === requestedMapId`.
5. Validate `document.mapType` and required fields.
6. Replace the editor document at an explicit history boundary.
7. Reset persistence baseline to the loaded version.
8. Render the loaded document without recreating the renderer for ordinary edits.

A failed open/load must leave the current editable document intact.

## 7. Editing contract

Tools operate only on the current `MapDocument`.

The minimum documented tools are Select, Paint, Erase, Line, Rectangle, Flood, Stamp, Building and Collision. Ground, Objects and Collision remain logically separate layers.

Undo/Redo is local editor history. Network success or failure must not be used as a trigger to reset normal painting history.

## 8. MapDocument contract

The document contains at minimum:

- stable identity;
- map type;
- name/metadata;
- width and height;
- tile size;
- layers;
- map hierarchy references where applicable;
- playable-space metadata where applicable;
- editor entities required to reconstruct the map.

For a grid document:

`cells.length = width × height`

No fixed cell count is permitted.

Serialization uses the documented `vandrith.map-document` envelope and payload versioning. Validation must reject malformed, ambiguous, or cross-map snapshots.

## 9. Save contract

Quick Save and Save Slot share the same authoritative save foundation.

Before commit:

1. authenticate the user;
2. resolve the intended map;
3. verify local identity against the save target;
4. validate the document;
5. compare the expected/base version with the authoritative remote version;
6. perform the authoritative commit;
7. only after success update persistence state;
8. for slot save, write the slot snapshot against the confirmed version;
9. rebuild required derived projections transactionally.

A save failure must not replace the current document or history.

## 10. Load contract

Load Latest and Load Slot must:

`requested map → authoritative snapshot → parse → identity validation → version validation → explicit adopt → render`

A slot is a snapshot, not a separate map. Loading a slot must restore the stored document exactly and must not mutate the stored slot through later edits.

## 11. Version/conflict contract

The authoritative version is server-side. The editor retains the base version used for the local editing session.

If remote version differs from the expected version, save enters a deterministic conflict path. Three-way merge may compare `base`, `local`, and `remote`, but documents with different identities are never mergeable.

## 12. Terrain and assets

Terrain flow:

`Terrain identity → Terrain Binding → Asset Registry → Approved Asset → Renderer`

Asset storage is separate from activation. Only assets with documented provenance/approval may become runtime/editor bindings.

Original source packages remain separate from normalized/staged assets.

## 13. Renderer/canvas contract

The renderer is a projection of `MapDocument`.

Normal paint/move operations must update the existing rendering surface incrementally. Creating and destroying the entire Pixi application on every document edit is prohibited by the stability requirement because it can cause canvas/image flicker and unnecessary texture reloads.

Renderer cleanup must not erase editor state.

## 14. Derived data

The authoritative snapshot is the source from which gameplay-oriented data is rebuilt.

Derived structures include, where applicable:

- `map_cells`
- `map_objects`
- object geometry
- navigation cells/obstacles
- runtime snapshots

Derived data must never become the editor's canonical document.

## 15. Map-scale capability profiles

### World
Macro geography, land/water features, region anchors, major routes, labels and coordinate context.

### Region/Kingdom
Regional terrain, boundaries, settlements, roads/rivers/routes, regional POIs, resources/activity anchors and links to Playable locations.

### Playable
Fine terrain, objects/buildings, collision, navigation, geometry/footprints, gameplay anchors and local environment context.

The three scales share the same persistence and identity foundations.

## 16. Current foundation defects to resolve

The 2026-09-16 audit identified these implementation risks:

- active map navigation can diverge from connected persistence state;
- MapBrowser opening a map changes `activeMapId` without immediately synchronizing persistence baseline;
- load/adopt paths do not yet enforce a requested-ID versus loaded-document-ID guard at every boundary;
- child maps created locally are not yet covered by the current World-only save flow;
- interior hierarchy metadata can be ambiguous;
- grid creation currently contains a hard-coded cell count;
- the Pixi canvas lifecycle recreates the application during ordinary document changes.

These are foundation work items, not permission to redesign unrelated database architecture.

## 17. Definition of a stable foundation

Foundation work is complete only when:

- map navigation and persistence identity cannot diverge silently;
- loading one map cannot adopt another map's document;
- painting does not recreate the renderer or flicker;
- history remains local and deterministic;
- MapDocument grid dimensions are deterministic;
- World, Region and Playable identities are explicit;
- Save/Load contracts can be tested without canvas side effects;
- every implementation change is recorded in the Change Log and Status Log.
