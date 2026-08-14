# 08 — Naming Rules

> The Vendrith World — naming conventions across the entire project.
>
> Names are the foundation of readable code and traceable assets. These rules are
> permanent and apply to every file, symbol, table, engine, event, and asset in the
> project. No exceptions.

---

## 1. General Principles

Names must be:

- **Clear.** A name describes what the thing is or does, not how it is implemented.
- **Consistent.** The same concept uses the same word everywhere. No synonyms for the same thing.
- **Descriptive.** A reader understands the name without reading its definition.
- **Predictable.** A contributor can guess a name before looking it up.

Avoid abbreviations unless universally accepted (`url`, `id`, `api`, `http`). No project-specific shorthand. No single-letter names except loop indices in tight scopes.

---

## 2. Folder Names

Use `kebab-case` for all folders.

Examples:

```
world-map
character-system
asset-registry
engine-core
```

- No spaces, no underscores, no `PascalCase` in folder names.
- Folder names describe their contents, not their author or date.
- Follow the existing structure. Do not invent parallel hierarchies.

---

## 3. File Names

- **React Components** — `PascalCase` (`PlayerHud.tsx`, `CharacterCard.tsx`). One component per file; the filename matches the component name.
- **Utilities** — `camelCase` (`formatTime.ts`, `parseSaveData.ts`). The filename matches the default or primary export.
- **Hooks** — `camelCase`, prefixed with `use` (`useTimeEngine.ts`, `useCharacterState.ts`).
- **Contexts** — `PascalCase`, suffixed with `Context` (`TimeEngineContext.tsx`). The provider component matches the context name.
- **Documentation** — `Pascal_Snake_Case.md` for content (`Master_Roadmap.md`, `Project_Vision.md`); `Numbered_Snake_Case.md` for rules (`01_Project_Rules.md`, `08_Naming_Rules.md`).
- **Configuration files** — lowercase, standard extensions (`vite.config.ts`, `tailwind.config.js`, `tsconfig.json`).

No spaces in filenames. No version numbers in filenames — versioning lives in metadata.

---

## 4. Code

- **Variables** — `camelCase` (`playerEnergy`, `currentDay`).
- **Functions** — `camelCase` (`formatTime`, `advanceDay`). Names are verbs for actions, nouns for queries.
- **Classes** — `PascalCase` (`TimeEngine`, `SaveManager`).
- **Interfaces** — `PascalCase` (`TimeState`, `CharacterProfile`). No `I` prefix.
- **Types** — `PascalCase` (`GamePhase`, `ActivityType`).
- **Enums** — `PascalCase` for the enum, `PascalCase` for members (`enum GamePhase { MainMenu, Playing, Paused }`).
- **Constants** — `SCREAMING_SNAKE_CASE` (`MAX_TICK_RATE`, `DEFAULT_DAY_LENGTH`).
- **Private members** — leading underscore (`_internalState`), used only when a private field must be distinguished from a public accessor.

Booleans are prefixed with `is`, `has`, or `can` (`isLoading`, `hasPermission`, `canAdvance`).

---

## 5. Database

All database identifiers use `snake_case`.

- **Tables** — plural, `snake_case` (`characters`, `activities`, `save_slots`).
- **Columns** — singular, `snake_case` (`name`, `created_at`, `energy_level`).
- **Foreign keys** — `<referenced_table_singular>_id` (`character_id`, `activity_id`).
- **Indexes** — `idx_<table>_<column(s)>` (`idx_characters_user_id`, `idx_activities_started_at`).
- **Unique constraints** — `uq_<table>_<column(s)>` (`uq_users_email`).
- **Check constraints** — `ck_<table>_<description>` (`ck_characters_energy_nonnegative`).

No reserved words as identifiers. No abbreviations except universally accepted ones.

---

## 6. Engines

- **Engine modules** — `<Domain>Engine` (`TimeEngine`, `LifeEngine`, `ActivityEngine`).
- **Engine interfaces** — `<Domain>EngineInterface` (`TimeEngineInterface`), defining the public API.
- **Systems** — `<Domain>System` (`WeatherSystem`, `EconomySystem`), for sub-modules within an engine.
- **Managers** — `<Domain>Manager` (`SaveManager`, `EventManager`), for cross-cutting services.
- **Registries** — `<Domain>Registry` (`AssetRegistry`, `ActivityRegistry`), for lookup and catalog services.

An engine name is singular and describes the domain it governs. No abbreviations.

---

## 7. Events

One official event naming format for the entire project:

```
domain:subject:action
```

- **domain** — the engine or system that owns the event (`time`, `player`, `inventory`).
- **subject** — the entity or value the event is about (`day`, `energy`, `item`).
- **action** — what happened, in past tense for state changes (`changed`, `updated`, `added`, `removed`), or present imperative for requests (`advance`, `save`, `load`).

Examples:

```
time:day:changed
player:energy:updated
inventory:item:added
inventory:item:removed
time:day:advance
save:slot:loaded
```

- All lowercase, colon-separated, no spaces, no abbreviations.
- Event payloads are typed and declared in the engine's public API.
- This format is used everywhere — engine-to-engine, engine-to-UI. No alternative formats.

---

## 8. Assets

All asset filenames use `snake_case`.

- **Sprites** — `<subject>_<state>.png` (`player_idle.png`, `npc_walking.png`).
- **Portraits** — `portrait_<character>.png` (`portrait_merchant.png`).
- **Audio (SFX)** — `sfx_<description>.<ext>` (`sfx_door_open.ogg`, `sfx_coin_drop.wav`).
- **Music** — `music_<track>.<ext>` (`music_town_theme.ogg`, `music_battle_fast.ogg`).
- **Animation** — `anim_<subject>_<action>.<ext>` (`anim_player_attack.json`, `anim_npc_wave.json`).
- **Icons** — `icon_<description>.<ext>` (`icon_sword.png`, `icon_potion_health.png`).
- **Tilesets** — `tileset_<region>_<theme>.<ext>` (`tileset_town_summer.png`, `tileset_dungeon_stone.png`).

Rules:

- No spaces, no special characters, no version numbers in filenames.
- Version numbers belong in the registry metadata, not the filename.
- No duplicate filenames across the project.
- Extensions are lowercase and standard for the asset type.

---

## 9. Documentation

- **Markdown files** — `Pascal_Snake_Case.md` for content (`Master_Roadmap.md`, `Project_Vision.md`).
- **Rule books** — `Numbered_Snake_Case.md` (`01_Project_Rules.md`, `08_Naming_Rules.md`), numbered by domain order.
- **Roadmaps** — `Pascal_Snake_Case.md` (`Master_Roadmap.md`, `Playable_v0.1.md`).
- **Design documents** — `Pascal_Snake_Case.md` (`Engine_Template.md`, `Asset_Style_Guide.md`).

No spaces in documentation filenames. No version numbers — versioning is tracked in the document's header or changelog, not the filename.

---

## 10. Future Expansion

- All future systems must follow these naming rules. No exceptions.
- A new system does not invent its own naming convention. It adopts the pattern for its domain.
- When a new domain is introduced, its naming pattern is added to this document before the first file is created.
- These rules are permanent. They do not relax for a deadline, a sprint, or a particular contributor.
