# Vandrith Asset Library

This directory is the **storage/staging library** for assets intended for the Vandrith project. Assets stored here are not automatically active in the Map Editor or runtime.

## Rule

**Storage is not usage.** Adding an asset to this library does not grant permission for the application to use it. An asset must separately pass licensing/credit review and an explicit project approval before it is referenced by runtime or editor code.

## Project categories

```text
assets/
├── map-editor/       # Assets intended for Map Editor authoring UI/canvas
├── life-build/       # Life/World-building assets
├── inventory/        # Inventory, equipment, item and icon assets
├── characters/       # Character bodies, clothing and character sprites
├── environment/      # Terrain, vegetation, structures and world environment
├── weapons/          # Weapon assets
├── objects/          # General world objects and props
├── ui/               # UI assets
├── effects/          # Visual effects
├── vehicles/         # Vehicle assets
├── animations/       # Animation assets
├── animals/          # Animal assets
├── shared/           # Cross-system assets approved for multiple consumers
├── _source/          # Preserved original source packages; never treated as active assets
└── _documentation/   # Asset manifests, credits, licenses and audit records
```

## Map Editor storage policy

Map Editor assets are grouped by function, not by current implementation. Suggested subcategories include:

- `map-editor/terrain/`
- `map-editor/biomes/`
- `map-editor/world-markers/`
- `map-editor/region-markers/`
- `map-editor/playable/`
- `map-editor/buildings/`
- `map-editor/roads-rivers/`
- `map-editor/navigation/`
- `map-editor/ui/`

These folders are a library boundary only. The Map Editor must not import everything in this directory automatically.

## Source authority

The current audited asset sources supplied to the project include the cleaned master asset library and the LPC finalized review library from the August 2026 asset audit. Their source/credit documentation must remain preserved under `_source/` and `_documentation/` when binary transfer is available.

## Approval states

Every asset record should use one of:

- `approved` — explicitly approved for project use;
- `reviewed` — source/license checked but project usage not yet approved;
- `pending` — needs review;
- `restricted` — retained for reference only;
- `rejected` — must not be used.

No code should select assets solely because they exist in this folder.
