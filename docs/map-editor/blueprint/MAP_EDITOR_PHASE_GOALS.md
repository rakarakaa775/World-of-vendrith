# Vandrith Map Editor — Phase Goals & Roadmap Purpose

**Document status:** Audited phase-goal baseline / living specification  
**Purpose:** Explain what each roadmap phase is intended to accomplish, why it exists, what it must establish, and what evidence allows the project to move forward.

## Product scope

All phases apply to one Map Editor capable of authoring:

- **World Map** — macro geography and high-level world relationships.
- **Kingdom/Region Map** — regional geography, territory, settlements, routes and POIs.
- **Playable Map** — detailed gameplay spaces with terrain, objects, collision, navigation and gameplay anchors.

The three map scales share the same MapDocument, serialization, persistence, versioning, save-slot and ownership foundation. They are not separate persistence products.

## Phase 0 — Foundation Audit

**Purpose:** Find the actual foundation problems before modifying implementation.

**Goal:** Establish one reliable picture of the current repository, runtime, database, RPC, identity, serialization, deployment, three-map model, and asset-library state.

**Must answer:**
- What is the canonical MapDocument?
- How is `map_type` represented and validated?
- What is required for World, Region, and Playable maps respectively?
- Which database structures are authoritative versus derived?
- Which RPCs are actually used by the editor?
- How is `map_id` resolved and owned?
- Where does Save currently fail?
- Where does Load currently fail?
- Why did the previous history synchronization cause flicker?
- Which deployment/branch/commit is actually running?
- Which assumptions in existing code contradict the Bible, Game Design, Technical, or Database Contract?
- Which assets are approved, reviewed, pending, restricted, or unverified?
- Which stored assets belong to Map Editor, Life Build, Inventory, or other systems?
- Can the current asset data model represent allowed Map Editor scales (`world`, `region`, `playable`) as a first-class contract rather than as a filename/category convention?
- Can one approved asset explicitly be shared across multiple scales without making every approved asset globally valid?

**Exit evidence:** Foundation audit report and a controlled list of implementation changes required for Phase 1, plus a documented decision for how scale-scoped asset eligibility will be represented.

## Phase 1 — Stable Editor Core

**Purpose:** Make the editor itself reliable before connecting persistence fixes to it.

**Goal:** Editing must be deterministic and visually stable for all three map types.

**Must establish:**
- MapHistory owns local editing state.
- Canvas rendering is independent of network persistence.
- Paint/Erase/Line/Rectangle/Flood/Stamp behavior is stable.
- World/Region/Playable capability differences are explicit and do not fork the editor state model.
- Layers and object editing do not unexpectedly reset history.
- Undo/Redo is deterministic.
- Load boundaries are explicit rather than inferred from object identity.

**Exit evidence:** Runtime editing test with no flicker and no history reset during normal edits at each supported map scale.

## Phase 2 — MapDocument & Serialization Contract

**Purpose:** Prevent different systems from interpreting the map differently.

**Goal:** Define one canonical, validated, versioned representation that survives save/load round trips for all three map types.

**Must establish:**
- identity and `map_type` fields;
- dimensions and tile size;
- layer structure;
- cell/object semantics;
- world/region/playable relationship metadata;
- serialized envelope;
- parser validation;
- compatibility/version policy;
- scale-specific capability data without creating incompatible document formats;
- map-scale identity required for asset eligibility validation without embedding storage-specific assumptions into the document.

**Exit evidence:** serialize → parse → compare round-trip tests plus malformed-payload tests for World, Region, and Playable documents.

## Phase 3 — Persistence Foundation

**Purpose:** Make authoritative Save reliable without destabilizing editing.

**Goal:** Connect the validated MapDocument to the correct map/version through secure, server-controlled persistence.

**Must establish:**
- authenticated session;
- explicit map resolution;
- owner validation;
- authoritative version read;
- version-aware commit;
- structured RPC errors;
- server-confirmed success;
- correct preservation of `map_type` and map relationships.

**Exit evidence:** authoritative Save succeeds for each map type, produces the expected version, and exposes exact failure information when deliberately broken.

