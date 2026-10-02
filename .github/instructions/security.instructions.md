---
applyTo: "**/*.ts,**/*.tsx,**/*.sql,**/*.json,**/*.yml,**/*.yaml,.github/**/*,supabase/**/*,database/**/*"
---

# Vendrith security review instructions

Before changing security-sensitive code, inspect .ai/agents/security-reviewer.md, the relevant .ai/rules files, authentication/authorization contracts, database policies, and focused tests.

## Security boundary
- Never commit secrets, tokens, service-role keys, private credentials, or sensitive environment values.
- Treat browser/client input, serialized map documents, RPC results, uploaded assets, and external metadata as untrusted.
- Validate at trust boundaries before data enters canonical domain state or privileged operations.
- Keep privileged database operations server-side and narrowly scoped.
- Preserve Supabase RLS, authorization, storage-policy, and approval boundaries.

## Web and API safety
- Review authentication and authorization separately; being authenticated does not imply permission.
- Validate IDs, slot numbers, versions, file metadata, and serialized payloads before use.
- Prevent injection by using parameterized queries and safe APIs; never concatenate untrusted SQL.
- Preserve CSRF protections and safe server/client boundaries where applicable.
- Escape or sanitize untrusted content before rendering; avoid unsafe HTML unless explicitly justified and constrained.
- Do not expose internal errors, credentials, tokens, or sensitive database payloads to clients.

## Asset and file safety
- Treat uploaded or imported assets as untrusted.
- Preserve provenance and license metadata; do not bypass approval gates.
- Reject ambiguous or malformed metadata instead of guessing.
- Avoid unsafe path construction and arbitrary file access.

## Map Editor integrity
- Preserve Tool -> Command -> State -> Renderer boundaries.
- Do not allow PixiJS display objects or UI state to bypass domain validation.
- Validate map identity, schema version, relationship metadata, durable version metadata, and save-slot ownership at persistence boundaries.
- Treat authoritative durable versions as the recovery source and handle stale-version conflicts explicitly.

## Verification
- Add focused regression tests for security-sensitive fixes and trust-boundary failures.
- Review auth/authz, input validation, injection, XSS/CSRF, privileged APIs, RLS/storage policies, and dependency changes when relevant.
- Do not weaken a security assertion to make CI pass.
- Before completion, inspect the final diff for secrets, privilege expansion, unsafe bypasses, and accidental policy changes.
