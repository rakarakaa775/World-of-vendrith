import { describe, expect, it, vi } from "vitest";
import { buildProjectIntelligenceSnapshot } from "./project-intelligence";

describe("project intelligence", () => {
  it("builds a manifest and preserves evidence-backed context", async () => {
    const repository = {
      listFiles: vi.fn(async () => [
        "apps/map-editor/app/editor/page.tsx",
        "apps/map-editor/ai/application/project-context.ts",
        "assets/terrain/grass.png",
        "supabase/migrations/20261001_schema.sql",
        "docs/ai/VENDRITH_AI_ROADMAP.md",
      ]),
      search: vi.fn(async () => [{ path: "apps/map-editor/ai/application/project-context.ts", excerpt: "project context" }]),
      readFile: vi.fn(async () => null),
    };
    const code = {
      findDependencies: vi.fn(async () => ["apps/map-editor/ai/ports/project-tools.ts"]),
      findDependents: vi.fn(async () => ["apps/map-editor/ai/application/tool-definitions.ts"]),
    };
    const documentation = {
      search: vi.fn(async () => [{ id: "doc-1", kind: "project-rule" as const, source: "docs/ai/VENDRITH_AI_ROADMAP.md", fact: "Phase 3", confidence: "high" as const }]),
    };
    const assetRegistry = {
      search: vi.fn(async () => [{ id: "asset-1", kind: "verified-fact" as const, source: "asset_registry:x", fact: JSON.stringify({ category: "terrain", license_verification_status: "verified", license_usage_status: "allowed" }), confidence: "high" as const }]),
    };

    const snapshot = await buildProjectIntelligenceSnapshot("project intelligence", { repository, code, documentation, assetRegistry });

    expect(snapshot.manifest.repositoryFiles).toBe(5);
    expect(snapshot.manifest.topLevelDirectories).toEqual(["apps", "assets", "docs", "supabase"]);
    expect(snapshot.manifest.applicationAreas).toEqual(["apps", "supabase"]);
    expect(snapshot.manifest.assetAreas).toContain("assets/terrain/grass.png");
    expect(snapshot.evidence[0].source).toBe("repository:git-tree");
    expect(snapshot.dependencyMap[0].dependencies).toContain("apps/map-editor/ai/ports/project-tools.ts");
  });

  it("falls back safely when the repository adapter has no tree listing", async () => {
    const repository = {
      search: vi.fn(async () => []),
      readFile: vi.fn(async () => null),
    };
    const empty = { findDependencies: vi.fn(async () => []), findDependents: vi.fn(async () => []), search: vi.fn(async () => []) };

    const snapshot = await buildProjectIntelligenceSnapshot("empty", { repository, code: empty, documentation: empty, assetRegistry: empty });
    expect(snapshot.manifest.repositoryFiles).toBe(0);
    expect(snapshot.evidence[0].confidence).toBe("low");
  });
});
