---
applyTo: "**/*,.github/**/*,.gitignore"
---

# Vendrith Git and GitHub workflow instructions

Before making repository-wide changes, inspect AGENTS.md, the relevant .github instructions, current branch, and existing CI status.

## Branch discipline
- Work only on the requested feature/fix branch.
- Never modify, force-push, reset, or merge main unless the user explicitly requests it.
- Keep unrelated work out of the current branch.
- Do not rewrite shared branch history unless explicitly authorized.

## Commit discipline
- Prefer small, focused, reviewable commits.
- Commit messages should describe the actual change.
- Do not bundle generated artifacts, secrets, local configuration, or unrelated formatting changes into feature commits.
- Preserve lockfiles when dependency changes require them.
- Review the diff before considering a commit complete.

## Pull requests and review
- Treat pull requests as the review boundary for meaningful changes.
- Summarize behavior changes, contract changes, tests run, and known limitations.
- Do not merge a pull request or approve a merge unless explicitly authorized.
- Re-check CI after fixes and before reporting a change as verified.
- For security-sensitive, persistence-sensitive, or cross-boundary changes, request or perform an additional focused review when available.

## CI and status
- Treat GitHub Actions results as authoritative only for the exact commit/workflow being reported.
- Distinguish workflow success from unrelated external status failures.
- Never report a green build based on an old commit or a different branch.
- Investigate failing checks rather than bypassing or weakening them.
- Do not skip required verification merely because a change appears small.

## Safe repository operations
- Never commit credentials, tokens, private keys, service-role secrets, or local environment files.
- Do not use force-push or destructive history operations as a shortcut for resolving conflicts.
- Do not delete or disable CI checks merely to make a pull request pass.
- Do not silently revert another contributor's work; reconcile changes deliberately.

## Reviewability
Every completed change should make it possible to answer:
- What changed?
- Why was it changed?
- Which contract or behavior does it affect?
- What verification was performed?
- What remains unverified or uncertain?

Durable architectural decisions belong in .ai/memory/ rather than only in a commit message.
