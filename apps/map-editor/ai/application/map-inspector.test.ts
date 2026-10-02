import { describe, expect, it } from "vitest";
import { inspectMap } from "./map-inspector";
import type { MapInspectorPort } from "../ports/map-tools";
import type { AssetRegistryPort } from "../ports/project-tools";

const mapPort = (document: any): MapInspectorPort => ({
  async resolveMap(mapId) {
    if (mapId !== document?.id) return null;
    return { document, version: 7, source: "test:authoritative-map" };
  },
});

const registry = (results: Record<string, any[]>): AssetRegistryPort => ({
  async search(query) { return results[query] ?? []; },
});

const document = {
  id: "world-1", name: "World", mapType: "world", parentMapId: null,
  width: 4, height: 2, tileSize: 32,
  layers: [
    { id: "ground", name: "Ground", kind: "ground", visible: true, cells: [
      { tileId: "water" }, { tileId: "deepwater" }, { tileId: "brackish" }, { tileId: null },
      { tileId: "deepwater2" }, { tileId: "grass" }, { tileId: "sand" }, { tileId: "dirt" },
    ], objects: [] },
    { id: "objects", name: "Objects", kind: "objects", visible: true, cells: [], objects: [
      { id: "o1", kind: "poi", category: "dock", x: 1, y: 1, assetId: "asset-dock", childMapId: "region-1" },
    ] },
  ],
};

describe("inspectMap", () => {
  it("returns authoritative identity, terrain bands, objects and links", async () => {
    const result = await inspectMap("world-1", {
      map: mapPort(document),
      assetRegistry: registry({ "asset-dock": [] }),
    });

    expect(result.found).toBe(true);
    expect(result.identity?.mapType).toBe("world");
    expect(result.identity?.version).toBe(7);
    expect(result.terrain).toEqual(expect.arrayContaining([
      { tileId: "water", count: 1 },
      { tileId: "deepwater", count: 1 },
      { tileId: "brackish", count: 1 },
      { tileId: "deepwater2", count: 1 },
    ]));
    expect(result.objects?.[0].linkedMapIds).toEqual(["region-1"]);
    expect(result.warnings).toContain("No verified asset registry evidence found for asset asset-dock.");
  });

  it("fails closed when the map is not authoritative", async () => {
    const result = await inspectMap("missing-map", {
      map: mapPort(document),
      assetRegistry: registry({}),
    });
    expect(result.found).toBe(false);
    expect(result.identity).toBeUndefined();
    expect(result.objects).toBeUndefined();
  });

  it("does not invent license evidence for an unverified asset", async () => {
    const result = await inspectMap("world-1", {
      map: mapPort(document),
      assetRegistry: registry({}),
    });
    expect(result.assets).toEqual([]);
    expect(result.evidence.some((item) => item.source.includes("asset"))).toBe(false);
  });
});
