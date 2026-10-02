# codebase-memory-mcp vs CodeGraph — Perbandingan untuk Vendrith

Tanggal audit: 2026-10-02

## Sumber

### A — codebase-memory-mcp
Repository: DeusData/codebase-memory-mcp
URL: https://github.com/DeusData/codebase-memory-mcp
Lisensi: MIT
Implementasi utama: native C
README saat audit: 162 languages, Hybrid LSP, 17 MCP tools.

### B — CodeGraph
Repository: codegraph-ai/CodeGraph
URL: https://github.com/codegraph-ai/CodeGraph
Lisensi: Apache-2.0
Implementasi utama: Rust workspace
README saat audit: 38 languages, 42 community MCP tools, VS Code extension, JetBrains plugin, persistent memory.

Keduanya sama-sama membangun semantic/structural graph untuk AI coding agents, tetapi fokus produknya berbeda.

---

# 1. Persamaan

| Area | codebase-memory-mcp | CodeGraph |
|---|---|---|
| Core idea | Codebase -> graph -> MCP | Codebase -> graph -> MCP |
| Parsing | tree-sitter | tree-sitter |
| Structural graph | Ya | Ya |
| Call/dependency analysis | Ya | Ya |
| Persistent local index | Ya | Ya |
| Incremental indexing | Ya | Ya |
| AI-agent integration | MCP | MCP |
| Semantic search | Ya | Ya |
| Graph traversal | Ya | Ya |
| Impact analysis | Ya | Ya |
| Local code processing | Ya | Ya |
| Visualization | 3D local UI | IDE graph/context tooling |
| Memory | ADR/graph persistence | Explicit project memory subsystem |
| Docs intelligence | ADR-focused | Markdown/design-doc subsystem |

Jadi keduanya berada pada keluarga solusi yang sama: code intelligence layer untuk agent, bukan application framework seperti Next.js.

# 2. Perbedaan inti

## 2.1 Fokus utama

### codebase-memory-mcp

Fokus lebih kuat pada:

high-performance code indexing
+
large graph
+
structural queries
+
cross-service graph
+
local MCP server

README menonjolkan 162 bahasa, Hybrid LSP, sub-ms graph queries, cross-service linking, data-flow, IaC, semantic graph edges, dan graph visualization. citeturn1search1turn1search0

### CodeGraph

Fokus lebih kuat pada:

code graph
+
AI context selection
+
persistent working memory
+
design/document intelligence
+
IDE integration
+
PR/change analysis

CodeGraph saat ini mendokumentasikan 42 community MCP tools, memory tools, documentation tools, PR context, VS Code extension, dan JetBrains plugin. citeturn3search0turn3search6

# 3. Tool surface

### codebase-memory-mcp

Current README mendokumentasikan 17 tools, termasuk:
- index_repository
- list_projects
- index_status
- check_index_coverage
- search_graph
- trace_path
- detect_changes
- query_graph
- get_graph_schema
- compare_graphs
- get_code_snippet
- get_file_outline
- get_architecture
- search_code
- manage_adr
- ingest_traces

citeturn1search1

### CodeGraph

Community surface saat ini mendokumentasikan 42 tools. Kelompok penting:
- code analysis;
- navigation;
- memory;
- documentation;
- indexing;
- PR/change analysis.

Memory subsystem sendiri memiliki 7 tools, dan documentation subsystem juga memiliki 7 tools. citeturn3search2turn3search6

Implikasi untuk Vendrith: jumlah tool bukan tujuan. Yang penting adalah tool surface yang tidak terlalu besar dan setiap tool mempunyai fungsi jelas.

# 4. Structural memory vs working memory

Ini adalah perbedaan paling penting.

## codebase-memory-mcp

Memory utamanya adalah knowledge graph hasil indexing, plus ADR persistence.

Model:

source code
  -> persistent graph
  -> structural knowledge

## CodeGraph

CodeGraph secara eksplisit membedakan:

### Structural memory
Graph + embeddings yang tersimpan persistent.

### Working memory
Catatan eksplisit seperti:
- debugging insight;
- architectural decision;
- known issue;
- project context.

Memory bisa dicari dan dihubungkan kembali ke file/function. citeturn3search4turn3search6

Untuk Vendrith, konsep dua lapisan ini sangat relevan:

Layer 1 — Code Intelligence
graph dari source code

Layer 2 — Project Memory
decisions
discoveries
debugging notes
conventions
known issues

Namun Layer 2 harus terintegrasi dengan sistem memory/decision Vendrith yang sudah ada, bukan menciptakan dua sumber keputusan yang saling bertentangan.

# 5. Documentation intelligence

CodeGraph mempunyai fitur khusus untuk Markdown/design documents:
- index Markdown;
- semantic document search;
- verify design against code;
- detect design gaps;
- generate architecture documentation;
- maintain document sources.

citeturn3search2turn3search7

Ini sangat relevan dengan Vendrith karena repository memiliki architecture docs, audit docs, decision records, development instructions, research notes, dan inspirasi.

Decision: ADOPT konsep documentation ↔ code verification.

Contoh future workflow:

docs/architecture/editor.md
       ↓
CodeGraph-like verification
       ↓
check actual code
       ↓
report:
implemented
missing
renamed
stale

# 6. IDE integration

### codebase-memory-mcp
Lebih MCP/agent-centric dan mempunyai local graph visualization.

### CodeGraph
Memiliki:
- VS Code extension;
- JetBrains plugin;
- CodeLens;
- hover information;
- graph visualization;
- AI context tools.

VS Code package mendokumentasikan pengaturan untuk complexity, callers/tests, embeddings, memory, indexing, dan telemetry. citeturn1search2turn3search0

Vendrith: IDE integration tidak perlu menjadi bagian Map Editor. Ini lebih cocok menjadi developer tooling.

# 7. Storage

| Area | codebase-memory-mcp | CodeGraph |
|---|---|---|
| Main storage | SQLite | RocksDB |
| Graph persistence | Ya | Ya |
| Vector search | local embeddings | local embeddings |
| Query model | SQL/graph + Cypher-like | graph APIs + vector/HNSW |
| Memory persistence | graph + ADR | graph + explicit memory |
| Cross-project | supported | supported |

CodeGraph README menyebut RocksDB untuk graph/embeddings dan HNSW untuk vector indexing. citeturn3search0

Untuk Vendrith, storage engine internal keduanya tidak perlu ditiru.

# 8. Semantic embeddings

### codebase-memory-mcp
Semantic search menggunakan local embedding model dan menggabungkan lexical, AST, type/API/decorator, data flow, MinHash, module proximity, dan graph diffusion signals. citeturn1search1

### CodeGraph
Menyediakan beberapa embedding model/configuration, termasuk BGE-small, Jina Code V2, dan static model option. Full-body embedding juga tersedia. citeturn3search3

Perbedaan penting: CodeGraph lebih eksplisit sebagai configurable embedding/AI-context platform; CBM lebih mengintegrasikan semantic ranking ke graph/search engine.

Vendrith:
- structural search dulu;
- semantic search kemudian;
- embedding model bukan dependency awal.

# 9. Documentation/memory vs structural intelligence

Secara konsep:

CBM:
Code -> Graph -> Query -> Agent

CodeGraph:
Code -> Graph
       -> Memory
       -> Docs
       -> AI Context
       -> IDE
       -> PR analysis

Keduanya tetap overlap besar pada graph layer.

Perbedaannya adalah berapa banyak workflow di sekitar graph yang sudah dibangun.

# 10. Security/privacy difference

### codebase-memory-mcp

Dokumentasi security menyatakan source processing dilakukan lokal dan tidak ada project telemetry; current policy juga menyebut background update check ke GitHub Releases. Repository mendokumentasikan SLSA, Sigstore, checksums, SBOM, CodeQL, fuzzing, network-egress tests, path containment, dan release scanning. citeturn2search0turn2search3

### CodeGraph

CodeGraph community tooling memiliki anonymous telemetry pada extension. Dokumentasinya menyatakan telemetry hanya mengirim data yang di-allowlist seperti tool usage/duration/startup/errors, tanpa source/path/query/PII, dan dapat di-disable. citeturn3search1turn3search2

Jadi:

CBM
local-first + no project telemetry

versus

CodeGraph
local code intelligence + optional anonymous product telemetry

Ini adalah perbedaan trust/privacy model, bukan penilaian bahwa salah satunya otomatis lebih baik.

Untuk Vendrith developer environment, local-first dan kemampuan mematikan telemetry adalah prinsip yang baik.

# 11. Security analysis surface

CodeGraph Pro menambahkan security analyzers seperti:
- dangerous-function patterns;
- taint/data-flow;
- auth coverage;
- dependency/OSV;
- secrets;
- injection;
- crypto misuse;
- IaC;
- SARIF.

citeturn3search0

CBM lebih menekankan security/hardening pada tool/indexer itu sendiri dan graph analysis.

Perbedaannya:

CBM security
= apakah code-intelligence engine aman?

CodeGraph Pro security
= apa vulnerability/security issue yang ada di target codebase?

Keduanya bisa menjadi inspirasi Vendrith, tetapi untuk dua masalah berbeda.

# 12. Agent context strategy

CodeGraph mempunyai get_ai_context, get_edit_context, dan get_curated_context sebagai layer yang mengompresi graph/source information menjadi context yang langsung dipakai agent. citeturn3search0

CBM lebih menonjolkan graph query primitives seperti search, trace, architecture, graph query, dan snippet retrieval. citeturn1search1

Untuk Vendrith, AI-context composition adalah ide penting:

user task
  ↓
identify relevant symbol/domain
  ↓
graph relationships
  ↓
tests
  ↓
docs/decisions
  ↓
minimal context
  ↓
agent

Ini cocok dengan workflow research-first Vendrith.

# 13. PR/change intelligence

CodeGraph menyediakan pr_context yang menggabungkan changed functions, blast radius, tests, test gaps, affected modules, stale docs, complexity, reviewer suggestions, dan commit hint. citeturn3search6

