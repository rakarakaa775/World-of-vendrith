# VANDRITH MASTER CHECKPOINT — 2026-09-09

## 1. Purpose

This is the consolidated repository/runtime checkpoint for the current Vandrith project state.

It separates four evidence classes:

1. **GitHub repository** — source-controlled repository state.
2. **Supabase runtime** — live database/runtime evidence inspected during the audit.
3. **Uploaded source archives** — historical/source evidence supplied to the project.
4. **Audit findings** — conclusions supported by direct runtime inspection and repository inspection.

No class should be silently substituted for another.

---

## 2. GitHub

Repository:

`rakarakaa775/World-of-vendrith`

Branch:

`main`

Repository organization was cleaned up without deleting historical source packages.

Current documentation structure:

- `docs/architecture/` — architecture and implementation-state documents.
- `docs/audits/` — current audit records.
- `docs/checkpoints/` — checkpoint and synchronization records.
- `docs/database/reconciliation/` — runtime/database reconciliation records.
- `docs/handoff/` — current handoff notes.
- `database/` — database design, migration, reconciliation, and validation material.
- `supabase/migrations/` — exact Supabase migration SQL captured in source control.
- `handoff/` — preserved historical handoff package.
- `SOURCE_ARCHIVE/` and `archive/` — preserved source/archive evidence.

### Repository migration rule

The repository is **not currently a complete mirror of the live Supabase migration history**.

Do not fabricate missing migration SQL from migration names.

---

## 3. Supabase runtime

Project:

`The world Vendrith`

Project ref:

`ojtmfokjcirvjvhnbnos`

Runtime audit was performed against the live project.

Observed state:

- Supabase status: ACTIVE_HEALTHY
- PostgreSQL: 17
- Migration history extends through `20260831165526_register_mountain_assets_v1` in the inspected runtime.

The runtime migration ledger therefore contains substantially more entries than the repository's currently captured `supabase/migrations/` directory.

This is a **source parity gap**, not evidence that the runtime is broken.

---

## 4. Runtime mutation-chain audit

Audited chain:

`Simulation Tick → Time Events → Activity → Inventory → Needs/Energy → Skill XP → History/Audit`

### Simulation

- Simulation clock locking: PASS
- World isolation: PASS
- Pause protection: PASS
- Tick orchestration: PASS
- Client direct execution: blocked

### Time Events

- Authoritative simulation time: PASS
- Atomic event claim: PASS
- `FOR UPDATE SKIP LOCKED`: PASS
- Execution ledger: PASS
- Condition validation: PASS
- Consequence execution: PASS
- Failure handling: PASS
- Retry limit/delay: PASS
- Recurrence: PASS
- Recurrence definition validation: PASS
- Event chain validation: PASS
- Client direct execution: blocked

### Activity

- Planning: PASS
- AI decision binding: PASS
- Completion gating: PASS
- Interruption/cancellation: PASS
- Reevaluation: PASS
- Activity → Energy: PASS
- Activity → Needs: PASS
- Activity → Food: PASS
- Activity → Skill XP: PASS
- XP idempotency on the audited completion path: PASS

### Inventory / Durability

- Inventory consume: PASS
- Inventory transfer: PASS
- Container authorization: PASS
- Container locking: PASS
- Consumption history: PASS
- Eat → Energy/Hunger: PASS
- Durability damage: PASS
- Durability repair: PASS
- Durability history: PASS

### History / Audit

- Specialized history tables: PASS
- RLS enabled: PASS
- Client INSERT: blocked
- Client UPDATE: blocked
- Client DELETE: blocked
- Engine history recording: PASS
- Ledger immutability boundary: PASS

---

## 5. Runtime forensic check

Activity records inspected:

| State | Count |
|---|---:|
| completed | 57 |
| running | 5 |
| planned | 2 |
| scheduled | 3 |
| cancelled | 1 |
| **Total** | **68** |

Consistency findings:

- orphan actor: 0
- orphan activity definition: 0
- duplicate XP keys: 0
- cancelled activity XP awards: 0
- cancelled activity food consumptions: 0

The single cancelled activity had cancellation metadata and no completion reward/food consumption, consistent with the cancellation lifecycle.

---

## 6. E2E test status

Fresh authenticated end-to-end testing is currently **BLOCKED** because the runtime has no available `user_lives` fixture/actor.

Important rule:

> Do not insert a production fixture merely to obtain a PASS result.

The existing runtime data was therefore tested using read-only forensic consistency checks instead.

---

## 7. Known technical debt

1. `grant_activity_skill_experience()` remains a legacy/other path without its own idempotency guard. The audited completion path uses the idempotent award ledger.
2. `vandrith_simulation_tick()` contains a redundant scheduled→running processing block. This is cleanup, not a confirmed production defect.
3. Fresh E2E actor testing is blocked by the absence of a runtime `user_lives` fixture.
4. GitHub does not yet contain every exact migration body present in the live Supabase migration ledger.

---

## 8. Production-change status

No production schema/function patch was applied as a result of the 2026-09-09 audit.

Repository changes in this checkpoint are documentation/organization changes only.

---

## 9. Source-of-truth rules

When evidence conflicts or is incomplete:

- **Live Supabase** is authoritative for current runtime state.
- **GitHub** is authoritative for source-controlled repository content.
- **Uploaded archives** are authoritative only for what they actually contain.
- **Audit documents** record verified observations and must not be treated as executable database source.

Future database changes should be captured as additive migrations with exact SQL before being promoted into `supabase/migrations/`.

---

## 10. Next milestone

The next technical milestone is:

**Recover/reconcile exact migration source parity, then establish an isolated authenticated E2E test harness without contaminating production runtime data.**

Until then, the current runtime mutation-chain audit remains PASS with the E2E fixture limitation explicitly recorded.
