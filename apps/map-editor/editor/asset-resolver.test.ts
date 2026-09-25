import { describe, expect, it } from "vitest";
import { assetStorageUrl, isRuntimeAssetUsable, resolveAssetUrl } from "./asset-resolver";

describe("asset resolver", () => {
  it("resolves Asset Library registry paths to the audited source repository", () => {
    expect(assetStorageUrl("ASSET_LIBRARY/02_TILES_AND_TERRAIN/TilesDungeon/Tile.png"))
      .toBe("https://media.githubusercontent.com/media/rakarakaa775/Asset-library-LPC/main/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TilesDungeon/Tile.png");
  });

  it("passes through audited external image URLs", () => {
    expect(assetStorageUrl("https://opengameart.org/sites/default/files/cottage.png"))
      .toBe("https://opengameart.org/sites/default/files/cottage.png");
  });

  it("keeps approved asset resolution fail-closed for pending registry status", () => {
    expect(resolveAssetUrl({
      id: "asset-1",
      asset_path: "ASSET_LIBRARY/example.png",
      status: "pending",
      license: { verification_status: "verified", usage_status: "allowed", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true },
    })).toBeNull();
  });

  it("rejects conditional or missing license metadata even when registry status is approved", () => {
    expect(isRuntimeAssetUsable({ id: "asset-2", asset_path: "tree.png", status: "approved", license: { verification_status: "verified", usage_status: "conditional", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true } })).toBe(false);
    expect(resolveAssetUrl({ id: "asset-3", asset_path: "tree.png", status: "approved" })).toBeNull();
  });

  it("accepts verified free-use or credit-required licenses", () => {
    expect(isRuntimeAssetUsable({ id: "asset-4", asset_path: "tree.png", status: "approved", license: { verification_status: "verified", usage_status: "allowed", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true } })).toBe(true);
    expect(isRuntimeAssetUsable({ id: "asset-5", asset_path: "tree.png", status: "approved", license: { verification_status: "verified", usage_status: "credit_required", commercial_use_allowed: true, modification_allowed: true, redistribution_allowed: true } })).toBe(true);
  });

  it("keeps bundled terrain fallbacks local", () => {
    expect(assetStorageUrl("local/tile_water.png")).toBe("/assets/terrain/tile_water.png");
  });
});
