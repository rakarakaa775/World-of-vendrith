import { describe, expect, it } from "vitest";
import { createReadOnlyPlan } from "./plan-request";
import type { AiRequest } from "../domain/types";
import type { RepositoryPort } from "../ports/project-tools";
import { RepositoryCodeGraphAdapter } from "../adapters/codegraph";
import { ProjectDocumentationAdapter } from "../adapters/documentation";

class InMemoryRepository implements RepositoryPort {
  private readonly files: Record<string, string> = {
    "apps/map-editor/ai/application/plan-request.ts": `import type { AiPlan } from "../domain/types";
import { classifyApproval } from "../policies/ai-policy";`,
    "apps/map-editor/ai/domain/types.ts": "export interface AiPlan { requestId: string; }",
    "apps/map-editor/ai/policies/ai-policy.ts": "export function classifyApproval() { return \"not-required\" as const; }",
    "docs/architecture/VENDRITH_PROJECT_AI_V1.md": "CodeGraph is the structural map, not the brain.",
    "AGENTS.md": "Workflow: understand, inspect, research, plan, implement, test, review, verify, document.",
  };

  async readFile(path: string) {
    return this.files[path] ?? null;
  }

  async search(query: string) {
    const needle = query.toLowerCase();
    return Object.entries(this.files)
      .filter(([path, content]) => path.toLowerCase().includes(needle) || content.toLowerCase().includes(needle))
      .map(([path, content]) => ({ path, excerpt: content }));
  }
}

describe("Vendrith Project AI end-to-end plan flow", () => {
  it("builds a read-only plan from repository, CodeGraph, and project documentation evidence", async () => {
    const repository = new InMemoryRepository();
    const request: AiRequest = {
      id: "smoke-001",
      mode: "plan",
      prompt: "CodeGraph",
    };

    const plan = await createReadOnlyPlan(request, {
      repository,
      code: new RepositoryCodeGraphAdapter(repository),
      documentation: new ProjectDocumentationAdapter(repository),
    });

    expect(plan.requestId).toBe("smoke-001");
    expect(plan.steps.every((step) => step.readOnly)).toBe(true);
    expect(plan.steps.every((step) => !step.requiresApproval)).toBe(true);
    expect(plan.evidence.some((item) => item.kind === "verified-fact")).toBe(true);
    expect(plan.evidence.some((item) => item.kind === "project-rule")).toBe(true);
    expect(plan.evidence.some((item) => item.source.startsWith("codegraph:"))).toBe(true);
    expect(plan.summary).toContain("CodeGraph");
  });
});
