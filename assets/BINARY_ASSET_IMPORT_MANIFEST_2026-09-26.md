# Binary Asset Import Manifest — 2026-09-26

Source archive: `Asset-library-LPC_Finalized_Review.zip`

## Canonical import categories

| Category | Source path(s) | Binary count | Approx. package size |
|---|---|---:|---:|
| World | `02_TILES_AND_TERRAIN/` | 681 | 43 MB |
| Region | `11_MAP_PROJECTS/` | 14 | 239 KB |
| Playable | `01_CHARACTERS/`, `04_WEAPONS/`, `08_VEHICLES/`, `09_ANIMATIONS/`, `10_ANIMALS/` | 7,061 | 307 MB |
| Interior | interior/house binaries from `05_OBJECTS/` + `12_SOURCE/LPC_Submissions__Interior.psd` | 19 | 2.9 MB |

## Integrity rules

- Original binary formats are preserved.
- No conversion, resize, re-encoding, or renaming was performed.
- `03_DUPLICATES/` is not used as canonical source.
- `playable` is an import category assembled from existing source-library asset classes; the source archive does not contain a literal `playable/` directory.
- These categories do not alter the map editor/building system.

## Local binary packages

The complete binary packages are kept outside the Git tree because the playable package is ~307 MB and GitHub repository binary limits/LFS requirements must be handled separately.

Packages:
- `world-binary-originals.zip`
- `region-binary-originals.zip`
- `playable-binary-originals.zip`
- `interior-binary-originals.zip`

SHA-256 values are recorded in `SHA256SUMS.txt` in the generated package.
