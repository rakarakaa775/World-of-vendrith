# codebase-memory-mcp — Audit Menyeluruh untuk Vendrith

Tanggal audit: 2026-10-02
Repository sumber: DeusData/codebase-memory-mcp
URL: https://github.com/DeusData/codebase-memory-mcp
Lisensi: MIT
Konteks Vendrith: branch feat/vendrith-ecc-v1

## 1. Tujuan audit

Audit ini menilai codebase-memory-mcp sebagai referensi engineering/code-intelligence, bukan sebagai dependency yang otomatis dipasang ke Vendrith.

Fokus:
- codebase menjadi knowledge graph;
- structural code intelligence;
- semantic/type resolution;
- persistence dan incremental indexing;
- MCP/tool design;
- memory dan architecture decisions;
- security dan supply-chain;
- kecocokan dengan Next.js/TypeScript/PixiJS/Supabase/Vercel.

## 2. Versi dan freshness catatan

Pada saat audit, GitHub Releases menunjukkan v0.11.0 sebagai latest release (dipublikasikan 2026-09-15). Beberapa halaman/dokumen lama masih menyebut versi 0.8.x/0.10.x, sehingga angka versi harus selalu diambil dari halaman Releases terbaru sebelum instalasi. Audit ini memakai repository main dan current release metadata sebagai referensi utama. citeturn2search3turn2search4

## 3. Ringkasan teknis

Menurut repository saat audit:
- native executable utama ditulis dalam C;
- tree-sitter digunakan untuk parsing banyak bahasa;
- README saat ini menyebut 162 bahasa;
- Hybrid LSP semantic resolution digunakan untuk subset bahasa termasuk TypeScript/JavaScript/JSX/TSX;
- graph disimpan persistent dengan SQLite;
- indexing memakai pipeline multi-pass;
- background watcher melakukan incremental synchronization;
- tersedia structural, BM25/full-text, dan semantic search;
- semantic search memakai embedding lokal;
- tersedia call-path tracing, architecture overview, impact analysis, dead-code detection, Cypher-like query, cross-service linking, data-flow, dan ADR management;
- tersedia built-in 3D graph UI;
- MCP surface didokumentasikan sebagai 17 tools;
- tersedia cross-repository intelligence;
- tidak ada LLM internal; MCP client/agent menjadi reasoning layer.

Sumber primer: README dan dokumentasi repository resmi.

## 4. Parsing berlapis

Pola arsitektur:

repository
  -> file discovery
  -> tree-sitter AST
  -> definitions / imports / calls
  -> semantic/type refinement
  -> graph store
  -> MCP queries
  -> AI agent

Tree-sitter memberi coverage bahasa yang luas. Hybrid semantic resolution memperbaiki hubungan lintas file yang tidak dapat dipastikan hanya dari syntax.

Vendrith decision: ADOPT sebagai prinsip, bukan implementasi internal.

Yang diadopsi adalah ide bahwa AI sebaiknya mempunyai structural index sehingga pertanyaan seperti caller, dependency, blast radius, route relation, dan related tests tidak selalu membutuhkan grep/read berulang.

## 5. Graph sebagai secondary representation

Vendrith tidak boleh menjadikan graph sebagai source of truth.

Source of truth tetap:
- typed map document;
- domain state;
- persistence data;
- Supabase;
- source code.

Graph hanya derived intelligence index.

Decision: ADOPT.

## 6. Multi-pass indexing

Pipeline terpisah untuk structure, definitions, calls, service links, configuration, tests, dan relationship enrichment merupakan pola yang berguna.

Decision: ADOPT secara konseptual untuk future code-intelligence tooling.

Tidak perlu menyalin pipeline C-nya ke aplikasi Vendrith.

## 7. Incremental watcher

Background watcher yang hanya memperbarui graph ketika source berubah mengurangi pekerjaan berulang.

Decision: ADAPT.

Untuk Vendrith, watcher harus:
- menghormati gitignore/exclude rules;
- tidak mengindex secrets;
- tidak mengganggu build/dev server;
- tidak menjadi source of truth;
- tidak membuat perubahan pada source code.

## 8. Semantic search

Sumber menggabungkan structural search, BM25/full-text, dan semantic vector search.

Ini penting karena nama code sering tidak sama dengan bahasa pertanyaan developer.

Decision: ADOPT sebagai future capability.

