# Node.js Best Practices — Audit untuk Vendrith

Tanggal audit: 2026-10-02
Branch audit: `feat/vendrith-ecc-v1`
Repository: `rakarakaa775/World-of-vendrith`
Sumber: https://github.com/goldbergyoni/nodebestpractices

## Status keputusan

- **ADOPT** — prinsip diterapkan sebagai standar Vendrith.
- **ADAPT** — prinsip diambil tetapi disesuaikan dengan Next.js/Vercel/Supabase/Map Editor.
- **DEFER** — relevan, tetapi belum perlu diterapkan sekarang.
- **N/A** — tidak relevan dengan arsitektur Vendrith saat ini.

Folder ini adalah **referensi/inspirasi**, bukan dependency. Keputusan implementasi tetap harus mengikuti source code dan instruksi resmi Vendrith.

---

# 1. Hasil audit repository Vendrith saat ini

Pemeriksaan dilakukan terhadap struktur branch, `AGENTS.md`, `REPOSITORY_STRUCTURE.md`, aplikasi Map Editor, package configuration, Vitest configuration, workflow CI, dan struktur test yang tersedia.

## Yang sudah sejalan

- TypeScript digunakan dengan `strict: true`.
- Next.js App Router + React sudah menjadi application boundary.
- PixiJS sudah diposisikan sebagai rendering/editor canvas, bukan sumber kebenaran map.
- Map document dibuat typed/serializable dan mempunyai history/undo-redo.
- Asset provenance/licensing diperlakukan sebagai bagian penting dari domain.
- Ada pemisahan `apps/map-editor`, `tests`, `database`, `supabase`, `docs`, dan archive/source evidence.
- Ada Vitest dan sejumlah test untuk map document, persistence, conflict resolution, save state, dan asset resolver.
- Ada CI yang menjalankan typecheck, build, dan Vitest.
- Node 22 digunakan pada CI.
- Vercel sudah ditetapkan sebagai deployment target.
- Ada security/performance/research instructions di repository.
- Ada persistence boundary dengan optimistic concurrency dan three-way conflict resolution.

## Gap yang terlihat dari static repository inspection

- Belum terlihat ESLint/Node-security lint setup pada `apps/map-editor/package.json`.
- Workflow CI menggunakan `npm install`, bukan `npm ci`.
- Lockfile tidak terlihat pada listing `apps/map-editor`; ini perlu diverifikasi sebelum menganggap dependency locking sudah terpenuhi.
- Ada dua workflow test/CI yang tumpang tindih; keduanya perlu direkonsiliasi agar pipeline tidak menjalankan pekerjaan yang sama tanpa alasan.
- Test suite sudah cukup nyata, tetapi belum ada bukti dari inspection ini bahwa semua test mengikuti pola penamaan 3 bagian dan AAA secara konsisten.
- Belum ada bukti dari static inspection tentang coverage threshold/reporting.
- Belum ada evidence bahwa structured logging + transaction/request ID sudah menjadi standar runtime.
- Belum ada evidence bahwa rate limiting/payload limits diterapkan pada seluruh API boundary.
- Monitoring/APM dan health/readiness endpoint belum menjadi bagian yang terlihat dari Map Editor foundation.
- Docker belum menjadi deployment requirement saat ini; Vercel adalah target.
- Arsitektur component/layer perlu dipertahankan tanpa memaksa Map Editor menjadi backend microservices.

Catatan: daftar gap di atas adalah hasil inspeksi statis terhadap file yang dapat diakses. Ini bukan klaim bahwa fitur yang tidak terlihat pasti tidak ada di deployment/infrastructure.

---

# 2. Project Architecture Practices

| # | Praktik sumber | Keputusan Vendrith | Status |
|---|---|---|---|
| 1.1 | Structure solution by business components | Gunakan batas domain/component yang jelas dalam monorepo. Jangan memaksa multi-repo/microservices. | ADOPT |
| 1.2 | Layer components: entry-point/domain/data-access | Terapkan terutama pada backend/domain services; jangan memasukkan request/response langsung ke domain logic. | ADOPT |
| 1.3 | Common utilities as packages | Gunakan package/library internal untuk shared types, validation, logger, utilities jika benar-benar reusable. | ADOPT |
| 1.4 | Environment-aware secure hierarchical config | Secret di environment/secret manager; config typed dan divalidasi. | ADOPT |
| 1.5 | Consider framework consequences | Pertahankan Next.js untuk app boundary; jangan mengganti framework hanya karena rekomendasi Node backend. | ADAPT |
| 1.6 | Use TypeScript thoughtfully | TypeScript tetap standar; hindari type machinery yang terlalu kompleks tanpa kebutuhan. | ADOPT |

