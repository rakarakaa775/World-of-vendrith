import { describe, expect, it, vi } from "vitest";
import type { RepositoryPort } from "../ports/project-tools";
import { RepositoryCodeGraphAdapter } from "./codegraph";

function repository(files: Record<string, string>): RepositoryPort {
  return {
    readFile: vi.fn(async (path: string) => files[path] ?? null),
    search: vi.fn(async (query: string) =>
      Object.entries(files)
        .filter(([path, content]) => path.includes(query) || content.includes(query))
        .map(([path, excerpt]) => ({ path, excerpt })),
    ),
  };
}

describe("RepositoryCodeGraphAdapter", () => {
  it("resolves relative imports as dependencies", async () => {
    const repo = repository({
      "apps/map-editor/ai/application/plan.ts":
        'import { x } from "../domain/types";',
      "apps/map-editor/ai/domain/types.ts": "export const x = 1;",
    });

    const graph = new RepositoryCodeGraphAdapter(repo);

    await expect(
      graph.findDependencies("apps/map-editor/ai/application/plan.ts"),
    ).resolves.toEqual(["apps/map-editor/ai/domain/types.ts"]);
  });

  it("finds dependents from repository search results", async () => {
    const repo = repository({
      "apps/map-editor/ai/domain/types.ts": "export const x = 1;",
      "apps/map-editor/ai/application/plan.ts":
        'import type { x } from "../domain/types";',
    });

    const graph = new RepositoryCodeGraphAdapter(repo);

    await expect(
      graph.findDependents("apps/map-editor/ai/domain/types.ts"),
    ).resolves.toEqual(["apps/map-editor/ai/application/plan.ts"]);
  });
});
