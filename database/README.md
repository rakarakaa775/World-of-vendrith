# Database Source Map

## `database/migrations/`
Historical/project migration chain maintained as numbered SQL. These files are repository source artifacts and are distinct from the current Supabase migration history.

## `database/reconciliation/`
Runtime reconciliation records. A `.sql` file here records a patch applied or inspected against the live runtime; it is **not automatically a replay-safe migration**. Read the paired `.md` record and verify function signatures/state before replaying.

## `database/specifications/`
Schema and table design specifications.

## `database/validation/`
Static and SQL validation records.

## Important rule

Do not infer that a SQL file is part of the current Supabase migration chain solely from its filename or content. The authoritative applied migration history is the live Supabase migration ledger. Exact source-controlled migrations belong under `supabase/migrations/` only when their SQL is available and intended as migration source.
