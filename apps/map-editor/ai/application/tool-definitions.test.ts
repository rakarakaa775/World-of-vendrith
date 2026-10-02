import { describe, expect, it } from "vitest";
import { createProjectTools } from "./tool-definitions";
import type { ProjectTools } from "./tool-definitions";

function dependencies(): ProjectTools {
  return {
    repository: {
      async readFile(path) { return `content:${path}`; },
      async search(query) { return [{ path: "src/a.ts", excerpt: query }]; },
    },
    codeIntelligence: {
      async findDependencies(path) { return [`dep:${path}`]; },
      async findDependents(path) { return [`dependent:${path}`]; },
    },
    documentation: {
      async search(query) { return [{ id: "doc-1", kind: "project-rule", source: "AGENTS.md", fact: query, confidence: "high" }]; },
    },
    assetRegistry: {
      async search(query) { return [{ id: "asset-1", kind: "verified-fact", source: "asset_license_registry", fact: query, confidence: "high" }]; },
    },
    verification: {
      async verify(scope) { return { ok: true, checks: scope.map(name => ({ name, ok: true })) }; },
    },
  };
}

describe("project tool definitions", () => {
  it("exposes structural, documentation, asset, repository and verification tools", () => {
    const names = createProjectTools(dependencies()).map(tool => tool.name);
    expect(names).toEqual([
      "repository.read_file",
      "repository.search",
      "codegraph.dependencies",
      "codegraph.dependents",
      "documentation.search",
      "asset_registry.search",
      "verification.run",
    ]);
  });

  it("executes CodeGraph and asset registry tools through their ports", async () => {
    const tools = createProjectTools(dependencies());
    const graph = tools.find(tool => tool.name === "codegraph.dependencies");
    const assets = tools.find(tool => tool.name === "asset_registry.search");
    expect(graph).toBeDefined();
    expect(assets).toBeDefined();

    const graphResult = await graph!.execute({ path: "src/editor.ts" }, {
      mode: "explain", requestId: "req-1",
    });
    const assetResult = await assets!.execute({ query: "LPC terrain" }, {
      mode: "explain", requestId: "req-1",
    });

    expect(graphResult).toEqual(["dep:src/editor.ts"]);
    expect(assetResult).toMatchObject([{ source: "asset_license_registry" }]);
  });
});