### Bentuk yang kita pertahankan

```
apps/
  map-editor/

domain state
    ↓
commands / services
    ↓
persistence adapters
    ↓
Supabase

PixiJS = renderer/interaction layer
Next.js = UI + server/client boundary
Phaser = runtime/play layer, bukan persistence model
```

Tidak ada keputusan untuk mengubah Vendrith menjadi kumpulan microservices.

---

# 3. Error Handling Practices

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 2.1 | Async/await or promises | Gunakan async/await untuk asynchronous flows. | ADOPT |
| 2.2 | Extend Error | Gunakan error class/type yang konsisten dengan code/category. | ADOPT |
| 2.3 | Operational vs programmer errors | Bedakan validation/auth/not-found/conflict dari bug internal. | ADOPT |
| 2.4 | Handle errors centrally | Standardisasi API error envelope pada boundary. | ADOPT |
| 2.5 | Restart gracefully | Shutdown/restart behavior harus graceful bila ada long-running server/worker. | ADAPT |
| 2.6 | Fail fast on programmer errors | Jangan menyamarkan internal programming failures sebagai user validation errors. | ADOPT |
| 2.7 | Handle uncaught exceptions/rejections | Production runtime harus mempunyai policy yang jelas. | ADOPT |
| 2.8 | Validate arguments | Validate map, asset, auth, persistence, dan external input. | ADOPT |
| 2.9 | Use standard error properties | Pertahankan message, code/name, cause, dan context yang aman. | ADOPT |
| 2.10 | Async error propagation | Jangan membuat promise rejection tanpa owner/handler. | ADOPT |
| 2.11 | Error logging | Error log harus membawa context tanpa membocorkan secret. | ADOPT |
| 2.12 | Error response contract | Client menerima error yang stabil, bukan stack trace/internal DB error. | ADOPT |

---

# 4. Code Style Practices

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 3.1 | ESLint | Tambahkan ESLint sebagai quality gate. | ADOPT |
| 3.2 | Node-specific lint/security plugins | Gunakan rule yang relevan dengan actual Node/server code; jangan memasang plugin tanpa kebutuhan. | ADAPT |
| 3.3 | Curly brace style | Ikuti formatter/linter repository. | ADOPT |
| 3.4 | Statement separation | Ikuti formatter/linter. | ADOPT |
| 3.5 | Name functions | Hindari anonymous functions pada code yang perlu mudah diprofil/debug. | ADOPT |
| 3.6 | Naming conventions | Konsisten untuk variables/functions/classes/constants. | ADOPT |
| 3.7 | const over let, no var | Jadikan standar TypeScript modern. | ADOPT |
| 3.8 | Imports at module scope | Ikuti static imports kecuali dynamic import memang diperlukan. | ADAPT |
| 3.9 | Explicit module entry point | Untuk shared packages/modules, ekspor public API melalui entry point. | ADOPT |
| 3.10 | === | Gunakan strict equality. TypeScript membantu memperkecil kebutuhan coercion. | ADOPT |
| 3.11 | Async/await | Standar async flow. | ADOPT |
| 3.12 | Arrow functions | Gunakan bila sesuai style dan lexical this. | ADOPT |
| 3.13 | Avoid effects outside functions | Side effects harus jelas dan terisolasi. | ADOPT |

---

