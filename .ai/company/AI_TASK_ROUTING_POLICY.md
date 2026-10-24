# AI Task Routing and Handoff Policy

## Purpose
Define how a request enters the Vendrith AI company workflow, how it is assigned to the six existing roles, and how domain skills and specialist prompts are selected. The coordinator is a routing function, not a seventh execution role.

## Intake and classification
For each non-trivial request, the coordinator records:
1. User outcome and explicit constraints.
2. Task ID and related roadmap/previous handoff, if applicable.
3. Task class: advice/research, documentation, code, assets/licensing, data/persistence, security, or release/deployment.
4. Affected modules and dependencies, based on repository evidence rather than guesses.
5. Risk: low, medium, high; whether owner approval is required.
6. Acceptance criteria and checks needed to demonstrate them.

If an essential requirement is missing, ask one concise question. Otherwise proceed with conservative assumptions and state them.

## Role routing

| Stage | Owner role | Required outcome |
|---|---|---|
| Plan | Roadmap Director | Task brief, scope, exclusions, dependencies, acceptance criteria, risk and tests |
| Audit | Repository Auditor | Preflight, baseline, relevant contracts/tests, impact and safe file scope |
| Implement | Implementation Agent | Minimal approved diff, tests where applicable, implementation evidence |
| QA | QA & Testing Agent | Exact commands/results, negative cases, skipped checks and regressions |
| Integrate | Integration & Release Agent | Final diff/staging review, commit/CI/release evidence where authorized |
| Verify | Independent Verification Agent | Acceptance criteria checked against evidence; honest final status |

For small advice or docs-only requests, the coordinator may use a proportionate subset. Any task that changes application behavior, persistence, access, or release state must still pass all applicable safety and QA gates. Never skip a gate solely to save time.

## Domain skill selection
Load only relevant technical skills, alongside the current role skill. Existing `.ai/agents/` files are specialist instructions and do not prove separate agents are running.

| Request area | Candidate technical skills / specialist prompts |
|---|---|
| Map editor, terrain, tile semantics | `map-editor`, `game-data`, `editor-ui`, `pixijs`; map-editor specialist |
| Life Creator, game runtime, world state, save/load | `game-data`, `planning`; Vendrith architect and relevant persistence specialist |
| Asset ingestion, art references, licensing | `asset-pipeline`; asset-pipeline specialist |
| Web application/UI | `nextjs`, `editor-ui`, `visual-qa`; relevant UI specialist |
| Supabase, Auth, RPC, database | `supabase`; Supabase specialist and security reviewer when appropriate |
| CI, Vercel, domains, deployment | `vercel`; Vercel specialist |
| Security, secrets, permissions, destructive actions | security reviewer plus repository access policy |
| Tests and verification | `verification`, `visual-qa`; verification agent |
| Research, project priorities, requirements | `research-first`, `planning`; planner |

This is a candidate map, not a mandate to load every skill listed. Audit the repository and contracts to select the narrowest useful set.

## Required task envelope
Use `.ai/company/AI_TASK_TEMPLATE.md`. At minimum record:
- `task_id`, request/outcome, branch/workspace baseline
- in-scope and out-of-scope changes
- owner role and selected skills/prompts
- dependencies and impacted modules
- acceptance criteria and validation commands/behavior
- risk and owner approval gates
- status, evidence, unresolved items, next handoff

## Handoff protocol
Every handoff includes:
- **Task ID / stage / status**
- **Evidence:** exact files, commands, outcomes, commit or CI identifiers if relevant
- **Checks not run:** reason and impact
- **Risks / open questions**
- **Next role action:** one explicit requested action

The next role must review the prior evidence rather than treating its status label as proof. If a check fails, stop advancement and report the failure; do not hide it inside a broad success summary.

## Approval and safety gates
Follow `AI_REPOSITORY_ACCESS_POLICY.md` and the Company Charter. Explicit owner approval is required before production database/data changes, paid services, protected/main branch changes or merges, production releases, destructive actions, branch-policy exceptions, or credentials/access changes. Routine work must remain on `feat/vendrith-ecc-v1`, preserve unrelated modifications, and avoid staging generated/unrelated files.

## Parallel work
Default to sequential execution. Parallelize only when the platform actually supports it, tasks are independent, shared files/resources will not conflict, and evidence can be reconciled. Never claim multiple autonomous agents merely because multiple role prompts exist.

## Completion
The coordinator compiles role handoffs into the final report and uses the QA standard's status definitions. A commit or successful build alone does not prove browser behavior or deployment. If required evidence is missing, mark `PARTIALLY VERIFIED`, `BLOCKED`, or `NEEDS_REVIEW`.