Untuk Vendrith, semantic search sebaiknya datang setelah structural search stabil. Jangan menambah embedding infrastructure hanya untuk mengejar fitur.

## 9. Call graph dan impact analysis

Ini sangat relevan untuk Vendrith.

Contoh:
- perubahan MapDocument -> cari semua caller;
- perubahan persistence adapter -> cari UI/action/test terdampak;
- perubahan asset resolver -> cari consumer;
- perubahan undo/redo command -> cari command history/test;
- perubahan route/API -> cari caller dan related tests.

Decision: ADOPT.

Prioritasnya developer tooling, bukan runtime game.

## 10. Architecture overview dan clustering

get_architecture menggabungkan bahasa, package, entry point, route, hotspot, boundary, layer, dan cluster.

Louvain/community detection dipakai untuk menemukan kelompok fungsional dari graph.

Decision:
- architecture overview: ADOPT
- clustering: DEFER sampai graph Vendrith cukup besar

Untuk Vendrith, architecture overview lebih penting daripada visualisasi graph mentah.

## 11. ADR persistence

manage_adr memungkinkan architectural decisions bertahan antar-session.

Ini cocok dengan workflow Vendrith yang sudah memiliki decision records, .ai/memory, architecture documents, dan folder inspirasi.

Decision: ADAPT.

Jangan membuat sumber keputusan kedua yang bertentangan dengan .ai/memory atau docs. Jika tooling memory dipakai, satu canonical decision source harus tetap ditentukan.

## 12. Cross-service analysis

CBM mampu menghubungkan HTTP routes/call sites dan beberapa pola service communication.

Untuk Vendrith ini berguna pada:
- Next.js route/server boundary;
- Supabase/API boundary;
- future worker/service;
- future asset processing service.

Decision: ADOPT secara konseptual, DEFER implementasi sampai service boundary cukup kompleks.

## 13. Infrastructure-as-code indexing

CBM mengindex Docker/Kubernetes/Kustomize.

Vendrith saat ini deployment target-nya Vercel dan tidak membutuhkan Docker/Kubernetes sebagai foundation.

Decision: DEFER.

## 14. Data-flow analysis

DATA_FLOWS dapat mengikuti argument -> parameter dan field access.

Potensial untuk:
- map payload validation;
- auth context;
- asset metadata;
- persistence writes;
- user input -> database boundary.

Decision: ADOPT sebagai future security/debugging capability, bukan runtime feature.

## 15. Dead-code detection

Useful untuk repository yang tumbuh besar.

Namun editor memiliki framework entry points, React components, Next.js routes, dynamic imports, tests, dan asset registries yang dapat membuat naive dead-code detection menghasilkan false positive.

Decision: ADAPT.

Tooling harus memahami framework boundaries sebelum hasil dead-code dianggap valid.

## 16. Security

Dokumentasi repository menjelaskan:
- CodeQL;
- fuzz testing;
- dangerous-call allowlist;
- network egress testing;
- path containment;
- SQLite authorization;
- release checksums;
- Sigstore;
- SLSA Build Level 3 provenance;
- SBOM;
- antivirus scanning;
- adversarial MCP JSON-RPC tests.

Repository juga secara eksplisit menyatakan tool membaca codebase, menulis konfigurasi agent, dan menjalankan background processes. citeturn2search0turn2search4

Vendrith decision: ADOPT prinsip security-by-default.

Namun dokumentasi security bukan bukti bahwa software bebas bug. Repository sendiri mengakui keterbatasan dan memiliki bug history. Contoh historis mencakup issue Windows stdio handshake dan beberapa issue platform-specific pada rilis sebelumnya. citeturn2search7turn2search8

### Security boundary untuk Vendrith

Jika tooling code intelligence digunakan:
- index hanya workspace yang diizinkan;
- exclude .env, credentials, keys, secrets, generated sensitive data;
- graph database dianggap derived local cache;
- graph tidak boleh menjadi channel untuk mengirim source code keluar;
- MCP tool input harus dibatasi;
- file read harus tetap berada dalam project root;
- binary release harus diverifikasi jika memakai prebuilt executable.

## 17. Network/privacy

CBM mendokumentasikan bahwa indexing, query, dan MCP handling berlangsung lokal dan tidak meng-upload source code. Current security policy juga menyebut background update check ke GitHub Releases setelah MCP initialization. citeturn2search0

Vendrith:
- local-only processing adalah pola yang diinginkan;
- update check harus dianggap sebagai network behavior;
- environment sensitif/air-gapped perlu mematikan atau memvalidasi behavior tersebut.