# 5. Testing & Overall Quality

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 4.1 | API/component testing | Jadikan API/domain component tests sebagai baseline. | ADOPT |
| 4.2 | Three-part test names | Nama test harus menyebut unit + kondisi + expected result bila masuk akal. | ADOPT |
| 4.3 | AAA pattern | Arrange → Act → Assert untuk test yang cocok. | ADOPT |
| 4.4 | Unified Node version | Node 22 saat ini harus disamakan antara local/CI/deployment yang relevan. Tambahkan enforcement/version file bila diperlukan. | ADOPT |
| 4.5 | Avoid global fixtures | Test harus isolated dan membuat data yang diperlukan sendiri. | ADOPT |
| 4.6 | Test tags | Gunakan hanya ketika test suite sudah cukup besar untuk membutuhkan grouping. | DEFER |
| 4.7 | Coverage | Gunakan coverage untuk menemukan blind spots, bukan mengejar 100% secara buta. | ADOPT |
| 4.8 | Production-like E2E | Pertahankan browser/runtime verification terhadap deployment. | ADOPT |
| 4.9 | Static analysis | ESLint + TypeScript check masuk CI. | ADOPT |
| 4.10 | Mock external HTTP services | Mock GitHub/external API/remote services pada test; test failure/timeout juga. | ADOPT |
| 4.11 | Middleware isolation | Test auth/validation middleware secara terpisah bila boundary tersebut berkembang. | ADAPT |
| 4.12 | Production/test ports | Terapkan jika ada long-running custom server; tidak perlu memaksakan pola ini ke Vercel serverless routes. | ADAPT |
| 4.13 | Test five possible outcomes | Test success, validation failure, auth failure, not-found/conflict, dan internal failure sesuai endpoint. | ADOPT |

### Testing baseline Vendrith

```
typecheck
lint
unit/domain tests
component/API tests
build
browser/runtime verification
final diff review
```

---

# 6. Going to Production Practices

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 5.1 | Monitoring | Tambahkan monitoring production bertahap. | ADOPT |
| 5.2 | Smart logging | Structured logs dengan context. | ADOPT |
| 5.3 | Delegate gzip/SSL/etc. | Serahkan ke Vercel/cloud infrastructure. | ADAPT |
| 5.4 | Lock dependencies | Commit lockfile dan gunakan deterministic install. | ADOPT |
| 5.5 | Process uptime tool | Vercel menangani lifecycle; worker/server custom perlu policy sendiri. | ADAPT |
| 5.6 | Utilize all CPU cores | Tidak relevan untuk Vercel/serverless editor path saat ini. | N/A |
| 5.7 | Maintenance endpoint | Health/readiness endpoint hanya jika runtime architecture membutuhkannya. | DEFER |
| 5.8 | APM | Tambahkan saat production complexity memerlukannya. | DEFER |
| 5.9 | Production-ready code | Semua feature harus melewati verification pipeline sebelum production. | ADOPT |
| 5.10 | Memory monitoring | Pantau bila workload atau server runtime membutuhkan. | DEFER |
| 5.11 | Frontend assets out of Node | Gunakan Vercel/static asset delivery; Node bukan asset server utama. | ADAPT |
| 5.12 | Stateless | Prefer stateless application/runtime; persistence berada pada authoritative services. | ADOPT |
| 5.13 | Vulnerability detection | Dependency/security scan menjadi CI requirement. | ADOPT |
| 5.14 | Transaction/request ID | Tambahkan untuk request/operation tracing ketika API/runtime logging matang. | ADOPT |
| 5.15 | NODE_ENV production | Production environment harus diset oleh deployment platform/runtime. | ADOPT |
| 5.16 | Automated atomic deployment | Pertahankan GitHub CI + Vercel deployment flow. | ADOPT |
| 5.17 | Node LTS | Gunakan LTS; Node 22 saat ini digunakan di CI. | ADOPT |
| 5.18 | Log to stdout | Untuk server/container runtime, gunakan stdout/stderr dan platform logging. | ADAPT |
| 5.19 | npm ci | CI harus memakai npm ci setelah lockfile tersedia/terverifikasi. | ADOPT |

---