## Phase 4 — Save Slots & Load System

**Purpose:** Provide reliable recovery snapshots and restoration.

**Goal:** Save Slot and Load become deterministic operations on immutable snapshots.

**Must establish:**
- slots 1–12;
- slot ownership;
- snapshot isolation;
- Load Latest;
- Load Slot;
- explicit editor-state replacement boundary;
- no data loss on failed load;
- preservation of map type and relationship metadata.

**Exit evidence:** Save Slot 1 → edit → Load Slot 1 restores the exact saved document without flicker for World, Region, and Playable maps.

## Phase 5 — Derived Projections

**Purpose:** Make gameplay-facing tables useful without confusing them with editor truth.

**Goal:** Deterministically rebuild projections from authoritative snapshots according to map scale.

**Must establish:**
- World Map high-level geographic/link projection;
- Region Map regional terrain/route/POI projection;
- Playable Map ground/cell projection;
- object projection;
- geometry projection;
- navigation projection;
- runtime snapshot projection;
- orphan cleanup/rebuild behavior.

**Exit evidence:** projections can be deleted/rebuilt and produce the expected state from the same authoritative snapshot for all applicable map types.

## Phase 6 — Terrain, Environment & World Integration

**Purpose:** Connect authored maps to the broader Vandrith world/environment systems.

**Goal:** Terrain, seasonal/weather behavior, coordinates, World, Region, and Playable context consume stable map contracts and asset-scale eligibility.

**Must establish:**
- terrain identity/bindings;
- topology/mask behavior;
- seasonal variants;
- environment context;
- coordinate profile behavior;
- World → Region relationships;
- Region → Playable relationships;
- world/region/playable metadata boundaries;
- approved asset + allowed-scope validation;
- explicit shared-asset behavior for assets permitted in multiple scales;
- rejection of approved assets used outside their declared scope.

**Exit evidence:** map context remains deterministic across editor, persistence, and environment/runtime consumers, and asset selection is constrained by both approval and map scale.

## Phase 7 — Full Authoring Feature Set

**Purpose:** Finish the complete designer workflow after foundations are stable.

**Goal:** Provide the full approved authoring toolkit without bypassing the canonical document contract.

**Must establish:**
- advanced object/building workflows;
- stamps;
- copy/paste;
- collision authoring;
- navigation authoring;
- selection/manipulation;
- map-scale capability profiles;
- approved future extensions;
- asset palette filtering by active map scale;
- placement-time rejection for out-of-scope assets.

**Exit evidence:** feature-by-feature tests mapped to Game Design and Technical requirements for the applicable map type, including asset approval/scope checks.

## Phase 8 — Verification, Recovery & Release

**Purpose:** Prove that the editor remains reliable outside the happy path.

**Goal:** Release only after recovery, failure, compatibility, asset-reference, three-map integration, and deployment behavior are demonstrated.

**Must establish:**
- full regression matrix;
- stale-version behavior;
- auth/ownership failures;
- malformed snapshot handling;
- refresh/reconnect behavior;
- projection rebuild;
- asset-reference validation;
- World/Region/Playable integration tests;
- deployment verification;
- documentation/log completeness;
- cross-scope asset tests for world-only, region-only, playable-only, and explicitly shared assets.

**Exit evidence:** release verification record with all required evidence and no unresolved foundation blocker.

## Phase relationship

Each phase answers a different question:

```text
Phase 0: Do we understand what we actually have?
Phase 1: Is the editor itself stable at all three map scales?
Phase 2: Is the map representation deterministic across scales?
Phase 3: Can authoritative persistence be trusted?
Phase 4: Can snapshots be saved and restored safely?
Phase 5: Can gameplay data be regenerated safely?
Phase 6: Does the map integrate with the world/environment and scale-scoped asset system?
Phase 7: Is the full designer workflow complete?
Phase 8: Can we prove it survives real failures and release conditions?
```

## Phase-goal rule

A phase goal is a design boundary, not a checklist item. Code may be written only to satisfy the current phase goal or to repair a verified regression blocking that phase.
