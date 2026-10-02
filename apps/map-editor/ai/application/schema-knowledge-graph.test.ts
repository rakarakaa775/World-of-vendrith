import { describe, expect, it, vi } from "vitest";
import { buildProjectSchemaKnowledgeGraph } from "./schema-knowledge-graph";

describe("schema knowledge graph", () => {
  it("builds verified map hierarchy and map-content edges", async () => {
    const repository = {
      readFile: vi.fn(async () => null),
      search: vi.fn(async () => []),
    };

    const graph = await buildProjectSchemaKnowledgeGraph(repository);
    expect(graph.edges.map((edge) => [edge.from, edge.relation, edge.to])).toEqual([
      ["world", "contains", "region"],
      ["region", "contains", "playable-exterior"],
      ["playable-exterior", "owns", "playable-interior"],
      ["map", "contains", "map-layer"],
      ["map-layer", "stores", "terrain-cell"],
      ["map-layer", "stores", "map-object"],
      ["map-object", "references", "asset"],
    ]);
    expect(graph.edges.every((edge) => edge.evidence.every((item) => item.confidence === "high"))).toBe(true);
  });

  it("keeps unsupported NPC, dialogue, and event relations out of the graph", async () => {
    const repository = {
      readFile: vi.fn(async () => null),
      search: vi.fn(async () => []),
    };

    const graph = await buildProjectSchemaKnowledgeGraph(repository);
    expect(graph.nodes.filter((node) => ["npc", "dialogue", "event"].includes(node.id))).toHaveLength(3);
    expect(graph.edges.some((edge) => ["npc", "dialogue", "event"].includes(edge.from) || ["npc", "dialogue", "event"].includes(edge.to))).toBe(false);
  });

  it("records the asset provenance contract as graph evidence", async () => {
    const repository = {
      readFile: vi.fn(async () => null),
      search: vi.fn(async () => []),
    };

    const graph = await buildProjectSchemaKnowledgeGraph(repository);
    const asset = graph.nodes.find((node) => node.id === "asset");
    expect(asset?.evidence.some((item) => item.fact.includes("license registry"))).toBe(true);
  });
});
