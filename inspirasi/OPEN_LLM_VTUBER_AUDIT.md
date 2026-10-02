# Open-LLM-VTuber — Audit Vendrith

## Source
- Official organization: https://github.com/Open-LLM-VTuber
- Backend: https://github.com/Open-LLM-VTuber/Open-LLM-VTuber
- Frontend: https://github.com/Open-LLM-VTuber/Open-LLM-VTuber-Web
- Audit date: 2026-10-02
- Current status: v1.x maintenance while v2.0 is being planned/re-written. The README says v2.0 is a complete rewrite and is in early discussion/planning. 

## Executive summary

Open-LLM-VTuber is not directly relevant to Vendrith as a VTuber product, but it is a useful reference for modular application architecture.

Strong transferable patterns:
- frontend/backend separation;
- capability/provider abstraction;
- factory-based engine selection;
- typed configuration models;
- configuration inheritance/overrides;
- service-context/dependency injection;
- explicit message/event routing;
- pluggable Agent interface;
- MCP/tool integration behind an abstraction;
- scoped connection/session state;
- CI/security/quality automation;
- repository-specific AI coding instructions.

Decision: ADOPT concepts, ADAPT implementation, do not adopt the VTuber runtime.

## 1. Frontend/backend separation

The project separates its backend from its React/TypeScript frontend. The backend exposes API/WebSocket services, while the frontend is maintained separately and linked as a git submodule. Documentation states that alternative frontends can be developed by adapting to the backend API, mainly the client WebSocket endpoint.

Vendrith can use the same boundary:

Editor UI
 -> typed application/domain API
 -> map/document services
 -> persistence
 -> PixiJS renderer

The key lesson is that UI components should not own domain logic merely because they display it.

Decision: ADOPT strongly, ADAPT to Next.js + PixiJS.

## 2. Provider/engine abstraction

Open-LLM-VTuber supports many LLM, ASR and TTS implementations behind common configuration/factory mechanisms.

Vendrith equivalent:

Tool / Service Interface
 -> concrete implementation
    -> local implementation
    -> Supabase implementation
    -> Vercel/API implementation
    -> future AI provider

Useful for future AI-assisted map generation, import/export providers, asset processing, or search.

Decision: ADOPT.

## 3. Factory pattern

The project uses factories to select engines from configuration.

Vendrith can use factories/registries when there is a genuine family of interchangeable implementations:
- asset loader;
- map importer;
- map exporter;
- AI provider;
- search provider;
- image/thumbnail processor.

Do not create factories where there is only one implementation.

Decision: ADAPT selectively.

## 4. Type-safe configuration

The project uses Pydantic configuration models to validate YAML configuration and maintain structured settings. Default templates are maintained alongside validation models.

Vendrith can apply the same principle with TypeScript schemas/types:

Config
 -> schema validation
 -> normalized config
 -> runtime services

Targets:
- editor configuration;
- map limits;
- asset registry;
- provider configuration;
- feature flags;
- import/export settings.

Decision: ADOPT concept, ADAPT to TypeScript/Next.js.

## 5. Configuration inheritance / presets

Character configurations override only selected fields from a base configuration. This is a useful generic pattern.

Vendrith can use:

Base Project Configuration
        +
World / Region / Editor preset
        |
        v
Normalized runtime configuration

Decision: ADOPT concept.

## 6. Service Context / dependency injection

The backend documents a central service context that manages engines and creates a scoped context for each WebSocket connection.

Vendrith can adapt this to:

Editor Session
 -> Project Context
    -> Map Document
    -> Asset Registry
    -> History Manager
    -> Persistence service
    -> Conflict service
    -> optional AI service

Avoid a giant global singleton. Scope context deliberately.

Decision: ADOPT concept, ADAPT carefully.

## 7. Event/message routing

Open-LLM-VTuber has explicit WebSocket message types and handler registration.

Vendrith has similar editor operations:
- map load;
- map resize;
- tile placement;
- object placement;
- asset selection;
- undo;
- redo;
- save;
- conflict;
- import;
- export.

A typed command/event registry can make these flows easier to test and observe.

Important distinction:
- commands change state;
- events describe something that happened;
- rendering events are not the source of truth.

Decision: ADOPT concept, ADAPT to the map-command/history model.

## 8. MCP/tool integration

The project has an MCP subsystem and configuration for enabling MCP servers.

For Vendrith, MCP should remain an optional integration boundary rather than being embedded into every editor component.

Potential future tools:
- asset search;
- documentation search;
- code intelligence;
- map analysis;
- asset provenance lookup;
- automated validation.

This connects with the previous codebase-memory-mcp and CodeGraph audits.

Decision: ADOPT boundary, DEFER broad implementation.

## 9. Repository instructions / AI-assisted development

The repository contains CLAUDE.md, Copilot instructions, Cursor rules and Gemini guidance. These define architecture, commands, coding standards and development practices.

Vendrith already has its own .ai instructions, skills, agents, memory and development protocol.

