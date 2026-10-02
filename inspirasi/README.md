# Inspirasi

Folder ini menyimpan repository, artikel, arsitektur, pola engineering, dan referensi lain yang dipelajari untuk membantu pengembangan World of Vendrith.

## Tujuan

- Menyimpan sumber inspirasi secara terpisah dari source code produksi.
- Mencatat bagian mana dari suatu referensi yang relevan untuk Vendrith.
- Membedakan inspirasi/referensi dari keputusan implementasi.
- Menjaga provenance: setiap referensi harus mencantumkan sumber aslinya.
- Menjadi tempat untuk menambahkan repository atau referensi lain di masa depan.

## Aturan

1. Referensi di folder ini tidak otomatis menjadi dependency Vendrith.
2. Jangan menyalin kode/asset hanya karena ada di referensi; periksa lisensi dan izin terlebih dahulu.
3. Setiap referensi baru sebaiknya memiliki:
   - nama sumber;
   - URL repository/artikel;
   - tanggal audit;
   - alasan relevan untuk Vendrith;
   - keputusan: adopt / adapt / defer / reject;
   - catatan implementasi jika ada.
4. Keputusan yang sudah diterapkan ke source code tetap harus mengikuti file/instruction resmi Vendrith; folder ini adalah sumber inspirasi dan catatan keputusan pendukung.
5. Referensi tambahan dapat ditambahkan sebagai file Markdown baru tanpa mengubah referensi yang sudah ada.

## Isi saat ini

- Node.js Best Practices — Audit Vendrith: ./NODEJS_BEST_PRACTICES_VENDRITH.md
- codebase-memory-mcp — Audit Menyeluruh: ./CODEBASE_MEMORY_MCP_AUDIT.md
- codebase-memory-mcp vs CodeGraph — Perbandingan: ./CODEBASE_MEMORY_MCP_VS_CODEGRAPH.md
- Open Higgsfield AI (sunnychase) — Audit: ./OPEN_HIGGSFIELD_AI_SUNNYCHASE_AUDIT.md
- Template Referensi Baru: ./REFERENCE_TEMPLATE.md

## Catatan untuk referensi code-intelligence

codebase-memory-mcp dan CodeGraph diperlakukan sebagai referensi komplementer.

Keduanya tidak otomatis dipasang sebagai dependency. Yang dicatat adalah pola yang relevan:
- structural code graph;
- impact analysis;
- AI context composition;
- persistent project memory;
- documentation/code verification;
- incremental indexing;
- security dan local-first processing.

## Catatan untuk Open Higgsfield AI

Open Higgsfield AI dari sunnychase diperlakukan sebagai referensi UX/arsitektur ringan untuk:
- capability-driven controls;
- registry-as-data;
- visual asset/model selectors;
- asynchronous job lifecycle;
- generation/artifact history;
- provider abstraction.

Repository tersebut adalah fork dan bukan dependency Vendrith. Provenance dan lisensi harus diverifikasi sebelum menyalin kode atau asset.
