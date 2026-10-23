# Repository Access and Safety Policy

## Repository baseline
- Repository: `rakarakaa775/World-of-vendrith`
- Working directory expected in the current workspace: `/workspaces/World-of-vendrith`
- Required branch: `feat/vendrith-ecc-v1`
- Canonical guidance: read root `AGENTS.md` and applicable `.ai/rules/` files before implementation.

These values must be re-verified at the start of each task; do not assume a prior session's connection or state is still active.

## Preflight checklist
1. Confirm the connected device/tool and actual repository directory.
2. Run `pwd`, `git branch --show-current`, `git status --short --branch`, and `git log -1 --oneline`.
3. Confirm the required branch; stop and report if it differs.
4. Identify and preserve all existing user changes, including generated or untracked files.
5. Read repository instructions and inspect relevant modules/tests.
6. Record the allowed change surface and intended validation commands.

## Allowed by default
- Read repository files, history, and documentation.
- Run safe tests, type checks, lint, and builds that do not alter production data.
- Edit task-scoped code and documentation after the task is approved.
- Create temporary local test artifacts when they do not overwrite user files or access production services.

## Requires explicit owner approval
- Switching/creating branches when not required by the current approved task.
- Changes to production data, production schema, credentials, permissions, or security policy.
- Paid services, paid plans, new recurring costs, or external services with billing risk.
- Merge to main, production deployment, force-push, history rewrite, destructive migration, or broad deletion.
- Replacing user-owned files or overwriting unreviewed work.

## Prohibited routine actions
- `git reset --hard`, destructive `git clean`, blind checkout/restore, force push, or history rewriting.
- Committing secrets, tokens, passwords, private keys, or environment files containing credentials.
- Treating CI skipped due to missing service configuration as a pass.
- Claiming remote/browser behavior from a successful local build alone.

## Database and service safety
- Use local, disposable, or explicitly approved non-production environments for data-changing tests.
- Never enable a paid Supabase branch/plan or change production data without explicit approval.
- Redact credentials and private user data from reports.
- If safe isolation cannot be confirmed, stop before executing mutations.

## Git and commit policy
- Review `git diff --check`, staged diff, and final status before commit.
- Stage only explicitly reviewed files; avoid broad `git add -A` when unrelated changes exist.
- Preserve unrelated modifications and report them.
- Commit only after tests appropriate to the change pass or exceptions are explicitly recorded.
- After commit, report exact hash, branch, and remaining worktree changes.

## Stop conditions
Stop and ask the owner when branch/repository identity is wrong, unexpected destructive risk appears, credentials are required, the requested action exceeds granted access, or user changes could be overwritten.