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

## Source archive reconciliation

The source package used for this reconciliation is the uploaded:

`Asset-library-LPC_Finalized_Review.zip`

with source files under:

`02_TILES_AND_TERRAIN/`

For the exact 59-file audited set, each source binary was hashed with SHA-256 and compared with the corresponding Vendrith Git LFS OID.

### Final result

| Status | Count |
|---|---:|
| EXACT_MATCH | **59** |
| MISMATCH | **0** |
| SOURCE_MISSING | **0** |
| REPOSITORY_MISSING | **0** |
| **TOTAL** | **59** |

Therefore all 59 checked LPC Terrains binaries are **byte-for-byte identical** between the audited source package and the corresponding Vendrith Git LFS content.

No binary was re-uploaded, re-encoded, resized, renamed, or replaced during this reconciliation.

### Reconciliation fields

The audit record tracks:

- `source_path`
- `vendrith_path`
- `source_sha256`
- `vendrith_sha256`
- `lfs_oid`
- `size_bytes`
- `match`
- reconciliation status

The complete machine-readable reconciliation report is maintained as the local audit artifact:

`LPC_TERRAIN_BINARY_RECONCILIATION_2026-09-26.csv`

## Important correction

An earlier generated reconciliation report temporarily marked `lpc_terrain__brackish.png` as a mismatch because the generated report contained an extra trailing character in its recorded Vendrith LFS OID.

The repository verification migration records the correct OID:

`56f789ffe9233126d9aa68b9eccfc622d3fbe182dc40e389897e731309d6601e`

The source binary is 3,704 bytes and hashes to the same SHA-256. The earlier mismatch was therefore a **reporting error**, not a binary mismatch.

The corrected reconciliation result is **59/59 EXACT_MATCH**.

## Provenance state

| Layer | Status |
|---|---|
| Repository file exists | VERIFIED |
| Git LFS content hash | VERIFIED |
| Source family | VERIFIED |
| License family | VERIFIED |
| Individual source binary match | **VERIFIED — 59/59** |
| Exact source-package SHA-256 comparison | **VERIFIED — 59/59** |
| Binary provenance reconciliation | **VERIFIED — 59/59** |
| Final usage approval | **NOT IMPLIED BY THIS CHECKPOINT** |

This checkpoint establishes binary identity for the audited 59 files. It does not by itself replace the separate license, attribution, semantic classification, or runtime approval records.

## Source and attribution boundary

The official source family is **[LPC] Terrains** by bluecarrot16 and contributors.

The source record identifies CC-BY-SA 4.0 / CC-BY-SA 3.0 licensing and requires the attribution information from `CREDITS-terrain.txt` together with the OpenGameArt source link.

Source-family licensing and attribution remain governed by the existing Asset Library source/license records. Binary identity should not be treated as a substitute for those records.

## Verification rule

For this audited set, provenance is established at the binary-identity layer by:

`source package → source path → SHA-256 → Vendrith path → Git LFS OID`

An equal SHA-256/LFS OID establishes byte-identical content for each checked binary.

## Migration

`supabase/migrations/20260926110000_asset_library_lpc_terrain_binary_verification_v1.sql`

Commit: `f5529551df15b2b3420b9f9cdf3999ee0f3d348c`

## Source

OpenGameArt: https://opengameart.org/content/lpc-terrains

## Audit outcome

**59/59 LPC Terrains binaries: EXACT_MATCH.**

No GitHub binary changes were made during the source-vs-repository reconciliation.
