import { describe, expect, it, vi } from "vitest";
import { buildProjectContext } from "./project-context";

describe("project context", () => {
  it("combines repository, codegraph, documentation, and asset intelligence", async () => {
    const repository = {
      search: vi.fn(async () => [
        { path: "src/editor.ts", excerpt: "map editor" },
        { path: "src/asset.ts", excerpt: "asset registry" },
      ]),
      readFile: vi.fn(async () => null),
    };
    const code = {
      findDependencies: vi.fn(async (path: string) => path === "src/editor.ts" ? ["src/map.ts"] : []),
      findDependents: vi.fn(async (path: string) => path === "src/editor.ts" ? ["src/app.ts"] : []),
    };
    const assetRegistry = {
      search: vi.fn(async () => [{
        id: "asset-1", kind: "verified-fact" as const, source: "asset_license_registry",
        fact: JSON.stringify({
          name: "Grass",
          category: "terrain",
          license_verification_status: "verified",
          license_usage_status: "allowed",
          commercial_use_allowed: true,
        }), confidence: "high" as const,
      }]),
    };
    const documentation = {
      search: vi.fn(async () => [{
        id: "doc-1", kind: "project-rule" as const, source: "AGENTS.md",
        fact: "Use project rules", confidence: "high" as const,
      }]),
    };

    const context = await buildProjectContext(
      { prompt: "map editor", maxRepositoryMatches: 1 },
      { repository, code, documentation, assetRegistry },
    );

    expect(context.query).toBe("map editor");
    expect(context.repositoryMatches).toHaveLength(1);
    expect(context.dependencyMap[0]).toEqual({
      path: "src/editor.ts",
      dependencies: ["src/map.ts"],
      dependents: ["src/app.ts"],
    });
    expect(context.documentationEvidence[0].source).toBe("AGENTS.md");
    expect(context.assetEvidence[0].source).toBe("asset_license_registry");
    expect(context.assetIntelligence[0]).toMatchObject({
      usageDomain: "world",
      licenseState: "clear",
    });
    expect(repository.search).toHaveBeenCalledWith("map editor");
  });
});
