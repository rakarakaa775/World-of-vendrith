# Legacy Map Editor Storage

**Status:** Legacy compatibility/storage boundary

This folder is retained temporarily while the project migrates from **Map Editor** terminology to **Vendrith World Builder**.

It is **not** the canonical definition of the Vandrith World map architecture.

## Current World Builder Layers

The active map-role architecture is:

- **WORLD** — natural environment only.
- **REGION** — regional/location context.
- **PLAYABLE** — concrete exterior gameplay content.
- **INTERIOR** — indoor map content.

These are World Builder roles and do not require four duplicated binary asset libraries.

## What remains here

Existing editor-specific resources and previously verified files may remain here during migration.

Examples:

- editor-only visuals;
- legacy terrain files;
- navigation/editor helpers;
- historical map-editor resources.

Existing verified binaries must not be moved or deleted merely because the folder is being deprecated. Provenance, license, attribution, registry identity, and SHA-256 must remain intact.

## Migration Rule

Do not add new architecture to this folder.

New World Builder implementation should follow:

```
VENDRITH WORLD BUILDER
├── WORLD
├── REGION
├── PLAYABLE
└── INTERIOR
```

Canonical assets remain in their appropriate asset libraries. World Builder uses explicit asset references/bindings instead of duplicating binaries.

See:

- `assets/_documentation/VENDRITH_WORLD_BUILDER_MIGRATION_PLAN.md`
- `assets/_documentation/MAP_EDITOR_MIGRATION_AUDIT.md`
- `assets/_documentation/WORLD_ASSET_AUDIT.md`
- `assets/_documentation/REGION_ASSET_AUDIT.md`
- `assets/_documentation/INTERIOR_ASSET_AUDIT.md`

The folder may be removed only after active consumers and binary references have been migrated and verified.
