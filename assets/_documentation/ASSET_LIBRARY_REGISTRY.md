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

The current GitHub connector used for this project can create/update UTF-8 repository files but does not provide a suitable verified binary upload workflow for the supplied 120+ MB and 250+ MB ZIP libraries. Therefore this commit establishes the **folder structure, provenance registry, and storage contract**, while the original binary packages remain in the supplied project files/checkpoints. Individual binary assets will only be declared present in the repository after a verified binary transfer.
