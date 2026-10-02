# Vendrith Project AI — Technical Architecture v1

## Status

- Status: Proposed architecture
- Target branch: `feat/vendrith-ecc-v1`
- Scope: project-aware AI assistant for the World of Vendrith / Map Editor
- Principle: understand first, plan second, execute only with explicit approval

## 1. Purpose

Vendrith Project AI is an engineering assistant that can understand the Vendrith repository as a connected system rather than treating files as isolated text.

It combines:
- structural code intelligence;
- project rules and architecture documentation;
- asset provenance and licensing metadata;
- Git history and diffs;
- runtime/database context where explicitly authorized;
- an LLM reasoning/agent layer.

The AI is not the source of truth. It composes evidence from authoritative project sources and explains the evidence behind its conclusions.

## 2. Source-of-truth model

| Concern | Authority |
|---|---|
| Source code and history | Git / GitHub |
| Code structure and dependencies | CodeGraph index |
| Architecture decisions | docs/architecture + ADR/project rules |
| Asset provenance/license | Asset Registry |
| Runtime/project persistence | Supabase |
| Verification | tests, typecheck, lint, build, CI |
| AI reasoning | LLM + agent orchestration |

When sources disagree, the AI must surface the conflict instead of silently choosing a value.

## 3. High-level architecture

```text
User
  |
  v
Vendrith Project AI
  |
  +-- Conversation / Context Manager
  |
  +-- Agent / Planner
  |      |
  |      +-- Tool Router
  |             +-- CodeGraph
  |             +-- GitHub / Git
  |             +-- Project Docs
  |             +-- Asset Registry
  |             +-- Supabase (authorized runtime context)
  |             +-- Verification tools
  |
  +-- Policy / Permission Gate
  |
  +-- Evidence + Audit Log
  |
  v
Answer / Plan / Approved Change
```

## 4. Core layers

### 4.1 Context Manager

Builds a bounded context for each request.

Responsibilities:
- identify the user's intent;
- load relevant project rules;
- retrieve only relevant code/documentation context;
- track tool results;
- prevent unnecessary repository-wide prompt loading.

### 4.2 Agent / Planner

Turns the request into:
1. understand;
2. inspect;
3. research unfamiliar APIs if needed;
4. plan;
5. execute only when permitted;
6. test;
7. review;
8. verify;
9. document durable decisions.

This follows the existing Vendrith engineering workflow.

### 4.3 Tool Router

Tools are capability boundaries, not arbitrary shell access.

Initial capability groups:
- code search / file inspection;
- CodeGraph queries;
- Git diff/history;
- project documentation;
- Asset Registry queries;
- verification;
- controlled file edits.

Future capability groups can be added without changing the agent's reasoning model.

### 4.4 Policy / Permission Gate

Every mutating operation passes through a permission boundary.

Modes:

**Explain**
- read-only;
- no repository mutations.

**Plan**
- read-only;
- produces an impact analysis and proposed changes.

**Execute**
- may modify files only after explicit approval;
- records the intended changes;
- runs verification after modification.

**High-risk**
- operations affecting secrets, production data, licensing-sensitive assets, destructive history, or external side effects require an additional explicit confirmation or remain blocked.

## 5. Code intelligence

CodeGraph is the structural map, not the AI brain.

The first useful graph should answer:
- what files/modules exist;
- imports and dependencies;
- callers/callees where available;
- routes and UI-to-service relationships;
- domain/application/infrastructure boundaries;
- likely impact of a change.

Example:

```text
WorldBuilding UI
   -> AssetLibrary
      -> AssetRegistry service
         -> repository
            -> Supabase
```

For a requested change, the AI uses the graph to find affected nodes before proposing edits.

Semantic search and deeper data-flow analysis can be added later.

## 6. Project knowledge

The AI should index durable project knowledge from:
- AGENTS.md;
- .ai/rules;
- .ai/agents;
- .ai/skills;
- docs/architecture;
- ADRs;
- relevant audit/reference documents.

The `inspirasi/` directory is reference material. It must not automatically become production behavior or dependencies.

## 7. Asset intelligence

Asset provenance is a first-class domain.

The Asset Registry should expose structured facts such as:
- asset ID/path;
- category;
- source;
- author;
- license;
- attribution requirement;
- restrictions;
- provenance evidence;
- approval status.

The AI can then answer:

> Can this asset be used in World?

using registry evidence rather than guessing from filenames.

For example, it can distinguish:
- natural terrain -> WORLD;
- bridge/dock/ship/town -> REGION;
- unclear license -> review required.

