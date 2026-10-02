# Developer Roadmap (kamranahmedse) — Audit Vendrith

## Source
- Official repository: https://github.com/kamranahmedse/developer-roadmap
- Project: roadmap.sh
- Audit date: 2026-10-02
- The public project describes itself as community-driven interactive roadmaps, guides, best practices and questions. Its repository structure includes editor, renderer, scripts and tests areas. Current public material includes roadmaps for frontend, backend, full stack, TypeScript, React, Node.js, game development, software design/architecture, system design and many others. It also includes best-practice and question content. 

## Critical provenance / license finding

The repository's license text is restrictive: it states that the text and images are protected by copyright, permits personal use, and restricts reuse/publication of project files and content without permission.

Decision: DO NOT copy roadmap content, images, diagrams, or other project material into Vendrith. We can learn from the information architecture and engineering patterns, but Vendrith should create its own content and use independently sourced assets.

## 1. Core architecture

The important idea is a content-driven interactive knowledge system:

Structured Content
 -> roadmap nodes
 -> best practices
 -> questions
 -> guides/resources
 -> editor/content layer
 -> renderer
 -> interactive website

The public repository structure separates authoring/editor concerns, rendering, source/content, scripts and tests. This is relevant to Vendrith because map meaning and metadata should remain separate from PixiJS rendering.

Decision: ADOPT concept.

## 2. Structured content as data

Roadmap nodes are represented as structured entities rather than one giant document.

Vendrith can apply the same principle to:
- asset definitions;
- terrain definitions;
- region types;
- editor tools;
- map layers;
- object/entity definitions;
- tutorials/help;
- provenance records;
- editor capabilities.

Example:

Asset
- id
- category
- layer
- dimensions
- preview
- source
- license
- credit
- provenance
- capabilities

Decision: ADOPT.

## 3. Editor and renderer separation

The explicit editor/renderer separation is highly relevant.

Vendrith should continue toward:

Editor / authoring
 -> Map Document
 -> PixiJS Renderer

The editor determines what the map means; PixiJS determines how it is displayed.

This reinforces the rule that PixiJS should not become the source of truth for map state.

Decision: ADOPT strongly.

## 4. Content pipeline and automation

The repository includes content synchronization and maintenance scripts. The useful pattern is:

Authoritative Content
 -> validation
 -> transformation
 -> derived representation
 -> published representation

Vendrith can adapt this to its asset registry:

Asset source + provenance
 -> registry validation
 -> Asset Library metadata
 -> search/index
 -> preview catalog
 -> runtime asset manifest

Decision: ADOPT concept, ADAPT implementation.

## 5. Content validation

A content-driven system needs validation.

Vendrith should eventually validate:
- missing asset ID;
- duplicate IDs;
- missing preview;
- invalid category;
- invalid layer;
- unsupported map size;
- missing source;
- unclear license;
- missing required credit;
- broken asset path;
- malformed terrain metadata.

This directly complements the current asset provenance work.

Decision: ADOPT.

## 6. Interactive documentation

Roadmap.sh treats learning material as navigable interactive content rather than only static documentation.

Vendrith can adapt this into an in-editor knowledge/help system:
- Map Editor Guide
- World Building Guide
- Region Building Guide
- Asset Library Guide
- Terrain Guide
- Layer Guide
- Import/Export Guide
- Troubleshooting
- FAQ
- Keyboard shortcuts

Potential structure:

Editor
 -> Help
    -> World Building
    -> Region Building
    -> Assets
    -> Layers
 -> Learn
    -> tutorials
    -> examples
    -> questions

Decision: ADOPT concept, DEFER full implementation.

## 7. Best-practice content as a first-class domain

Roadmap.sh has best-practice material as a separate content experience.

Vendrith can use:

Documentation
- Guides
- Tutorials
- Best Practices
- Reference
- Troubleshooting

This fits the existing docs and development-protocol approach.

Decision: ADOPT.

## 8. Questions and verification

Roadmap.sh also uses questions as a way to test knowledge.

For Vendrith this could become:
- editor onboarding checks;
- interactive tutorials;
- tooltips with explanations;
- map-design validation;
- asset licensing checks;
- developer onboarding checks.

The deeper lesson is knowledge verification, not merely documentation.

Engineering changes can follow the same principle:

Change
 -> type check
 -> unit tests
 -> editor test
 -> asset validation
 -> persistence test
 -> visual/browser test

Decision: ADAPT.

## 9. Community contribution model

Roadmap.sh is community-driven and has contribution documentation.

For Vendrith this suggests future distinctions between:
- core code contributors;
- asset contributors;
- map/template contributors;
- documentation contributors.

Do not copy the contribution system directly.

Decision: DEFER.

## 10. Testing and browser verification

The modern public repository structure includes tests and Playwright configuration.

The important lesson is testing the interactive experience.

Vendrith should eventually verify:
- editor opens;
- map canvas renders;
- asset library opens;
- asset preview works;
- terrain tool changes state;
- placement/removal works;
- undo/redo works;
- save/load works;
- map-size constraints work;
- world/region classification is respected.

Decision: ADOPT testing philosophy; ADAPT to Vendrith's existing stack.

## 11. What NOT to copy

Do not copy:
- roadmap text;
- diagrams;
- images;
- restricted project content;
- branding;
- their content database;
- their license assumptions.

Do not treat the repository as an asset source.

## 12. Vendrith architecture inspired by Developer Roadmap

The strongest transferable architecture is:

AUTHORING
 -> Structured Domain Content
 -> Validation
 -> Derived Index
 -> Interactive UI
 -> Editor / Library / Docs
 -> Renderer

For Vendrith:

Asset Registry
 -> Asset Library
 -> World Building
 -> Region Building
 -> Search
 -> Preview
 -> Provenance
 -> Runtime manifest

The registry is the authoritative metadata layer; thumbnails, search indexes and manifests are derived representations.

## 13. ADOPT / ADAPT / DEFER / N/A

### ADOPT
- structured content/data model;
- authoring vs rendering separation;
- content validation;
- generated/derived representations;
- best-practice documentation as first-class content;
- interactive documentation/help concept;
- browser/integration verification;
- content maintenance scripts;
- registry-driven UI.

### ADAPT
- roadmap node model -> asset/tool/map-domain entities;
- content pipeline -> asset/provenance registry pipeline;
- questions -> editor verification/onboarding;
- best practices -> Vendrith development/editor guides;
- editor/renderer separation -> map document/PixiJS separation;
- community contribution -> future asset/documentation contribution workflow.

### DEFER
- public community roadmap platform;
- full interactive tutorial system;
- public question bank;
- large content CMS;
- public contribution marketplace.

### N/A
- copying roadmap content;
- using roadmap images/assets;
- replacing Next.js/PixiJS with this project's stack solely because of this reference;
- making roadmap.sh a runtime dependency.

## 14. Final conclusion

This is a strong architecture/content-management reference, but not an asset/code library for Vendrith.

The most valuable lesson is:

Treat structured knowledge and metadata as first-class data, validate it, then generate multiple user experiences from the same source.

For Vendrith this can eventually unify:

Asset / Tool / Map Metadata
 -> Validated Registry
 -> Asset Library + Editor + Docs/Help
 -> PixiJS
 -> Map Data

This fits especially well with the existing asset provenance and Asset Library work.

## License / provenance warning

Use the repository for architectural inspiration and factual study only. Do not copy its roadmap content, images, diagrams, or project material into Vendrith without explicit permission. The repository license is restrictive.
