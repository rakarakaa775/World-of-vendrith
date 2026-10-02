import { describe, expect, it, vi } from "vitest";
import { buildProjectSchemaSummary } from "./schema-intelligence";

describe("schema intelligence", () => {
  it("discovers schema areas from repository evidence", async () => {
    const repository = {
      readFile: vi.fn(async () => null),
      search: vi.fn(async (query: string) => {
        if (query.includes("editor_map_identity")) {
          return [{ path: "supabase/migrations/20260919120000_map_editor_hierarchy_identity_v1.sql", excerpt: "editor_map_identity" }];
        }
        if (query.includes("worlds")) {
          return [{ path: "supabase/migrations/0001_vandrith_foundation_and_simulation.sql", excerpt: "worlds" }];
        }
        if (query.includes("dialogue")) {
          return [{ path: "apps/map-editor/editor/dialogue-schema.ts", excerpt: "dialogue" }];
        }
        return [];
      }),
    };

    const summary = await buildProjectSchemaSummary(repository);
    const map = summary.areas.find((area) => area.area === "map");
    const world = summary.areas.find((area) => area.area === "world");
    const dialogue = summary.areas.find((area) => area.area === "dialogue");

    expect(map?.status).toBe("evidence-found");
    expect(map?.evidence[0].source).toContain("20260919120000");
    expect(world?.status).toBe("evidence-found");
    expect(dialogue?.status).toBe("evidence-found");
  });

  it("does not invent missing schema contracts", async () => {
    const repository = {
      readFile: vi.fn(async () => null),
      search: vi.fn(async () => []),
    };

    const summary = await buildProjectSchemaSummary(repository);
    expect(summary.areas.every((area) => area.status === "no-direct-evidence")).toBe(true);
    expect(summary.areas.every((area) => area.evidence.length === 0)).toBe(true);
  });
});
