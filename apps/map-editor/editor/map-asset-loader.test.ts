import { describe, expect, it } from "vitest";
import { registryRowToMapAsset, mapAssetCatalogSummary } from "./map-asset-loader";

describe("map asset loader", () => {
  it("maps approved terrain into World and Region macro terrain", () => {
    const asset = registryRowToMapAsset({
      id: "11111111-1111-4111-8111-111111111111",
      name: "LPC Overworld — Mountains",
      category: "terrain",
      role: "mountain",
      asset_path: "02_TILES_AND_TERRAIN/LPC_Overworld__Mountains.png",
      preview_path: null,
      status: "approved",
      asset_license_registry: { verification_status: "verified", usage_status: "credit_required", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true },
    });
    expect(asset).toMatchObject({
      family: "macro-terrain",
      levels: ["world", "region"],
      registryId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("maps exterior buildings to Playable and dungeon structure to Interior", () => {
    const building = registryRowToMapAsset({
      id: "22222222-2222-4222-8222-222222222222",
      name: "Building",
      category: "exterior.building",
      role: "building",
      asset_path: "building.png",
      preview_path: null,
      status: "approved",
    });
    const floor = registryRowToMapAsset({
      id: "33333333-3333-4333-8333-333333333333",
      name: "Floor",
      category: "dungeon.structure",
      role: "floor",
      asset_path: "floor.png",
      preview_path: null,
      status: "approved",
    });
    expect(building?.family).toBe("playable-building");
    expect(building?.levels).toEqual(["playable"]);
    expect(floor?.family).toBe("interior-floor");
    expect(floor?.levels).toEqual(["interior"]);
  });

  it("fails closed when an approved registry row has no physical path", () => {
    expect(registryRowToMapAsset({
      id: "99999999-9999-4999-8999-999999999999",
      name: "Unextracted decoration pack",
      category: "exterior.decoration",
      role: "decoration",
      asset_path: null,
      preview_path: null,
      status: "approved",
    })).toBeNull();
  });

  it("fails closed for non-approved or semantically unknown registry rows", () => {
    expect(registryRowToMapAsset({
      id: "44444444-4444-4444-8444-444444444444",
      name: "Pending Tree",
      category: "decoration",
      role: "tree",
      asset_path: "tree.png",
      preview_path: null,
      status: "pending",
    })).toBeNull();
    expect(registryRowToMapAsset({
      id: "55555555-5555-4555-8555-555555555555",
      name: "Reference",
      category: "reference",
      role: "reference_scene",
      asset_path: "scene.png",
      preview_path: null,
      status: "approved",
    })).toBeNull();
  });

  it("rejects approved rows whose license has unresolved requirements", () => {
    expect(registryRowToMapAsset({
      id: "88888888-8888-4888-8888-888888888888",
      name: "Conditional Asset",
      category: "decoration",
      role: "tree",
      asset_path: "tree.png",
      preview_path: null,
      status: "approved",
      asset_license_registry: { verification_status: "verified", usage_status: "conditional", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true },
    })).toBeNull();
  });

  it("summarizes runtime physical assets by map level", () => {
    const catalog = [
      registryRowToMapAsset({
        id: "66666666-6666-4666-8666-666666666666",
        name: "Grass",
        category: "terrain",
        role: "base terrain",
        asset_path: "grass.png",
        preview_path: null,
        status: "approved",
      }),
      registryRowToMapAsset({
        id: "77777777-7777-4777-8777-777777777777",
        name: "Floor",
        category: "dungeon.structure",
        role: "floor",
        asset_path: "floor.png",
        preview_path: null,
        status: "approved",
      }),
    ].filter(Boolean);
    expect(mapAssetCatalogSummary(catalog)).toMatchObject({
      physical: 2,
      world: 1,
      region: 1,
      interior: 1,
    });
  });
});
