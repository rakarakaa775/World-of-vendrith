# 04 — Database Rules

> The Vendrith World — database standards for the entire project.
>
> Supabase (PostgreSQL) is the default backend for persistent data. These rules are
> permanent and apply to every table, migration, and query. No SQL or tables are
> defined here — this document sets the standards that future schema work must follow.

---

## 1. Database Philosophy

The database is the long-term memory of the project. It is designed to be trusted,
not patched. Every schema decision prioritizes durability and clarity over speed.

- **Consistency.** Data follows a single, enforced shape. Naming, types, and relationships are uniform across the schema. No two tables represent the same concept differently.
- **Reliability.** Data is never lost silently. Constraints, validation, and referential integrity protect state at the database level, not only in application code.
- **Maintainability.** The schema is readable and documented. A new contributor can understand the data model from the docs without reading a single migration.
- **Scalability.** The schema is designed to grow. New systems extend the existing model rather than force rewrites. Growth is additive.

---

## 2. Naming Rules

- All identifiers use `snake_case` (`user_profile`, `created_at`).
- Table names are plural (`characters`, `activities`). Column names are singular where they hold a single value (`name`, `email`).
- Naming is consistent across the schema. The same concept uses the same word everywhere. No synonyms for the same thing.
- Names are meaningful and describe the data, not the implementation (`last_login_at`, not `ts1`).
- Foreign keys follow the pattern `<referenced_table_singular>_id` (`character_id`, `activity_id`).
- No reserved words as identifiers. No abbreviations except widely understood ones (`url`, `id`, `api`).

---

## 3. Schema Rules

- Normalize data where appropriate. Store each fact in one place. Avoid duplicating data across tables.
- Avoid duplicated data. If the same value appears in two tables, one should reference the other, not copy it.
- Keep relationships clear. Every relationship is explicit through a foreign key, not implied by convention.
- Prefer explicit foreign keys. Relationships are declared, not inferred. Every foreign key is named and documented.
- Every table has a clear, single responsibility. A table represents one entity or one join — not a grab bag.
- Timestamps are standard: `created_at` and `updated_at`, both `timestamptz`, default `now()`.

---

## 4. Migration Rules

- Every schema change requires documentation. The relevant `docs/database/` files are updated in the same change.
- Every schema change requires a migration log entry in `docs/database/Migration_Log.md`.
- Migrations are version-tracked. They are ordered, named, and never edited after they are applied.
- DDL goes through migration files only. Never raw SQL outside the migration tooling.
- Migrations are additive by default. Never `DROP`, rename, or change column types without a data-preserving plan.
- A migration is never merged with failing tests or an undocumented schema change.

---

## 5. Data Integrity

- **Validation.** Data is validated at the boundary. Application code validates input before it reaches the database; the database enforces the final contract through constraints.
- **Constraints.** Every column that can be constrained is constrained — `NOT NULL`, `UNIQUE`, `CHECK`, and foreign key constraints are used wherever they protect invariants.
- **Referential integrity.** Foreign keys are enforced. No orphan rows. Deletes and updates cascade or restrict according to the documented relationship.
- **Consistent identifiers.** Primary keys are uniform across the schema. The same key type and strategy is used for every table unless a documented exception exists.

---

## 6. Performance

- **Proper indexing strategy.** Indexes are added for columns used in lookups, joins, and filters. Indexes are not added speculatively.
- **Avoid unnecessary queries.** Fetch what is needed, no more. N+1 patterns are avoided. Reads are batched where practical.
- **Design for future growth.** The schema anticipates more rows and more relationships over time, not just the current dataset.
- Performance choices are justified by evidence, not intuition. No premature optimization that harms readability or maintainability.
- No SQL examples are specified here. Concrete queries are designed at implementation time, per these principles.

---

## 7. Security

- **Least privilege.** Roles and policies grant the minimum access required for the task. No broad permissions by default.
- **Protect sensitive data.** Sensitive columns are never exposed through public APIs or client reads unless explicitly required.
- **Row-level security when appropriate.** RLS is enabled on every table. Access is scoped to the owning user via `auth.uid()`, never `current_user`.
- **Never expose internal data unnecessarily.** The public schema surface is intentional and documented. No internal or join-only columns leak to clients.
- Four policies per table — SELECT, INSERT, UPDATE, DELETE. Never `FOR ALL`.

---

## 8. Backup and Recovery

- **Regular backups.** Persistent data is backed up on a defined schedule. The project never relies on a single copy.
- **Recovery planning.** A recovery path is documented for every persistent table. The team knows how to restore, not just how to store.
- **Data durability.** Data survives restarts, deploys, and migrations. No persistent state is stored only in memory or ephemeral disk.
- Migrations are reversible in principle. Where a migration cannot be cleanly reversed, the forward-only decision is documented.

---

## 9. Documentation

Every database change must update:

- **Schema documentation** — `docs/database/Schema.md` reflects the current shape of every table.
- **ERD** — `docs/database/ERD.md` reflects the current entity relationships.
- **Migration log** — `docs/database/Migration_Log.md` records every migration, its date, and its affected tables.

Documentation is updated in the same change as the schema. No schema change lands with stale docs.

---

## 10. Future Expansion

- Design the database to support future systems without requiring major redesigns.
- The schema is additive. New systems add tables and relationships; they do not mutate existing ones.
- Relationships are designed to accommodate growth — many-to-many joins, optional foreign keys, and extensible enums are preferred over rigid one-to-one couplings.
- When a schema change is unavoidable, it follows the Decision Rules and Breaking Changes Policy in `01_Project_Rules.md`.
- The data model is never optimized for the current sprint at the expense of the next phase.
