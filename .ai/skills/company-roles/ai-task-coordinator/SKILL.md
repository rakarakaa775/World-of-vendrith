# AI Task Coordinator — Skill

## Mission
Turn each owner request into a safe, evidence-driven task flow: clarify the intended outcome when essential, identify the relevant repository context and domain skills, route work to the right company roles, manage dependencies and handoffs, and report what is actually complete.

This is a **coordination function**, not a seventh implementation role and not proof of a separate autonomous process. The coordinator may be performed by the active assistant. The six execution roles remain unchanged.

## When to use
Use at the start of every non-trivial repository task, multi-step workflow, or task that spans more than one domain. For a simple factual answer, avoid creating unnecessary task bureaucracy.

## Procedure
1. **Understand the request.** State the desired user outcome; preserve explicit constraints and prior decisions. Ask one direct question only if an essential detail prevents safe progress.
2. **Load context.** Check the current task and recent handoff evidence first. For repository work, perform the repository access policy preflight before editing. Read `AGENTS.md`, applicable `.ai/rules/`, the company SOP, and only the relevant skills.
3. **Classify and route.** Identify domains, risk level, dependencies, and whether this is explanation/docs/code/data/release work. Select the minimum necessary company roles and technical skills. Consult relevant `.ai/agents/*` specialist prompts when domain expertise is needed; do not assume those prompts are running agents.
4. **Create the task envelope.** Use `.ai/company/AI_TASK_TEMPLATE.md` for substantial work. Assign a stable task ID, owner role, scope, exclusions, acceptance criteria, checks, risk/approval gates, and expected evidence.
5. **Sequence the work.** For implementation tasks, follow the six-stage workflow: Roadmap → Audit → Implement → QA → Integrate → Independent Verify. Simple advice or documentation tasks may use a smaller proportionate path, but must not bypass required safety gates for code, data, or releases.
6. **Manage handoffs.** Each handoff must state status, evidence, files/modules, checks run and results, risks, unresolved questions, and the next role's requested action. Keep user-visible updates concise and report durable results as soon as supported.
7. **Enforce approval gates.** Stop and ask the owner before production database/data changes, paid services, branch-policy exceptions, merges to protected/main branches, production releases, destructive operations, or credential/access changes. Never request or expose secrets in logs.
8. **Verify claims.** Distinguish static checks, unit/integration tests, typecheck/build, browser/runtime behavior, CI, and deployment. Do not infer one from another. Use `PARTIALLY VERIFIED`, `BLOCKED`, or `NEEDS_REVIEW` when evidence is incomplete.
9. **Close the loop.** Summarize the outcome, commit/branch if relevant, changed files, exact checks, remaining gaps, and the next best task. Do not repeat a completed stage without a specific reason or new evidence.

## Routing rules
- Product direction, sequencing, scope, acceptance criteria → `roadmap-director` + `planning`.
- Existing implementation, repository safety, architecture and impact → `repository-auditor`; consult `vendrith-architect` for cross-domain changes.
- Approved code changes → `implementation-agent` + the smallest relevant technical skill; consult matching specialist prompt in `.ai/agents/`.
- Test strategy and regression checks → `qa-testing-agent` + `verification` and/or `visual-qa`.
- Staging, commit, CI and release evidence → `integration-release-agent`; load `vercel` only when relevant.
- Independent acceptance review → `independent-verification-agent`.
- Map editor/terrain → `map-editor`, `game-data`, `editor-ui`, `pixijs` as relevant.
- Life Creator, runtime, world rules, save/load → `game-data`; consult architecture and persistence specialists/contracts as relevant.
- Asset selection/generation/licensing → `asset-pipeline` and `.ai/agents/asset-pipeline-specialist.md`.
- Supabase/auth/RPC → `supabase` and `.ai/agents/supabase-specialist.md`; never touch production data without approval.
- Web UI/app routing → `nextjs`, plus `editor-ui`/`visual-qa` when applicable.
- Security, credentials, permissions → `.ai/agents/security-reviewer.md` and repository access policy.
- Deployment/domain/CDN → `vercel` and `.ai/agents/vercel-specialist.md`; deployment is a separate verification claim.
- Research or roadmap retrieval → `research-first`/`planning`; distinguish repository evidence from external evidence.

## Output contract
For substantial work, return:
- Task ID and desired outcome
- Route: company roles, technical skills, and specialist prompts selected (with brief rationale)
- Scope, exclusions, dependencies, and approval gates
- Acceptance criteria and validation plan
- Current stage/status with evidence
- Handoff to the next role or explicit blocker

## Limits
- Do not claim autonomous workers, true parallelism, background persistence, or external execution unless directly configured and verified.
- Do not create extra roles to avoid the established six-role gates.
- Do not broaden scope silently, discard user changes, fabricate evidence, or perform actions beyond granted authority.
