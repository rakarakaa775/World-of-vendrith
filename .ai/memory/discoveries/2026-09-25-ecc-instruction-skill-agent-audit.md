# ECC instruction, skill, and agent audit — 2026-09-25

## Scope

Audited the repository's 13 GitHub instruction files against the existing 13 .ai/skills and 11 .ai/agents on branch feat/vendrith-ecc-v1.

## Source-of-truth roles

GitHub customizations have different intended roles:
- .github/copilot-instructions.md: repository-wide Copilot context.
- .github/instructions/*.instructions.md: always-on rules for matching paths.
- AGENTS.md: standing agent guidance shared across AI agents.
- Skills: task-specific workflows loaded when relevant.
- Specialist agents: focused reviewer/planner personas in the repository's existing ECC system.

The repository should not copy an entire skill or specialist agent into a path instruction. Path instructions should hold short, always-relevant constraints; skills should hold detailed workflows and evidence-gathering procedures.

## Findings

### Intentional overlap

The following overlaps are useful and should remain:
- map-editor instruction <-> map-editor skill <-> map-editor-specialist: architecture contract is always relevant; detailed workflow remains in the skill.
- pixijs instruction <-> pixijs skill <-> pixijs-specialist: renderer boundary and performance guardrails are always relevant; specialist handles deeper implementation review.
- game-data instruction <-> game-data skill <-> game-data-specialist: schema/domain invariants are always relevant.
- asset-pipeline instruction <-> asset-pipeline skill <-> asset-pipeline-specialist: provenance gate is always relevant; the skill owns the detailed pipeline.
- supabase instruction <-> supabase skill <-> supabase-specialist: security/RLS boundary is always relevant; current documentation verification belongs to the skill/specialist.
- testing-verification instruction <-> verification skill <-> verification-agent: verification policy is always relevant; execution belongs to the skill/agent.
- security instruction <-> security-reviewer: concise security guardrails are useful; detailed findings/remediation stay with the reviewer.
- nextjs/performance instruction <-> nextjs/vercel skills and specialists: framework boundaries are always relevant; deployment/version-specific work stays specialized.

### Scope issue found and corrected

The Git workflow instruction originally matched nearly every repository file. It was narrowed to repository/workflow/dependency-control surfaces:
- .github/**
- .gitignore
- package manifests
- lockfiles

This prevents Git process guidance from unnecessarily loading alongside ordinary source edits.

### Research scope

The research/provenance instruction intentionally overlaps many code areas because unfamiliar APIs can be integrated from TypeScript/React code. Its content remains conditional ("Before integrating...") and the detailed research workflow remains in .ai/skills/research-first.

The instruction's purpose is provenance and evidence policy, not a replacement for the research-first skill.

## Agent/skill responsibilities

Keep specialist agents and skills as the execution/deep-review layer:
- planner: planning only.
- code-reviewer: final diff review.
- verification-agent: execute verification and distinguish evidence.
- security-reviewer: security findings/remediation.
- vendrith-architect: cross-domain architecture.
- vercel-specialist: deployment/runtime.
- supabase-specialist: database/security.
- map-editor/pixijs/game-data/asset specialists: domain implementation/review.

Do not duplicate their full checklists into .github/instructions.

## Result

No broad deletion or consolidation is warranted. The existing separation is useful after the Git scope correction.

Future instruction changes should follow this rule:
1. Put short, always-on constraints in .github/instructions.
2. Put detailed task workflows in .ai/skills.
3. Put specialist review/execution responsibilities in .ai/agents.
4. Put repository-wide architectural invariants in AGENTS.md / .github/copilot-instructions.md.
5. Avoid adding another instruction layer when an existing skill or agent already owns the workflow.
