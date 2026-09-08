# VANDRITH WORLD — BOLT HANDOFF

This package is a continuation handoff from the database/Foundation audit.

IMPORTANT:
- Do NOT restart or redesign the Foundation Schema, ERD, or Detailed Table Specification.
- The Foundation 11-table design was already worked through and is the project baseline.
- Database implementation has NOT been applied to Supabase.
- Treat the Foundation design decisions as the baseline for implementation.
- Before changing database structure, inspect the existing blueprint/specification artifacts and preserve their decisions.

FOUNDATION TABLES:
1. users
2. profiles
3. settings
4. roles
5. permissions
6. role_permissions
7. user_roles
8. sessions
9. devices
10. notifications
11. audit_logs

SECURITY BOUNDARIES:
- Supabase Auth owns passwords and authentication credentials/tokens.
- Do not add password_reset_tokens to Foundation.
- Do not store access/refresh/session credentials in Foundation tables.
- audit_logs is append-only.
- audit_logs.user_id uses SET NULL on user deletion.
- role_permissions and user_roles use composite primary keys.
- roles, permissions, and role_permissions are system-owned.
- User-owned data uses auth.uid()-based RLS.

CURRENT IMPLEMENTATION STATUS:
- Architecture: complete
- Foundation conceptual model: complete
- Detailed table specification: complete as working project state
- Schema/ERD design: complete as working project state
- SQL contract: complete as working project state
- Supabase/database application: NOT YET DONE

NEXT TASK:
Implement the already-agreed Foundation database in Bolt/Supabase. Do not redesign it unless an explicit conflict is found. If a conflict is found, report it before changing the schema.

The original project handoff files are preserved in this package.