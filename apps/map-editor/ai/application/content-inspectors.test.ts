import { describe, expect, it } from "vitest";
import { inspectAsset, inspectRegion, inspectWorld, traceContentHierarchy } from "./content-inspectors";

const world = (type: "world" | "region", id: string, parentMapId: string | null = null) => ({
  document: {
    id, name: id, mapType: type, parentMapId, width: 2, height: 2, tileSize: 32,
    layers: [{ id: "ground", name: "Ground", kind: "ground" as const, visible: true, cells: [{ tileId: "grass" }], objects: [{ id: "link", kind: "poi" as const, category: "region", x: 0, y: 0, width: 1, height: 1, assetId: "asset-1", childMapId: "child-1" }] }],
  }, version: 3, source: "test:authoritative",
});

describe("content inspectors", () => {
  it("inspects only an authoritative World", async () => {
    const deps: any = { map: { resolveMap: async (id: string) => id === "world-1" ? world("world", "world-1") : null }, assetRegistry: { search: async () => [] } };
    const result = await inspectWorld("world-1", deps);
    expect(result.found).toBe(true);
    expect(result.type).toBe("world");
    expect(result.hierarchy?.childMapIds).toEqual(["child-1"]);
  });

  it("rejects a Region passed to world.inspect", async () => {
    const deps: any = { map: { resolveMap: async () => world("region", "region-1") }, assetRegistry: { search: async () => [] } };
    const result = await inspectWorld("region-1", deps);
    expect(result.found).toBe(false);
    expect(result.warnings[0]).toContain("not world");
  });

  it("inspects a Region and keeps asset provenance evidence", async () => {
    const evidence = { id: "asset-1", kind: "verified-fact", source: "asset_registry:asset-1", fact: JSON.stringify({ id: "asset-1", category: "bridge", licenseVerificationStatus: "verified", licenseUsageStatus: "allowed", commercialUseAllowed: true }), confidence: "high" };
    const deps: any = { map: { resolveMap: async () => world("region", "region-1", "world-1") }, assetRegistry: { search: async () => [evidence] } };
    const result = await inspectRegion("region-1", deps);
    expect(result.found).toBe(true);
    expect(result.assets?.[0].usageDomain).toBe("region");
    expect(result.assets?.[0].licenseState).toBe("clear");
  });

  it("fails closed for an unverified Asset", async () => {
    const result = await inspectAsset("missing-asset", { map: {} as any, assetRegistry: { search: async () => [] } });
    expect(result.found).toBe(false);
    expect(result.evidence).toEqual([]);
    expect(result.warnings[0]).toContain("No verified asset registry evidence");
  });
});

describe("traceContentHierarchy", () => {
  it("follows authoritative parent and linked child maps with a bounded traversal", async () => {
    const worldDoc = world("world", "world-1");
    worldDoc.document.layers[0].objects[0].childMapId = "region-1";
    const regionDoc = world("region", "region-1", "world-1");
    regionDoc.document.layers[0].objects[0].childMapId = "playable-1";
    const playableDoc = world("region", "playable-1", "region-1");
    playableDoc.document.mapType = "playable";
    const docs: Record<string, any> = { "world-1": worldDoc, "region-1": regionDoc, "playable-1": playableDoc };
    const result = await traceContentHierarchy("world-1", { map: { resolveMap: async (id: string) => docs[id] ?? null }, assetRegistry: { search: async () => [] } }, 3);
    expect(result.found).toBe(true);
    expect(result.nodes.map((node) => node.id)).toEqual(["world-1", "region-1", "playable-1"]);
    expect(result.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "world-1", relation: "links", to: "region-1" }),
      expect.objectContaining({ from: "world-1", relation: "contains", to: "region-1" }),
      expect.objectContaining({ from: "region-1", relation: "contains", to: "playable-1" }),
    ]));
  });

  it("fails closed and warns when a linked map has no authoritative snapshot", async () => {
    const result = await traceContentHierarchy("world-1", { map: { resolveMap: async (id: string) => id === "world-1" ? world("world", "world-1") : null }, assetRegistry: { search: async () => [] } });
    expect(result.found).toBe(true);
    expect(result.warnings).toContain("Linked map child-1 has no authoritative snapshot.");
  });
});
