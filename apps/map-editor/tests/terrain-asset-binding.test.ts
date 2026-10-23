import { describe, expect, it } from "vitest";
import { loadTerrainAssetBindings } from "../editor/terrain-asset-binding-loader";
import { terrainAssetIdForMask } from "../editor/terrain-asset-binding";

describe("Terrain asset approval contract", () => {
  const baseRow = {
    terrain_key: "grass",
    neighbor_mask: 255,
    asset_id: "asset-grass-base",
    candidate_status: "approved",
    asset_status: "approved",
    autotile_capable: false,
    license_registry_id: "license-1",
    tile_region: { x: 0, y: 0, width: 16, height: 16 },
  };

  it("accepts a fully approved base terrain", () => {
    const result = loadTerrainAssetBindings([baseRow]);
    expect(result.accepted).toHaveLength(1);
    expect(terrainAssetIdForMask(result.bindings, "grass", 255)).toBe("asset-grass-base");
  });

  it("accepts a fully approved autotile binding", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, neighbor_mask: 0, autotile_capable: true },
    ]);
    expect(result.accepted).toHaveLength(1);
    expect(terrainAssetIdForMask(result.bindings, "grass", 0)).toBe("asset-grass-base");
  });

  it("rejects an autotile row without an approved candidate", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, neighbor_mask: 0, candidate_status: "needs_review", autotile_capable: true },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });

  it("rejects a base terrain without an approved candidate", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, candidate_status: "needs_review" },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });

  it("rejects a row whose asset is not approved", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, asset_status: "pending" },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });

  it("rejects an approved binding without a concrete sprite region", () => {
    const result = loadTerrainAssetBindings([{ ...baseRow, tile_region: null }]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });

  it("rejects a malformed sprite region", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, tile_region: { x: -1, y: 0, width: 16, height: 16 } },
      { ...baseRow, tile_region: { x: 0, y: 0, width: 0, height: 16 } },
      { ...baseRow, tile_region: { x: 0, y: 0, width: 16.5, height: 16 } },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(3);
  });

  it("rejects legacy verified and active asset statuses", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, asset_status: "verified" },
      { ...baseRow, asset_status: "active" },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(2);
  });
});