# 7. Security Practices

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 6.1 | Security lint rules | Tambahkan security-oriented linting yang relevan. | ADOPT |
| 6.2 | Limit concurrent requests | Rate limiting/concurrency controls pada public/auth-sensitive endpoints. | ADOPT |
| 6.3 | Secrets outside code | Tidak boleh commit secrets; gunakan environment/secret management. | ADOPT |
| 6.4 | Query injection protection | Gunakan Supabase/Postgres parameterized APIs/query mechanisms; jangan concatenate untrusted SQL. | ADOPT |
| 6.5 | Generic security practices | Terapkan least privilege, validation, secure defaults, auditability. | ADOPT |
| 6.6 | HTTP security headers | Terapkan pada web/API boundary yang dikelola Vendrith. | ADOPT |
| 6.7 | Automatic dependency inspection | Security/dependency checks di CI. | ADOPT |
| 6.8 | Password security | Jika password dikelola sendiri, gunakan proven password hashing; bila Supabase Auth owns auth, jangan membuat password system kedua. | ADAPT |
| 6.9 | Escape HTML/JS/CSS | React escaping + safe rendering; hindari raw HTML tanpa sanitization. | ADOPT |
| 6.10 | Validate JSON schemas | Map documents, asset metadata, API payload, dan external data harus divalidasi. | ADOPT |
| 6.11 | JWT blocklisting | Hanya bila architecture benar-benar menggunakan JWT revocation requirement. | DEFER |
| 6.12 | Brute-force protection | Login/recovery/verification endpoint perlu protection. | ADOPT |
| 6.13 | Non-root Node | Wajib jika nanti memakai Docker/custom container. | ADAPT |
| 6.14 | Payload size limit | Sangat penting untuk map/assets/API. Terapkan batas sebelum parsing/processing besar. | ADOPT |
| 6.15 | Avoid eval | Dilarang sebagai default. | ADOPT |
| 6.16 | ReDoS | Hindari regex kompleks atas untrusted input. | ADOPT |
| 6.17 | Avoid variable module loading | Jangan import module dari arbitrary user input. | ADOPT |
| 6.18 | Sandbox unsafe code | Jika ada user-generated executable logic di masa depan, wajib sandbox; jangan mengeksekusi arbitrary code sekarang. | ADAPT |
| 6.19 | Child process safety | Jika suatu hari memakai git/image tools/ffmpeg/CLI, semua argument harus controlled. | DEFER |
| 6.20 | Hide internal errors | API tidak boleh mengembalikan secret, stack trace, DB internals, atau filesystem paths. | ADOPT |
| 6.21 | npm/Yarn 2FA | Relevan jika Vendrith menerbitkan package. | DEFER |
| 6.22 | Session security | Ikuti Supabase/session provider configuration; cookie/session flags harus aman. | ADOPT |
| 6.23 | Explicit crash/DoS policy | Production runtime perlu batas dan failure policy. | ADAPT |
| 6.24 | Safe redirects | Semua redirect URL dari user/input harus divalidasi. | ADOPT |
| 6.25 | Never publish secrets | Secret scanning dan review sebelum package/public release. | ADOPT |
| 6.26 | Inspect outdated packages | Dependency update/audit workflow berkala. | ADOPT |
| 6.27 | node: protocol | Gunakan `node:` untuk Node built-ins pada server/Node code. | ADOPT |

---

# 8. Performance Practices

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 7.1 | Don't block event loop | Sangat penting untuk asset/map processing. CPU-heavy work harus dipindahkan ke worker/background job bila diperlukan. | ADOPT |
| 7.2 | Prefer native JS methods | Jangan menambah dependency utility tanpa alasan. | ADAPT |

### Khusus Map Editor

Jangan membuat operasi seperti:

```
large map import/export
large asset processing
image transformation
bulk validation
```

mengunci event loop pada request utama.

---

# 9. Docker Practices

Docker **bukan requirement Vendrith saat ini** karena deployment target adalah Vercel. Prinsip di bawah tetap dicatat sebagai future reference.

| # | Praktik | Keputusan Vendrith | Status |
|---|---|---|---|
| 8.1 | Multi-stage builds | Terapkan jika Docker dipakai. | DEFER |
| 8.2 | Bootstrap with node | Ikuti bila custom container runtime dibuat. | DEFER |
| 8.3 | Runtime handles replication/uptime | Gunakan platform orchestration, bukan script sendiri. | DEFER |
| 8.4 | .dockerignore | Wajib bila Docker diperkenalkan. | DEFER |
| 8.5 | Clean production dependencies | Wajib bila Docker digunakan. | DEFER |
| 8.6 | Graceful shutdown | Wajib untuk long-running container. | DEFER |
| 8.7 | Memory limits | Wajib bila workload containerized. | DEFER |
| 8.8 | Efficient caching | Terapkan pada Docker build jika diperlukan. | DEFER |
| 8.9 | Explicit image reference | Jangan gunakan `latest` untuk production. | DEFER |
| 8.10 | Smaller base image | Pilih base image sesuai kebutuhan. | DEFER |
| 8.11 | No build-time secret leakage | Secret tidak boleh masuk Docker ARG/layers. | DEFER |
| 8.12 | Image vulnerability scan | CI scan jika Docker dipakai. | DEFER |
| 8.13 | Clean node_modules cache | Terapkan dalam Docker build. | DEFER |
| 8.14 | Generic Docker practices | Ikuti Docker-specific hardening bila container menjadi bagian deployment. | DEFER |
| 8.15 | Dockerfile lint | Tambahkan jika Dockerfile dibuat. | DEFER |

