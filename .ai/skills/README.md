# Vendrith AI Skills Registry

This registry connects reusable skills to the supervised six-role workflow defined in [`../company/AI_WORKFLOW_SOP.md`](../company/AI_WORKFLOW_SOP.md).

## Operating rules

- Run the six company roles **sequentially**: Roadmap → Audit → Implement → QA → Integrate → Independently Verify.
- A role is a defined responsibility, not proof of a separate autonomous agent. Do not claim parallel agents or automation unless configured and directly verified.
- At every handoff include task ID, status, evidence, files/modules, checks, risks, unresolved items, and the next role's requested action.
- The repository instructions and `.ai/company/` policies govern all skills. Stop if a skill conflicts with owner direction or repository safety policy.
- Use only relevant skills; do not load every technical skill for every task.

## Six company-role skills

| Sequence | Skill | Use when |
|---|---|---|
| 01 | [`roadmap-director`](./company-roles/roadmap-director/SKILL.md) | Scope, prioritize, and define acceptance criteria |
| 02 | [`repository-auditor`](./company-roles/repository-auditor/SKILL.md) | Establish baseline and inspect existing implementation |
| 03 | [`implementation-agent`](./company-roles/implementation-agent/SKILL.md) | Make approved, task-scoped changes |
| 04 | [`qa-testing-agent`](./company-roles/qa-testing-agent/SKILL.md) | Test changed behavior and report exact evidence |
| 05 | [`integration-release-agent`](./company-roles/integration-release-agent/SKILL.md) | Review staged scope, commit/CI/release evidence |
| 06 | [`independent-verification-agent`](./company-roles/independent-verification-agent/SKILL.md) | Verify acceptance criteria independently |

## Technical/domain skills

- Planning and discovery: `planning`, `research-first`, `onboarding`
- Game/editor domain: `game-data`, `map-editor`, `editor-ui`, `pixijs`
- Assets: `asset-pipeline`
- Application/infrastructure: `nextjs`, `supabase`, `vercel`
- Quality: `verification`, `visual-qa`

Read the matching skill at `.ai/skills/<skill-name>/SKILL.md`. Company-role skills define **who does what and what evidence they hand off**; technical skills define **domain-specific implementation constraints**.

## Completion standard

Use `VERIFIED`, `PARTIALLY VERIFIED`, `FAILED`, `BLOCKED`, or `NEEDS_REVIEW` as defined by the company QA standard. Never promote a task based on an assumption, an unrun check, a successful build alone, or a commit alone.
