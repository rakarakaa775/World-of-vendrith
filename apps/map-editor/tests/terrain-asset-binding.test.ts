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

  it("rejects a row whose asset is not approved, verified, or active", () => {
    const result = loadTerrainAssetBindings([
      { ...baseRow, asset_status: "pending" },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toBe(1);
  });
});