CBM mempunyai detect_changes untuk memetakan git diff ke affected symbols dan blast radius.

Jadi:

CBM
git diff -> graph impact

CodeGraph
git diff -> graph impact + tests + docs + review context

Untuk Vendrith, keduanya adalah inspirasi kuat untuk pre-merge verification.

# 14. Language coverage

| | CBM | CodeGraph |
|---|---:|---:|
| Documented language coverage | 162 | 38 |
| TypeScript/JS | Ya | Ya |
| Tree-sitter | Ya | Ya |
| Semantic type resolution | Hybrid LSP | parser/graph semantic analysis |
| Main implementation | C | Rust |
| IDE plugins | bukan fokus utama | VS Code + JetBrains |

Angka bahasa bukan ukuran yang perlu dikejar Vendrith. Vendrith lebih membutuhkan depth pada TypeScript/React/Next.js.

# 15. Build/runtime philosophy

### CBM

single native executable
+
vendored parsers
+
minimal runtime dependency

### CodeGraph

Rust workspace
+
native server
+
language parser crates
+
IDE extensions
+
memory/docs subsystems

CodeGraph workspace saat ini mempunyai banyak parser crates dan separate memory/server crates. citeturn1search2

Vendrith:
- jangan membawa native toolchain ke application runtime;
- developer tooling boleh terpisah;
- production application tetap Next.js/React/PixiJS/Supabase.

# 16. Yang diambil Vendrith dari masing-masing

## Dari codebase-memory-mcp

ADOPT:
- structural knowledge graph;
- import/call/dependency graph;
- impact analysis;
- architecture overview;
- incremental indexing;
- local-first code intelligence;
- graph schema/query abstraction;
- data-flow as future capability;
- benchmark methodology;
- security hardening of MCP/code-indexing layer.

ADAPT:
- TypeScript-first support;
- Next.js-aware routes/entry points;
- framework-aware dead-code detection;
- existing Vendrith ADR/memory integration.

DEFER:
- 162-language support;
- IaC graph;
- cross-service graph;
- semantic embedding;
- 3D graph UI.

## Dari CodeGraph

ADOPT:
- AI context composition;
- explicit project memory;
- documentation ↔ code verification;
- design-gap detection;
- PR context;
- test-gap analysis;
- IDE-aware developer workflow;
- tool profiles to reduce MCP context size.

ADAPT:
- memory system -> existing Vendrith .ai/memory;
- docs system -> docs/;
- PR analysis -> GitHub CI;
- IDE features -> optional developer tooling, not Map Editor runtime.

DEFER:
- full 42-tool surface;
- JetBrains/VS Code integrations;
- configurable embedding stack;
- Pro security analyzer suite.

# 17. Jangan memasang keduanya sekaligus sebagai default

Keduanya overlap besar pada:
- parsing;
- graph;
- search;
- call graph;
- impact;
- MCP.

Menjalankan dua indexer graph sekaligus dapat berarti:
- duplicate indexing;
- duplicate storage;
- duplicate MCP tools;
- lebih banyak context/tool definitions untuk agent;
- dua sumber hasil yang harus dibandingkan ketika jawabannya berbeda.

Untuk eksperimen, keduanya dapat dibandingkan terhadap repository Vendrith yang sama.

Benchmark:
| Test | Yang diukur |
|---|---|
| Find symbol | accuracy |
| Find callers | precision/recall |
| Find affected files | blast-radius accuracy |
| Find related tests | test relevance |
| Architecture summary | usefulness |
| Documentation verification | stale/missing detection |
| Incremental change | update latency |
| Memory | RAM/storage |
| MCP context | tokens returned |
| Cold start | startup time |
| Security | files excluded / secrets avoided |

# 18. Model tooling yang cocok untuk Vendrith

Konsep:

Vendrith Source
  -> Structural Index
  -> Derived Code Graph
  -> Impact Analysis
  -> AI Context
  -> Docs Verification
  -> Vendrith AI Workflow

Separate persistent layer:
.ai/memory + decisions + docs

Important: graph adalah derived index; .ai/memory, docs, source code, dan domain state tetap memiliki ownership masing-masing.

# 19. Final decision

Untuk folder inspirasi, kedua repository dicatat sebagai referensi komplementer, bukan dua dependency.

### codebase-memory-mcp
Decision: ADOPT concepts / ADAPT implementation / DEFER actual dependency.
Fokus: structural code intelligence + high-performance local knowledge graph.

### CodeGraph
Decision: ADOPT concepts / ADAPT memory-doc-PR workflow / DEFER actual dependency.
Fokus: AI context + persistent project memory + documentation/design verification + developer workflow.

Keduanya tidak perlu digabung menjadi satu tool di Vendrith sekarang. Yang diambil adalah pola yang relevan, lalu implementasi Vendrith tetap mengikuti arsitektur sendiri.

## Sources

- https://github.com/DeusData/codebase-memory-mcp
- https://github.com/codegraph-ai/CodeGraph
- https://github.com/codegraph-ai/CodeGraph/blob/main/README.md
- https://github.com/codegraph-ai/CodeGraph/blob/main/CHANGELOG.md
