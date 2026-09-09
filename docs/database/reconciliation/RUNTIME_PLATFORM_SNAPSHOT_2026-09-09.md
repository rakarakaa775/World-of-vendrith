# Runtime Platform Snapshot — 2026-09-09

## Extensions

The live Supabase project reports these installed PostgreSQL extensions:

- `pg_stat_statements` 1.11
- `pgcrypto` 1.3
- `plpgsql` 1.0
- `supabase_vault` 0.3.1
- `uuid-ossp` 1.1

## Public custom types

The public schema contains a large set of PostgreSQL composite row types corresponding to tables/views and other database objects. The audit did not identify a user-defined enum or domain from the inspected `pg_type` result.

## Interpretation

The extension inventory confirms that UUID generation and cryptographic functionality available in the live database are supplied by installed extensions. This snapshot is observational and does not prescribe extension creation in a test database.

The very large public composite-type inventory reinforces that the live database is a mature runtime schema. It should not be reduced to a small hand-written migration chain by inference.

## Recovery rule

Use this snapshot as runtime evidence only. Exact executable migration source still requires authoritative SQL export/source recovery.

## Safety

No extension, type, schema, table, function, policy, grant, or data was modified.
