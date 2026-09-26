# WORLD Forest / Woodland / Conifer / Jungle Audit — 2026-09-26

## Scope

Focused audit of natural vegetation candidates under `assets/world/world/02_TILES_AND_TERRAIN/`.

The audit separates:
- forest terrain / forest tiles
- woodland / deciduous tree assets
- conifer / evergreen candidates
- seasonal vegetation
- fruit/orchard trees
- jungle
- general plants/understory

This is a metadata/provenance audit. PNGs are not duplicated or relocated merely to express these bindings.

## Repository enumeration

Exactly **25 PNG candidates** currently match forest/tree/plant/jungle/season semantics in the WORLD terrain staging path.

### Forest terrain

1. `LPC_forest__forest_tiles.png`
2. `LPC_Overworld__Forest.png`
3. `LPC_Overworld__Forest Snowy.png`

**Binding:** WORLD / FOREST.

`[LPC] Forest tiles` is a distinct multi-author pack by Reemax with collaborators Sharm, Hyptosis, Johann C, Beast and William.Thompsonj. It is licensed CC-BY-SA 3.0, GPL 3.0 and GPL 2.0 and requires the source credits file. citeturn1search1turn1search2

`[LPC] Overworld` is a separate source family and must not be silently merged into the Forest tiles credit record. Its natural forest material belongs to WORLD, while its structures and other man-made material belong elsewhere.

### Deciduous / woodland trees

4. `lpc-trees__trees-brown.png`
5. `lpc-trees__trees-dead.png`
6. `lpc-trees__trees-green.png`
7. `lpc-trees__trees-orange.png`

**Binding:** WORLD / FOREST / WOODLAND / DECIDUOUS.

The official `[LPC] Trees` source is by bluecarrot16 and is CC-BY-SA 3.0. The source page requires the authors listed in `CREDITS-trees.txt` and a link back to the OpenGameArt page. citeturn0search2

### Seasonal / modified tree candidates

8. `8__LPCSeasonedTrees.png`
9. `8__LPCsnowTrees.png`
10. `LPC_Modifed_Art__LPC_Trees.png`

**Binding:** WORLD / FOREST / SEASONAL or MODIFIED-TREE candidate.

These filenames indicate a tree/season role but do not establish exact upstream binary identity. They remain provenance-pending until the source package/file path and binary checksum are reconciled.

### Fruit / orchard trees

11. `AppleTree_allSeasons.png__AppleTree_allSeasons.png`
12. `lpc-fruit-trees__fruit-trees.png`
13. `10__orangetrees.png`

**Binding:** WORLD / FOREST / ORCHARD-VEGETATION, with optional agricultural-region binding later.

`[LPC] All Seasons Apple Tree` is by Death's Darling, CC-BY-SA 3.0, and its attribution identifies Johann C's tree trunk as the upstream component. citeturn2search1

`[LPC] Fruit Trees` is by bluecarrot16, Joshua Taylor and cynicmusic, commissioned by castelonia, with CC-BY-SA 4.0, CC-BY-SA 3.0 and GPL 3.0; the page requires all information in `CREDITS-fruit-trees.txt` and a link back to the source page. citeturn2search0

`LPC Orange Trees` is a separate source by Nemisys, licensed CC-BY-SA 3.0 and GPL 3.0, based on trees by C. Nilsson and recolored by William.Thompsonj. citeturn1search4

### Other tree / plant candidates

14. `LPC_Submissions_Merged_2.0__cherry_blossom_trees.png`
15. `LPC_Submissions_Merged_2.0__whitheredtree by Barbara Rivera.png`
16. `LPC_Submissions_Merged_2.0__plants.png`
17. `9__plant repack.png`
18. `tilesets_edit__3_plants.png`
19. `lpc-flowers-plants-fungi-wood__plants.png`

**Binding:** WORLD / FOREST / UNDERSTORY or SEASONAL VEGETATION candidate.

