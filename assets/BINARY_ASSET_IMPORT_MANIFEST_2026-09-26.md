# Binary Asset Import Manifest — 2026-09-26

## Purpose

This document records the binary import checkpoint from `Asset-library-LPC_Finalized_Review.zip`.

**Important:** the four headings below are **import/staging categories**, not proof that every imported binary belongs to that map layer. Final map-role classification is tracked in `assets/_documentation/BINARY_ASSET_RECONCILIATION_2026-09-26.md`.

## Import checkpoint

| Staging category | Source path(s) | Manifest-reported binary count | Approx. package size |
|---|---|---:|---:|
| WORLD staging | `02_TILES_AND_TERRAIN/` | **600 remaining after first-pass reconciliation** (681 initial) | 43 MB initial package |
| REGION staging | `11_MAP_PROJECTS/` | 14 | 239 KB |
| PLAYABLE staging | `01_CHARACTERS/`, `04_WEAPONS/`, `08_VEHICLES/`, `09_ANIMATIONS/`, `10_ANIMALS/` | 7,061 | 307 MB |
| INTERIOR staging | interior/house binaries from `05_OBJECTS/` + `12_SOURCE/LPC_Submissions__Interior.psd` | 19 | 2.9 MB |

## Canonical architecture

The repository does **not** use these staging folders as replacements for the canonical asset libraries.

- WORLD → natural environment only
- REGION → regional/location context
- PLAYABLE → concrete exterior gameplay content
- INTERIOR → interior map content
- Characters/animals → `assets/characters/`, `assets/animals/` and LIFE_GENERATION bindings
- Weapons → `assets/weapons/`
- Vehicles → `assets/vehicles/`
- Animations → `assets/animations/`
- General objects/buildings → `assets/objects/`

## Integrity

- Original binary formats are preserved.
- No conversion, resize, re-encoding, or renaming is intended by this reconciliation.
- `03_DUPLICATES/` is not a canonical source.
- No binary is duplicated solely to create a map-role category.
- LFS pointers are tracked in Git; actual LFS object availability must be verified separately.
- The reported counts above are the import manifest's checkpoint counts, not independently recomputed final-role counts.

## Known reconciliation findings

The imported package contains source classes that do not map 1:1 to the four map layers. In particular, character, animal, weapon, animation and vehicle material was imported under the PLAYABLE staging heading, while some non-terrain material is present under WORLD staging.

Those files are **preserved**, not deleted. They must be reconciled to their canonical library and assigned a map-role/gameplay binding where appropriate.

See:
`assets/_documentation/BINARY_ASSET_RECONCILIATION_2026-09-26.md`

## Approval rule

Binary presence is not equivalent to license approval. An asset becomes repository-approved only after its source identity, license, attribution requirement, repository path and binary checksum/LFS identity have been reconciled.



## Reconciliation checkpoint

The initial WORLD staging set contained 681 entries. The first-pass audit moved 81 clearly non-WORLD entries to canonical-role staging paths, leaving 600 entries in WORLD staging. The binary LFS pointer identities were preserved during the tree-level move.

The three overworld maritime entries (sailboat, ship, shipwreck) and the animated wall-trap entry remain pending REGION/PLAYABLE classification rather than being guessed.
