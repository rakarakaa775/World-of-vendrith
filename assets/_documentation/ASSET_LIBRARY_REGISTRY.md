# Vandrith Asset Library Registry

**Status:** Storage baseline / audit-controlled
**Purpose:** Define where approved/reviewed assets are stored and prevent accidental runtime use.

## 1. Current source libraries

The supplied audited asset libraries are:

- `ASSET_GAME_MASTER_2026-08-25_CLEANED.zip` — cleaned master asset library with source/credit/audit documentation.
- `Asset-library-LPC_Finalized_Review.zip` — LPC finalized review library with categorized assets and source/credit documentation.

These source packages are the provenance baseline. Individual assets must retain their source and license attribution.

## 2. Storage categories

| Folder | Intended contents |
|---|---|
| `map-editor/` | World/Region/Playable authoring visuals and editor-only assets |
| `life-build/` | Life and world-building assets |
| `inventory/` | Items, equipment, inventory icons and related visuals |
| `characters/` | Character bases, clothing, hair and character sprites |
| `environment/` | Terrain, vegetation, water and environment scenery |
| `weapons/` | Weapons and shields |
| `objects/` | Buildings, props and world objects |
| `ui/` | UI and interface visuals |
| `effects/` | Effects and particles |
| `vehicles/` | Ships, carts and other vehicles |
| `animations/` | Standalone animation resources |
| `animals/` | Animal assets |
| `shared/` | Explicitly shared cross-system assets |

## 3. Previously audited/approved source records

The August 23, 2026 audit records verified credits for, among others:

- LPC Spear and Shovel Reworked — CC-BY-SA 3.0; attribution recorded in the source audit.
- LPC Smash Weapons — source audit records mixed CC-BY / CC-BY-SA / GPL licensing by source component; attribution and supplied `CREDITS.txt` must remain with the package.
- LPC Full Plate Golden Armor — CC-BY-SA 3.0; attribution recorded in the source audit.
- LPC male mini figure — CC-BY-SA 3.0 and GPL 3.0; attribution recorded in the source audit.

The audit also explicitly records missing source files and unverified credits. Those must not be silently manufactured or treated as approved.

## 4. Approval rule

`approved` means explicitly cleared for project use. `reviewed` means provenance/license was checked but project use still needs an explicit decision. Storage alone never changes an asset's approval state.

## 5. Map Editor separation

Map Editor storage must support all three map scales:

- World Map assets;
- Kingdom/Region Map assets;
- Playable Map assets.

Assets may be shared across scales only when their intended scale and usage are recorded. A World Map marker is not automatically a Playable Map object, and a Playable Map terrain asset is not automatically valid for macro-scale rendering.

## 6. No automatic import

No asset directory in this library may be glob-imported wholesale. Runtime/editor references must point to explicitly approved asset records. This prevents staging assets from silently becoming production dependencies.

## 7. Binary transfer note

The current GitHub connector used for this project can create/update UTF-8 repository files but does not provide a suitable verified binary upload workflow for the supplied large ZIP libraries. Individual binary assets are only declared repository-present after a verified binary transfer.

## 8. Map Editor terrain assets — verified originals

The following two originals were transferred individually from the audited `ASSET_GAME_MASTER_2026-08-25_CLEANED.zip` source into the repository:

| Asset | Registry ID | Approval | Source | License | SHA-256 | Repository path |
|---|---|---|---|---|---|---|
| `tile_grass.png` | `5786048f-8815-4b7e-8c11-9b0e1e973b1c` | approved | `TopDown_RPG_Mockup/tile_grass.png` | CC0 1.0 Universal | `07fc7b9678598db3ee9c9105954897415ef957df12a72def3478ec0ee85b8c0e` | `assets/map-editor/terrain/tile_grass.png` |
| `tile_dirt.png` | `2bbe2076-fea6-4124-a679-7e6114de191c` | approved | `TopDown_RPG_Mockup/tile_dirt.png` | CC0 1.0 Universal | `59dabf609de751119922d06bcfd12cb758f3152ee97ccd628eed24b9299e788a` | `assets/map-editor/terrain/tile_dirt.png` |

Both assets have an approved terrain binding candidate, with `transition_type=full` and `neighbor_mask=255`.

## 9. Sand and water — audit result 2026-09-18

The live Supabase records confirm:

| Asset | Registry | Binding | License | Attribution |
|---|---|---|---|---|
| `tile_sand.png` | approved | approved | CC-BY-SA 3.0 / GNU GPL 3.0 | required |
| `tile_water.png` | approved | approved | CC-BY-SA 3.0 / GNU GPL 3.0 | required |

The supplied LPC archive contains canonical LPC terrain sources including:

- `02_TILES_AND_TERRAIN/lpc_terrain__sand.png`
- `02_TILES_AND_TERRAIN/lpc_terrain__water.png`

The accompanying `terrain__Attribution.txt` identifies the LPC licensing and contributors. The supplied audited libraries do **not** contain a separate universal/CC0 terrain variant for these two terrain types. Therefore we do not substitute an unrelated asset merely to obtain a permissive license.

The canonical LPC source remains the selected source, with its required attribution preserved.

**Binary repository status:** pending verified binary transfer. These files must not be marked repository-present until their binary blobs and checksums are verified.

## 10. Transfer rule

Binary assets are considered repository-present only after the binary blob, repository path, registry identity, provenance/license record, and checksum have all been verified. Future asset additions must follow the same sequence and must not modify the foundation contracts merely to accommodate an asset.