No asset with unproven permission should be silently approved for the production registry.

## 8. Request lifecycle

### Read-only request

```text
User question
  -> intent classification
  -> retrieve rules
  -> query CodeGraph/docs/registry as needed
  -> synthesize evidence
  -> answer with affected sources
```

### Change request

```text
User request
  -> inspect
  -> impact analysis
  -> plan
  -> show plan
  -> explicit approval
  -> edit
  -> verify
  -> review diff
  -> report
```

### Example: add Deep Sea Water

```text
Request
  -> World Building rules
  -> Asset Registry
  -> existing water categories
  -> CodeGraph impact analysis
  -> proposed schema/UI/renderer changes
  -> approval
  -> implementation
  -> tests/typecheck/build
  -> diff review
```

## 9. Evidence model

AI responses should internally track evidence by source type:

```text
Evidence
  - source
  - path/query
  - relevant fact
  - timestamp/version when applicable
  - confidence
```

The AI should distinguish:
- verified fact;
- project rule;
- inference;
- proposal;
- unresolved conflict.

This prevents an LLM assumption from becoming project truth.

## 10. Memory

Project memory is durable engineering knowledge, not unrestricted chat history.

Good memory:
- architecture decisions;
- accepted/rejected implementation approaches;
- schema decisions;
- asset licensing decisions;
- important compatibility constraints;
- known technical debt.

Bad memory:
- unverified guesses;
- temporary debugging assumptions;
- secrets;
- credentials;
- copied third-party content without provenance.

Durable decisions should be written to project documentation/ADR rather than relying only on model memory.

## 11. Verification pipeline

After an approved code change, the AI should select the smallest appropriate verification set.

Possible stages:
1. targeted tests;
2. TypeScript typecheck;
3. lint;
4. relevant integration/browser tests;
5. build;
6. Git diff review;
7. CI status.

The AI reports failures rather than hiding or working around them.

## 12. Safety and licensing gates

The agent must not:
- expose secrets;
- commit credentials;
- silently alter licensing metadata;
- approve unclear third-party assets;
- modify production data without authorization;
- rewrite history without explicit authorization;
- install dependencies solely because a reference repository uses them.

Open-LLM-VTuber and Ryza AI Revive remain engineering references. Their repository licenses do not automatically license bundled third-party/game assets for Vendrith.

## 13. Initial implementation boundary

V1 should remain small.

### Build first

- Project AI domain types;
- request/response protocol;
- tool interface;
- read-only repository/code search;
- project-rule retrieval;
- CodeGraph adapter interface;
- Asset Registry adapter interface;
- plan + approval state machine;
- evidence records;
- verification runner interface;
- audit logging.

### Defer

- autonomous long-running agents;
- unrestricted shell access;
- automatic production deployment;
- broad MCP ecosystem;
- voice/avatar systems;
- autonomous dependency installation;
- autonomous asset downloading;
- semantic code/data-flow graph until structural graph is stable.

## 14. Adapter principle

The AI core should depend on interfaces, not concrete providers.

```text
AI Core
  |
  +-- CodeIntelligencePort
  +-- RepositoryPort
  +-- DocumentationPort
  +-- AssetRegistryPort
  +-- RuntimeDataPort
  +-- VerificationPort
```

Adapters can later connect these ports to CodeGraph, GitHub, Supabase, local tooling, or another provider without rewriting the agent.

## 15. Proposed project boundary

The eventual implementation should live in a dedicated AI/application area rather than spreading agent logic throughout UI components.

Conceptually:

```text
src/
  ai/
    domain/
    application/
    ports/
    adapters/
    policies/
    context/
    verification/
```

Exact paths should be reconciled with the current repository structure before implementation.

## 16. Design rule

The central rule for Vendrith Project AI is:

> AI reasons over project truth; it does not replace project truth.

The system should therefore prefer:
- evidence over guesses;
- project rules over generic assumptions;
- impact analysis before edits;
- approval before mutations;
- verification after mutations;
- durable documentation for durable decisions.

## 17. Relationship to reference projects

Open-LLM-VTuber contributes architectural inspiration for:
- provider abstraction;
- typed configuration;
- command/event boundaries;
- agent/tool separation.

Ryza AI Revive contributes inspiration for:
- declarative boundaries;
- ports/adapters;
- registry-as-data;
- generated manifests;
- regression invariants;
- privacy/secret gates.

CodeGraph contributes:
- structural code graph;
- dependency analysis;
- impact analysis;
- architecture context.

These ideas are adapted into Vendrith rather than imported as application dependencies.
