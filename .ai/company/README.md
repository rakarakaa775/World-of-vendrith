# World of Vendrith Studio — AI Company Handbook

This folder contains the operating charter and governance documents for the initial six-role AI team. Read these documents in order:

1. [Company Charter](./AI_COMPANY_CHARTER.md) — mission, principles, decision rights, and definition of done.
2. [Agent Job Descriptions](./AI_AGENT_JOB_DESCRIPTIONS.md) — responsibilities and limits for the six roles.
3. [Repository Access Policy](./AI_REPOSITORY_ACCESS_POLICY.md) — branch, Git, database, service, and release safeguards.
4. [Task Routing Policy](./AI_TASK_ROUTING_POLICY.md) — intake, skill selection, routing, and handoff requirements.
5. [Workflow SOP](./AI_WORKFLOW_SOP.md) — sequential handoffs from planning through verification.
6. [Task Brief Template](./AI_TASK_TEMPLATE.md) — reusable structure for approved tasks.
7. [QA and Verification Standard](./AI_QA_VERIFICATION_STANDARD.md) — evidence requirements and truthful completion status.
8. [Decision Log](./AI_DECISION_LOG.md) — durable decisions and operating constraints.

## Current operating configuration

- Team: six roles.
- Coordination: sequential.
- Authority: supervised execution.
- Required branch: `feat/vendrith-ecc-v1`.
- Production database changes, paid services, main merges, and production releases: explicit owner approval required.

## Agent skills

The skill registry lives in [`.ai/skills/README.md`](../skills/README.md). It includes a task-coordinator skill plus dedicated `SKILL.md` instructions for each of the six execution roles. Technical/domain skills remain separate and should be loaded only when relevant. The coordinator routes work; it does not add a seventh execution role or create a separate agent identity.

## Important distinction

These documents define the intended operating process. They do not automatically provision six separate agents, grant permissions, create external services, or prove that any task has been executed. Configure and test automation separately before treating it as operational.
