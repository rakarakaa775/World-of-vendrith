# WORLD Natural Landforms Audit — Mountains, Hills, Cliffs & Rocks — 2026-09-26

## Scope

Focused audit of natural landform binaries currently staged under:
`assets/world/world/02_TILES_AND_TERRAIN/`

This stage covers **23 filename-identifiable landform assets**:
- 9 mountain-related files
- 3 hill files
- 4 cliff files
- 7 rock files

The audit is classification/provenance metadata only. No PNG is moved, renamed, duplicated or modified.

## Canonical WORLD binding

```text
WORLD
├── 03_MOUNTAINS
├── 04_HILLS
├── 05_CLIFFS
└── 06_NATURAL_ROCK_FORMATIONS
```

## Mountains — 9

| File | Binding | State |
|---|---|---|
| `8__mountains-v6-tmw.png` | Mountains / TMW-derived | Source-specific license verification required |
| `8__mountains-v6-tmw-snow.png` | Mountains / TMW-derived / Snow | Source-specific license verification required |
| `8__mountains-v6-tmw-snow-overlay.png` | Mountains / TMW-derived / Snow Overlay | Source-specific license verification required |
| `LPC_Overworld__Mountains.png` | Mountains / Overworld | Source family identified; exact binary mapping pending |
| `lpc-tileset-16x16__tileset_mountains.png` | Mountains / 16x16 Tileset | Exact source mapping pending |
| `lpc-tileset-16x16__tileset_mountains2.png` | Mountains / 16x16 Tileset Variant | Exact source mapping pending |
| `mountains__mountains-v6-snow.png` | Mountains / Snow | LPC Mountains candidate; exact binary mapping pending |
| `mountains__mountains-v6-snow-overlay.png` | Mountains / Snow Overlay | LPC Mountains candidate; exact binary mapping pending |
| `tiled__mountains-v6.png` | Mountains / Tiled Source/Reference | Treat as source/reference until visual role is verified |

The main [LPC] Mountains source explicitly covers mountains, hills, cliffs and rocks and provides snowy variants. It requires attribution from `CREDITS-mountains.txt`. citeturn0search0

The three `*-tmw*` assets are **not** automatically assigned the ordinary LPC Mountains license. OpenGameArt publishes “[LPC] Mountains from The Mana World” separately under **GPL 2.0**, with its own attribution chain. citeturn0search3

## Hills — 3

| File | Binding | State |
|---|---|---|
| `LPC_Overworld__Hills.png` | Hills / Grass | [LPC] Overworld candidate |
| `LPC_Overworld__Hills Desert.png` | Hills / Desert | [LPC] Overworld candidate |
| `LPC_Overworld__Hills Snow.png` | Hills / Snow | [LPC] Overworld candidate |

The [LPC] Overworld source explicitly lists mountains and hills, including grass, desert and snow terrain, and is licensed CC-BY-SA 3.0 / GPL 3.0. Its attribution identifies Benjamin K. Smith and component contributors for grass/water and sand/snow. citeturn1search0

## Cliffs — 4

| File | Binding | State |
|---|---|---|
| `LPC_Overworld__Cliffs.png` | Cliffs | [LPC] Overworld candidate |
| `LPC_Overworld__Water Cliff Sand.png` | Cliffs / Water / Sand | [LPC] Overworld candidate; transition role |
| `LPC_Overworld__Water Cliff Snow.png` | Cliffs / Water / Snow | [LPC] Overworld candidate; transition role |
| `tilesets_edit__7_grass_cliff.png` | Cliffs / Grass | Exact source mapping pending |

The separate “LPC cliffs/mountains with grass top and more!” source is CC-BY-SA 3.0 + GPL 3.0 and requires attribution to the original contributors; its page specifically describes grass-topped mountain/cliff variants and snow/dark-dirt transitions. citeturn0search1turn0search2

Therefore `tilesets_edit__7_grass_cliff.png` must not be automatically assigned to that source solely from the filename.

## Natural Rocks — 7

| File | Binding | State |
|---|---|---|
| `LPC_Overworld__Rocks.png` | Natural Rocks / Normal | [LPC] Overworld candidate |
| `LPC_Overworld__Rocks Desert.png` | Natural Rocks / Desert | [LPC] Overworld candidate |
| `LPC_Overworld__Rocks Snow.png` | Natural Rocks / Snow | [LPC] Overworld candidate |
| `LPC_Overworld__Rocks Water.png` | Natural Rocks / Water | [LPC] Overworld candidate |
| `rocks__rocks.png` | Natural Rocks / Normal | [LPC] Rocks candidate |
| `rocks__rocks-snow.png` | Natural Rocks / Snow | [LPC] Rocks candidate |
| `rocks__rocks-snow-overlay.png` | Natural Rocks / Snow Overlay | [LPC] Rocks candidate |

The dedicated [LPC] Rocks source is CC-BY-SA 4.0 / CC-BY-SA 3.0 and requires the full information from `CREDITS-rocks.txt`. The source is a multi-author collection, so individual rock provenance should not be collapsed into a single creator without inspecting the credits file. citeturn1search1

## Important source separation

### A. LPC Mountains
Use for ordinary mountains/hills/cliffs/rocks only where the binary is actually traced to that package. The source states CC-BY-SA 4.0 and CC-BY-SA 3.0 and requires all authors from `CREDITS-mountains.txt`. citeturn0search0

### B. Mountains from The Mana World
Keep separate. The dedicated source is GPL 2.0 and has a different attribution chain. citeturn0search3

### C. LPC Overworld
Keep as its own source family. The package contains mountains, hills, rocks and other natural terrain, but also contains REGION/man-made content. Only the natural components belong in WORLD. The source is CC-BY-SA 3.0 / GPL 3.0. citeturn1search0

### D. LPC Rocks
Keep as its own provenance family because it aggregates many original contributors and explicitly supplies a credits file. citeturn1search1

### E. Grass-top cliff/mountain derivative
Keep separate from the ordinary LPC Mountains family until exact binary identity is verified. Its source page states CC-BY-SA 3.0 + GPL 3.0 and gives a specific attribution chain. citeturn0search1

## Classification rule

Filename semantics may establish a **candidate WORLD role**, but they do not establish exact provenance.

Therefore:

```text
filename
  ↓
candidate natural-landform binding
  ↓
visual/source comparison
  ↓
exact source family
  ↓
license + attribution
  ↓
binary identity/checksum
  ↓
Asset Library approval
```

## Explicit exclusions

- `lpc_terrain__lavarock.png` remains in the volcanic terrain audit and is not duplicated into Natural Rocks.
- Buildings, towns, castles, docks, ships and other man-made Overworld assets remain REGION.
- Tiled/reference artifacts are not automatically treated as production spritesheets.

## Current result

**23 natural-landform records are now classified by role.**

Classification is complete for the filename-level pass, while exact binary/source matching remains pending for ambiguous files. No guessed creator or license is assigned.
