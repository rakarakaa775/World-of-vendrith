# LPC Terrains — Binary Verification Checkpoint — 2026-09-26

## Scope

Repository files:

`assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__*.png`

Exact audited set: **59 files**.

## Repository-side binary verification

All 59 files are tracked through Git LFS. Their Git LFS pointer OIDs were read directly from the repository and stored in `asset_binary_verifications`.

Result:

- 59/59 have a repository-side SHA-256/LFS OID
- 59/59 have `verification_status = verified`
- method: `git-lfs pointer OID`

The OID is the SHA-256 content identity recorded by Git LFS for the repository object.

## Critical provenance boundary

This checkpoint does **not** prove that the 59 binaries are byte-identical to the official OpenGameArt `lpc-terrains.zip`.

The official source page identifies:

- [LPC] Terrains by bluecarrot16 and contributors
- CC-BY-SA 4.0 / CC-BY-SA 3.0
- full attribution from `CREDITS-terrain.txt`
- OpenGameArt source link required

The source page also documents that some textures were adapted from other submissions. Therefore source-family identification must not be treated as proof of individual binary provenance.

### Current security/provenance state

| Layer | Status |
|---|---|
| Repository file exists | VERIFIED |
| Git LFS content hash | VERIFIED |
| Source family | VERIFIED |
| License family | VERIFIED |
| Individual source binary match | **PENDING** |
| Exact upstream archive SHA-256 comparison | **PENDING** |
| Final usage approval | **PENDING** |

No asset was promoted to final approval merely because it has a credit requirement.

## Next gate

The next gate is source-archive/binary reconciliation:

1. obtain the official source archive;
2. inspect its internal file tree;
3. calculate SHA-256 for source files;
4. compare against the 59 repository LFS OIDs;
5. identify exact matches;
6. mark non-matches as `mismatch` or `unavailable`;
7. only then resolve final license/attribution status per binary.

## Migration

`supabase/migrations/20260926110000_asset_library_lpc_terrain_binary_verification_v1.sql`

Commit: `f5529551df15b2b3420b9f9cdf3999ee0f3d348c`

## Source

OpenGameArt: https://opengameart.org/content/lpc-terrains
