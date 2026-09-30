# Asset Storage Source Reconciliation — 2026-09-30

## Status
PASS WITH SOURCE-INGESTION FOLLOW-UP

## Scope
Reconcile every verified `asset_files.sha256` against the two audited binary archives before expanding canonical Storage ingestion.

## Evidence
- `asset_files`: 93 rows total.
- Verified binary rows: 92.
- Verified unique SHA-256 values: 90.
- Canonical Storage bindings: 1 pilot row.
- `LPC Revised Buildings` remains unavailable and is excluded.
- `ASSET_GAME_MASTER_2026-08-25_CLEANED.zip`: 29,753 image files; 29,753 unique image SHA-256 values.
- `Asset-library-LPC_Finalized_Review.zip`: 10,562 image files; 10,562 unique image SHA-256 values.
- All 90 unique verified DB SHA-256 values were reconciled to at least one of those two audited archives.
- 21 unique verified hashes occur in the game-master archive only.
- 69 unique verified hashes occur in the LPC review archive only.
- 1 unique verified hash occurs in both archives.

## Safety decision
Do not bulk-ingest the 92 verified rows until each source row has a reachable binary source that reproduces the recorded SHA-256. The uploader remains fail-closed on missing or mismatched source bytes.

## Next controlled step
Resolve source availability per package/archive, then ingest in small batches through the existing SHA-verified canonical uploader. No map/terrain/building foundation changes are required for this storage reconciliation.