Lesson: keep repository-specific AI guidance close to the code and synchronize it with actual architecture. Do not copy their instruction files verbatim.

Decision: ADOPT concept.

## 10. Quality and security automation

The repository includes CodeQL, Ruff, pre-commit and GitHub Actions.

Vendrith equivalents:
- TypeScript type checking;
- ESLint;
- dependency/security scanning;
- deterministic CI installation;
- unit/integration tests;
- browser/editor verification;
- GitHub Actions;
- secret scanning where appropriate.

Decision: ADAPT.

## 11. Offline/local-first capability

Open-LLM-VTuber emphasizes offline operation and supports local models as well as cloud APIs.

General Vendrith lesson: separate local capability from remote capability.

Examples:
- local asset preview should not require cloud APIs;
- basic map editing should remain useful when remote services are unavailable where technically feasible;
- AI-assisted features should be optional, not required for core editing.

Decision: ADOPT principle, ADAPT.

## 12. Persistence and resumability

The project persists chat logs and lets users continue previous conversations.

Vendrith can apply the artifact-lifecycle idea to:
- map documents;
- autosave;
- editor history checkpoints;
- asset selections;
- generated/imported artifacts;
- project metadata.

Vendrith's existing database/document model remains authoritative.

Decision: ADOPT concept, ADAPT storage.

## 13. Versioning and breaking changes

The project explicitly documents breaking changes and an upgrade path, and its configuration has an explicit version.

Vendrith should version:
- map document schema;
- asset metadata schema;
- project metadata;
- migrations;
- import/export formats.

A saved map should declare its schema version so future migrations are deterministic.

Decision: ADOPT strongly.

## 14. What NOT to copy

Do not copy:
- Python/FastAPI stack;
- WebSocket architecture everywhere when HTTP/server actions are sufficient;
- large provider catalogs without a real need;
- desktop/Electron/Live2D architecture;
- audio/video processing;
- global service containers without clear scope;
- configuration files as a replacement for database-backed project state;
- third-party sample assets merely because the main project is MIT.

The project explicitly states that its bundled Live2D sample models are governed separately under Live2D terms and are not covered by the project's MIT license. Repository license is not automatically the license of every bundled asset.

## 15. Vendrith architecture derived from this reference

User
 |
 v
Next.js / Editor UI
 |
 v
Typed Commands / Application Services
 |
 +-----------------------------+
 |             |               |
 v             v               v
Map Domain   Asset Registry   Project Services
 |             |               |
 v             v               v
History      Provenance      Persistence
 |             |
 +------+------+ 
        |
        v
   PixiJS Renderer

Optional:
        |
        +--> AI/MCP adapters
        +--> import/export providers
        +--> code intelligence
        +--> asset processing

Core rule:

Domain state is authoritative; UI, PixiJS, indexes, caches and AI context are derived/consuming layers.

## 16. ADOPT / ADAPT / DEFER / N/A

### ADOPT
- frontend/backend separation;
- provider abstraction;
- typed configuration;
- configuration overrides/presets;
- scoped service context;
- typed command/event routing;
- optional MCP/tool boundary;
- repository-specific AI instructions;
- versioned schemas and migrations;
- resumable/persistent artifacts;
- local-first principle where useful.

### ADAPT
- factories -> TypeScript registries/factories;
- Pydantic validation -> TypeScript schema validation;
- WebSocket message handlers -> typed editor commands/events;
- CI/Ruff/CodeQL practices -> Next.js/TypeScript equivalents;
- chat history -> map/project artifact history;
- provider engines -> asset/import/export/AI adapters.

### DEFER
- real-time voice interaction;
- Live2D;
- ASR/TTS;
- desktop pet;
- full offline LLM runtime;
- broad MCP server ecosystem;
- multi-user conversation system.

### N/A
- replacing Next.js with FastAPI;
- replacing PixiJS with Live2D;
- using Open-LLM-VTuber as a Vendrith dependency;
- copying its character/VTuber assets into Vendrith.

## 17. Final conclusion

Open-LLM-VTuber is a strong reference for modular, configurable, provider-independent application design, not for Vendrith's visual/editor technology.

Most valuable lesson:

Define stable interfaces around capabilities, keep implementations replaceable, validate configuration at boundaries, and keep UI/rendering separate from domain state.

This complements the previous references:
- Developer Roadmap -> structured content/registry and validation
- Open Higgsfield -> capability-driven UI and asynchronous jobs
- Codebase Memory MCP -> structural code intelligence
- CodeGraph -> project memory and AI context
- Open-LLM-VTuber -> modular providers, configuration, service boundaries and tool integration

Together these references point toward a Vendrith architecture that is modular without becoming a collection of unnecessary abstractions.

## License / asset provenance

The main project is MIT, but the repository explicitly states that bundled Live2D sample models are under separate Live2D licensing terms. Do not treat the MIT license as permission to reuse every asset in the repository.
