import { describe, expect, it } from "vitest";
import type { AiRequest } from "../domain/types";
import type { RepositoryPort } from "../ports/project-tools";
import { RepositoryCodeGraphAdapter } from "../adapters/codegraph";
import { ProjectDocumentationAdapter } from "../adapters/documentation";
import { createVendrithAiService } from "./runtime";

class InMemoryRepository implements RepositoryPort {
  private readonly files: Record<string, string> = {
    "apps/map-editor/ai/domain/types.ts": "export interface AiRequest {}",
    "apps/map-editor/ai/application/runtime.ts": 'import type { AiRequest } from "../domain/types";',
    "docs/architecture/VENDRITH_PROJECT_AI_V1.md": "CodeGraph is the structural map, not the brain.",
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

describe("Vendrith AI runtime service", () => {
  it("handles a plan request through the application service", async () => {
    const repository = new InMemoryRepository();
    const service = createVendrithAiService({
      repository,
      code: new RepositoryCodeGraphAdapter(repository),
      documentation: new ProjectDocumentationAdapter(repository),
      assetRegistry: { search: async () => [] },
    });

    const request: AiRequest = {
      id: "runtime-001",
      mode: "plan",
      prompt: "CodeGraph",
    };

    const response = await service.handle(request);

    expect(response.request.id).toBe("runtime-001");
    expect(response.approval).toBe("not-required");
    expect(response.plan.evidence.length).toBeGreaterThan(0);
  });

  it("keeps execute requests behind approval", async () => {
    const repository = new InMemoryRepository();
    const service = createVendrithAiService({
      repository,
      code: new RepositoryCodeGraphAdapter(repository),
      documentation: new ProjectDocumentationAdapter(repository),
      assetRegistry: { search: async () => [] },
    });

    const response = await service.handle({
      id: "runtime-002",
      mode: "execute",
      prompt: "Inspect CodeGraph",
    });

    expect(response.approval).toBe("pending");
    expect(response.plan.steps.some((step) => step.id === "approval")).toBe(true);
  });
});