The official `[LPC] Flowers / Plants / Fungi / Wood` pack by bluecarrot16 contains flowers, bushes, small trees, mushrooms/fungi, leaves, stumps and logs. It is CC-BY-SA 3.0 and requires the contributors in `CREDITS-plants.txt` plus a source-page link. citeturn2search4

The submission/repack/edited files above are **not** automatically attributed to that pack. They remain source/binary verification pending.

### Jungle

20. `lpc-jungle__jungle.png`
21. `lpc-jungle-v2__giant-fungi.png`
22. `lpc-jungle-v2__giant-plants.png`
23. `lpc-jungle-v2__giant-trees.png`
24. `lpc-jungle-v2__viney-trees.png`

**Binding:** WORLD / JUNGLE.

The current `[LPC] Jungle` source by bluecarrot16 is CC-BY 4.0. The page states that v2 is a major expansion/reworking using upstream work from Sevarihk, pistachio, ansimuz and others; both the old and v2 packages are now CC-BY 4.0, and the credits file must be followed. citeturn1search3

The repository's `lpc-jungle-v2__*` naming is a strong source-family clue, but exact binary identity is still pending.

This is retained as a generic plant candidate rather than being promoted to a specific source family from filename alone.

## Conifer boundary

No filename in the current 25-file enumeration explicitly identifies a dedicated `LPC Conifers` binary.

The official `[LPC] Conifers` source by bluecarrot16 is a separate pack containing coniferous/needled trees and snow-covered evergreen variants. It is licensed CC-BY-SA 3.0, GPL 3.0 and GPL 2.0 and requires the authors in `CREDITS-conifers.txt` plus a source-page link. citeturn1search0

Therefore **no current WORLD binary is promoted to CONIFER solely by source-family expectation**. If a conifer visual exists inside one of the generic/repacked sheets, it requires visual/source comparison before receiving the CONIFER binding.

## Canonical taxonomy

```text
WORLD
├── FOREST
│   ├── WOODLAND / DECIDUOUS
│   ├── CONIFER
│   ├── SEASONAL
│   ├── ORCHARD / FRUIT TREES
│   └── UNDERSTORY / PLANTS
└── JUNGLE
    ├── GIANT TREES
    ├── VINEY TREES
    ├── GIANT PLANTS
    └── GIANT FUNGI
```

This taxonomy is a logical binding model. It does not require binary duplication.

## Provenance status

| Group | Count | Source status |
|---|---:|---|
| Forest terrain | 3 | source families identified; exact binary verification pending |
| Deciduous / woodland trees | 4 | [LPC] Trees source identified; exact binary verification pending |
| Seasonal / modified trees | 3 | filename candidate; exact source/binary verification pending |
| Orchard / fruit trees | 3 | multiple distinct source families identified |
| Plants / understory / submissions | 6 | mixed; exact source mapping pending |
| Jungle | 5 | [LPC] Jungle source identified; exact binary verification pending |
| **Total** | **25** | **No automatic approval from filename** |

## Approval rule

Final Asset Library approval still requires:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

A filename or source-family match is classification evidence, not proof of binary provenance.

## Asset Library implications

The World Building Asset Library should expose these as metadata filters:
- biome: forest / jungle
- vegetation class: woodland / deciduous / conifer / seasonal / orchard / understory
- source family
- license
- attribution status
- binary verification status
- tile/sheet role
- placement capability

This allows the World Builder to preview vegetation without copying binaries into biome folders.

## Sources

- [LPC] Forest tiles — OpenGameArt.org
- [LPC] Trees — OpenGameArt.org
- [LPC] Conifers — OpenGameArt.org
- [LPC] Jungle — OpenGameArt.org
- [LPC] Fruit Trees — OpenGameArt.org
- [LPC] All Seasons Apple Tree — OpenGameArt.org
- LPC Orange Trees — OpenGameArt.org
- [LPC] Flowers / Plants / Fungi / Wood — OpenGameArt.org
- [LPC Revised] 4-Season Terrain — OpenGameArt.org
