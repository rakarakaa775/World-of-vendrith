import type { AiPlan, AiRequest, Evidence } from "../domain/types";
import { classifyApproval } from "../policies/ai-policy";
import type { CodeIntelligencePort, DocumentationPort, RepositoryPort } from "../ports/project-tools";

export interface PlanRequestDependencies {
  repository: RepositoryPort;
  code: CodeIntelligencePort;
  documentation: DocumentationPort;
}

export async function createReadOnlyPlan(
  request: AiRequest,
  deps: PlanRequestDependencies,
): Promise<AiPlan> {
  const matches = await deps.repository.search(request.prompt);
  const evidence: Evidence[] = [
    ...matches.map((match, index) => ({
      id: `repo-${index}`,
      kind: "verified-fact" as const,
      source: match.path,
      fact: match.excerpt,
      confidence: "high" as const,
    })),
    ...(await deps.documentation.search(request.prompt)),
  ];

  const approval = classifyApproval(request.mode, request.prompt);
  const steps = [
    {
      id: "inspect",
      description: "Inspect relevant repository and project-rule evidence.",
      readOnly: true,
      requiresApproval: false,
    },
    {
      id: "impact",
      description: "Trace dependencies and dependents before proposing a change.",
      readOnly: true,
      requiresApproval: false,
    },
    {
      id: "verify",
      description: "Define the smallest verification pipeline for the proposed change.",
      readOnly: true,
      requiresApproval: false,
    },
  ];

  if (approval === "pending") {
    steps.push({
      id: "approval",
      description: "Wait for explicit user approval before any mutation or high-risk side effect.",
      readOnly: true,
      requiresApproval: true,
    });
  }

  return {
    requestId: request.id,
    summary: `Read-only project analysis for: ${request.prompt}`,
    steps,
    evidence,
  };
}
