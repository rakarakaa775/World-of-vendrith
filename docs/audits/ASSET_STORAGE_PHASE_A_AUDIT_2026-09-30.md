# Asset Storage Phase A Audit — 2026-09-30

Status: **PASS WITH FOLLOW-UP**

## Scope

Phase A validates the existing Asset Library registry, Supabase Storage target, archive inventory, hash/dedup state, and blockers before any binary ingestion.

No map/terrain/building foundation was changed.

## Current database state

Project: `ojtmfokjcirvjvhnbnos`

- `asset_registry`: 93 records
- `asset_files`: 93 records
- verified: 92
- unavailable: 1
- verified records with SHA-256: 92
- verified records missing SHA-256: 0
- Supabase Storage bucket: `vandrith-assets`
- bucket public: true
- Storage objects currently present: 0

### Unavailable record

The single unavailable record is:

- `LPC Revised Buildings`
- source path: external OpenGameArt URL
- verification status: `unavailable`
- SHA-256: null

It is excluded from binary ingestion until independently verified.

## Deduplication findings

Two exact duplicate SHA-256 groups exist in the registry:

1. SHA-256 `3080b621e33edb16fd0c9805689313d1a6c968b939eac915a1a3c574692e1012`
   - `tile_water.png`
   - `lpc_terrain__water.png`
   - same logical source path appears twice

2. SHA-256 `93b9933a2f12080cb7fc6a6490d6e5e606df90dc85c89d51ea52083172c3e844`
   - `tile_sand.png`
   - `lpc_terrain__sand.png`
   - same logical source path appears twice

These must become **one physical Storage object per SHA-256**, while both registry identities may continue referencing that canonical binary until a separate registry cleanup is approved.

## Archive inventory

### ASSET_GAME_MASTER_2026-08-25_CLEANED.zip

- 29,753 image files
- 191,214,876 bytes of image payload
- 29,753 unique SHA-256 values
- 0 duplicate SHA-256 groups within the archive

### Asset-library-LPC_Finalized_Review.zip

- 10,562 image files
- 372,309,371 bytes of image payload
- 10,562 unique SHA-256 values
- 0 duplicate SHA-256 groups within the archive

The archive-level result is consistent with the project rule that physical binaries should be deduplicated before canonical Storage ingestion.

## Canonical Storage target

The existing bucket `vandrith-assets` is retained as the canonical binary repository.

Recommended object key convention:

`assets/<sha256>/<safe-file-name>`

Example:

`assets/e449c7e98b948a8f035ea3eec1ee2a268947dcab85ea52adb7abfc5be7762174/LPC_Overworld__Mountains.png`

The SHA-256 path makes physical deduplication deterministic and prevents filename collisions.

## Required binding for Phase B

`asset_files` should gain canonical Storage binding fields before bulk ingestion:

- `storage_bucket`
- `storage_path`

Optional resolver metadata can remain in `metadata` if the existing schema policy prefers avoiding additional columns.

The existing `asset_id` remains the stable identity. The Storage object is the physical representation.

## Resolver target

Future consumption path:

`asset_id -> asset_files -> storage_bucket/storage_path -> runtime URL`

World Builder, Asset Library preview, and future runtime consumers should resolve assets through this path instead of directly depending on GitHub/raw/external URLs.

## Safety gates before Phase B

1. Do not ingest the unavailable asset.
2. Do not create a second Storage bucket.
3. Do not delete or rewrite registry records solely because two records share a SHA-256.
4. Do not replace source/provenance evidence with Storage metadata.
5. Do not migrate World Builder consumption until the canonical resolver has been tested.
6. Verify a pilot binary by SHA-256 after upload before bulk ingestion.

## Phase A conclusion

The project is ready for a **controlled Phase B pilot ingestion**.

The first pilot should use one already-verified, small PNG whose SHA-256 is known, upload it to `vandrith-assets`, verify Storage metadata and downloaded bytes reproduce the same SHA-256, then bind only that asset's `asset_files` record.

No bulk upload should occur until the pilot passes.
