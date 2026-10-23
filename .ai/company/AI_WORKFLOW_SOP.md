# Standard Operating Procedure — Sequential AI Workflow

## Workflow states
`PLANNED → AUDITED → IMPLEMENTED → QA_CHECKED → INTEGRATION_REVIEWED → VERIFIED`

Any state may transition to `BLOCKED`, `FAILED`, or `NEEDS_REVIEW`. Do not advance past a failed mandatory gate without documenting the exception and obtaining approval where needed.

## Stage 1 — Plan (Roadmap Agent)
- State the user outcome in plain language.
- Define in-scope and out-of-scope work.
- List acceptance criteria, dependencies, risk, and expected tests.
- Keep the task small enough to review.
**Handoff:** approved task brief.

## Stage 2 — Audit (Repository Auditor)
- Execute the repository preflight from `AI_REPOSITORY_ACCESS_POLICY.md`.
- Read `AGENTS.md`, relevant `.ai/rules/`, existing contracts, and tests.
- Determine whether the feature already exists and what should change.
- Record baseline and allowed files.
**Handoff:** audit report and safe implementation plan.

## Stage 3 — Implement (Implementation Agent)
- Change only the approved scope.
- Keep domain logic separate from rendering/UI where applicable.
- Preserve serialization/version compatibility, undo/redo, ownership, and licensing contracts where relevant.
- Add tests alongside code changes.
- Do not include unrelated cleanup.
**Handoff:** diff summary, tests added/changed, risks, and commands run.

## Stage 4 — QA (QA & Testing Agent)
- Run focused tests first.
- Run typecheck/lint/build or wider suites based on risk.
- Check negative cases and likely regressions.
- Clearly label skipped or blocked checks.
**Handoff:** evidence-based QA report.

## Stage 5 — Integration (Integration & Release Agent)
- Review unstaged/staged diffs and generated artifacts.
- Verify only intended files are staged.
- Check CI results when available.
- Commit or deploy only within approved authority.
**Handoff:** integration review and exact commit/release evidence, if applicable.

## Stage 6 — Independent verification
- Re-read acceptance criteria.
- Verify runtime/browser behavior when the feature requires it and the environment allows it.
- Confirm deployment separately from source commit and local build.
- Record remaining defects and confidence.
**Handoff:** final status and evidence.

## Completion statuses
- `VERIFIED`: all required criteria have direct evidence.
- `PARTIALLY VERIFIED`: some criteria pass, but one or more required checks remain.
- `FAILED`: evidence shows the outcome is incorrect.
- `BLOCKED`: execution or verification cannot safely proceed.
- `NEEDS_REVIEW`: a decision/approval from the owner is required.

## Final report format
1. Goal and result.
2. Branch and commit (if applicable).
3. Files changed.
4. Tests/checks with exact outcome.
5. Runtime/deployment verification status.
6. Known gaps and risks.
7. Next recommended task.