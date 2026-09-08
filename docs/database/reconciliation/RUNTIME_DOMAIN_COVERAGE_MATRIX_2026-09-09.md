# Runtime Domain Coverage Matrix — 2026-09-09

## Purpose

This matrix groups the live Supabase schema by project domain and maps each domain to current repository evidence. It is a prioritization tool for source recovery, not a reconstructed schema specification.

## Runtime inventory by domain

| Domain | Runtime tables (pattern-based) | Current GitHub source coverage | Priority |
|---|---:|---|---|
| World / Geography / Settlements | 36 | Historical specifications and handoff material; current runtime source incomplete | P1 |
| Lives / Needs / Skills | 16 | Foundation migration + historical design; current runtime source incomplete | P1 |
| Activity / AI / Schedule | 15 | Historical design + runtime audit evidence; current exact source incomplete | P1 |
| Inventory / Items / Durability | 10 | Foundation/history material + exact Inventory gateway migration; full runtime source incomplete | P1 |
| Assets / Provenance | 10 | Asset manifests and historical material; current runtime source incomplete | P2 |
| Dungeon / Navigation | 11 | Reconciliation SQL and historical material; full current source incomplete | P2 |
| History / Audit | 7 | Historical engine/source material + runtime audit; full current source incomplete | P1 |
| Time Events | 4 | Runtime audit evidence; complete current source incomplete | P1 |
| Other | 69 | Mixed domains; requires sub-classification before source recovery | P2 |

**Important:** counts are based on simple table-name pattern classification and are directional. A table can belong to multiple conceptual systems even when counted in one bucket.

## Source-confidence classes

- **Exact:** current executable SQL source is captured and identified.
- **Partial:** some repository source exists, but it does not establish parity with the live runtime.
- **Historical:** design/handoff evidence exists, but it is not current runtime source.
- **Runtime-only:** runtime presence is verified, while exact current source is not captured.
- **Mixed:** evidence spans multiple classes and needs object-level review.

## Recovery priority

### P1 — Core simulation chain

Recover exact source for Lives / Needs / Skills, Activity / AI / Schedule, Inventory / Items / Durability, Time Events, History / Audit, and World / Geography / Settlements.

### P2 — Supporting systems

After P1, reconcile Assets / Provenance, Dungeon / Navigation, and the 69 currently unclassified tables.

## Current safe conclusion

The runtime is broader than the currently captured repository source. The correct next action is **object-level source recovery**, starting with P1 domains. No SQL should be generated merely from table names, runtime metadata, or historical design documents.

No production change was made while creating this matrix.