---

# 10. Keputusan final yang masuk standar Vendrith

## ADOPT sekarang

1. Component/domain boundaries.
2. Layer separation untuk backend/domain services.
3. TypeScript strict dan typed domain state.
4. Environment-aware configuration.
5. Async/await.
6. Typed/custom application errors.
7. Central error contract.
8. Input/schema validation.
9. ESLint + static analysis.
10. Consistent naming/modern JS style.
11. Explicit public entry points untuk shared modules.
12. API/component tests.
13. AAA test structure.
14. Descriptive test names.
15. Isolated tests.
16. Unified Node version.
17. Coverage as a diagnostic.
18. Dependency locking.
19. Deterministic CI installation.
20. Node LTS.
21. Security/dependency scanning.
22. Secret management.
23. Payload limits.
24. Rate limiting pada sensitive/public endpoints.
25. Security headers.
26. Safe error responses.
27. Safe redirects.
28. `node:` imports.
29. Structured logging.
30. Request/transaction context.
31. Stateless architecture.
32. Automated verification/deployment.
33. Do not block the event loop.

## ADAPT

1. Framework guidance — Next.js tetap menjadi application framework.
2. Reverse proxy/security infrastructure — delegated to Vercel/cloud.
3. Authentication/password guidance — Supabase Auth remains authoritative where applicable.
4. Middleware testing — according to actual middleware boundaries.
5. E2E — browser/runtime verification appropriate to the editor.
6. Production lifecycle — Vercel/serverless semantics rather than a traditional Node daemon.
7. Docker practices — only when Docker is introduced.
8. Shared packages — introduce only when reuse/boundary is real.

## DEFER

1. APM.
2. Advanced monitoring.
3. Test tags.
4. Custom maintenance endpoint unless runtime requires it.
5. Multi-core Node process tuning.
6. Memory tuning.
7. JWT blocklisting unless required by auth architecture.
8. npm 2FA until package publishing exists.
9. Worker/queue infrastructure until heavy processing appears.
10. Docker implementation.

## N/A / not a current requirement

- Turning Vendrith into microservices solely because the reference uses component architecture.
- Replacing Next.js/PixiJS with a Node backend framework solely because the reference compares Express/Fastify/Nest/Koa.
- Dockerizing the project before there is a deployment/runtime reason.

---

# 11. Immediate implementation backlog

Urutan kerja yang dicatat dari audit ini:

### P0 — quality foundation

- [ ] Verify/add dependency lockfile.
- [ ] Change CI install from `npm install` to `npm ci`.
- [ ] Add ESLint and appropriate security rules.
- [ ] Add lint to CI.
- [ ] Reconcile the two overlapping Map Editor workflows.
- [ ] Add/enforce Node version consistency.

### P1 — runtime/API hardening

- [ ] Standard application error model.
- [ ] Standard API error response.
- [ ] Schema validation at API/domain boundaries.
- [ ] Payload size limits.
- [ ] Rate limiting for sensitive/public endpoints.
- [ ] Security headers.
- [ ] Dependency/security audit.

### P2 — observability

- [ ] Structured logger.
- [ ] Request/transaction ID.
- [ ] Safe error context.
- [ ] Basic production monitoring.
- [ ] Health/readiness endpoint only if runtime architecture requires it.

### P3 — advanced scaling

- [ ] Background workers for CPU-heavy asset/map operations.
- [ ] External service mocking for integration tests.
- [ ] Production-like E2E.
- [ ] APM/advanced telemetry.
- [ ] Docker only if deployment architecture later requires it.

---

# 12. Important boundary for future inspirations

When another repository is added to `inspirasi/`, do **not** automatically implement its architecture.

For every new reference we will record:

```
SOURCE
  ↓
WHAT IT DOES
  ↓
WHAT IS RELEVANT TO VENDRITH
  ↓
WHAT CONFLICTS WITH VENDRITH
  ↓
ADOPT / ADAPT / DEFER / N/A
  ↓
IMPLEMENTATION BACKLOG
```

This prevents the project from accumulating unrelated frameworks, libraries, patterns, or infrastructure merely because they appeared in an interesting repository.