Decision: ADOPT local-first principle; ADAPT update behavior.

## 18. Supply-chain / installation

CBM menyediakan native binary dan installer yang dapat menulis konfigurasi agent. Ini praktis, tetapi memperbesar trust boundary.

Prinsip yang diambil:
1. audit source;
2. verify release artifact;
3. verify checksum/signature/provenance;
4. gunakan release resmi;
5. jangan menjalankan installer yang belum diaudit hanya karena README menyarankannya.

Decision: ADOPT.

Untuk Vendrith, jangan memasukkan binary CBM ke repository produksi.

## 19. Language coverage

CBM menargetkan coverage sangat luas dengan tree-sitter.

Kebutuhan Vendrith sebenarnya jauh lebih kecil:
- TypeScript;
- JavaScript/JSX/TSX;
- JSON/YAML/SQL/config yang relevan;
- Markdown/docs.

Jadi 162 bahasa bukan alasan menambah dependency/runtime complexity.

Decision: ADAPT. Prinsip yang penting adalah accurate TypeScript/JavaScript structural intelligence, bukan jumlah bahasa maksimum.

## 20. Performance claims

Repository mempublikasikan benchmark indexing dan query, termasuk Linux kernel dan Django, serta klaim penghematan token pada structural queries. citeturn1search1turn1search0

Angka tersebut harus diperlakukan sebagai project-reported benchmark, bukan jaminan performa Vendrith.

Sebelum dipakai, benchmark lokal harus mengukur:
- initial indexing time;
- incremental indexing time;
- memory;
- query latency;
- MCP response size;
- token reduction;
- accuracy terhadap known relationships.

Decision: ADOPT benchmark methodology; jangan mengasumsikan angka benchmark berpindah otomatis.

## 21. Testing / maintainability

Repository menampilkan ribuan passing tests dan security-specific test layers.

Yang relevan:
- adversarial MCP/tool input testing;
- fuzzing parser/query language;
- regression tests untuk graph relationships;
- fixture repositories;
- known-answer tests.

Decision: ADOPT secara konseptual.

## 22. Apa yang tidak disalin

N/A:
- pure-C implementation;
- 162-language parser bundle;
- embedded native runtime;
- Docker/Kubernetes indexing;
- 3D graph UI sebagai bagian production editor;
- daemon architecture;
- release installer yang memodifikasi banyak agent config;
- internal storage schema;
- Cypher engine implementation.

## 23. Keputusan Vendrith

### ADOPT
1. Structural code graph sebagai derived developer index.
2. Import/call/dependency relationships.
3. Impact analysis.
4. Architecture overview.
5. Incremental indexing concept.
6. Local-first processing.
7. Security-first file boundaries.
8. Semantic search sebagai future capability.
9. Data-flow analysis sebagai future security/debugging capability.
10. Benchmark-driven evaluation.
11. Regression tests untuk code-intelligence relationships.
12. ADR/decision persistence concept.

### ADAPT
1. TypeScript/Next.js-focused indexing.
2. Framework-aware dead-code analysis.
3. Local watcher.
4. ADR integration with existing Vendrith decision system.
5. API/service relationship analysis around Next.js/Supabase.

### DEFER
1. Full 162-language support.
2. Cross-repository graph.
3. IaC graph.
4. Data-flow engine.
5. Semantic embeddings.
6. 3D visualization.
7. Runtime traces.
8. Service topology analysis.

### N/A
1. Replacing Vendrith application architecture with CBM native C architecture.
2. Making graph the source of truth.
3. Adding Docker/Kubernetes only to support the tool.
4. Shipping CBM as part of Vendrith production runtime.

## 24. Final assessment

codebase-memory-mcp paling bernilai sebagai reference untuk structural code intelligence dan local knowledge-graph architecture.

Pola yang paling transferable:

AST
 -> typed structural graph
 -> persistent derived index
 -> incremental updates
 -> MCP queries
 -> AI context

Decision: ADOPT architectural concepts; ADAPT implementation to Vendrith; do not add it as a production dependency yet.

## Sources

- https://github.com/DeusData/codebase-memory-mcp
- https://github.com/DeusData/codebase-memory-mcp/blob/main/README.md
- https://github.com/DeusData/codebase-memory-mcp/blob/main/SECURITY.md
- https://github.com/DeusData/codebase-memory-mcp/releases
