# Migration Log

> The Vendrith World — chronological log of database migrations.

## Format
Each entry: migration filename, date, summary, and affected tables.

---

## Migrations

_(No migrations have been applied yet. The database is empty.)_

---

## Template Entry
```
### <filename> — <date>
**Summary:** _(one line)_
**Tables:** _(list)_
**Notes:** _(optional)_
```

## Rules
- DDL goes through migration files only.
- Migrations are ordered, named, and never edited after apply.
- Never `DROP`, rename, or change column types without a data-preserving plan.
