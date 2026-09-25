import { describe, expect, it } from "vitest";
import { assetStorageUrl, resolveAssetUrl } from "./asset-resolver";

describe("asset resolver", () => {
  it("resolves Asset Library registry paths to the audited source repository", () => {
    expect(assetStorageUrl("ASSET_LIBRARY/02_TILES_AND_TERRAIN/TilesDungeon/Tile.png"))
      .toBe("https://media.githubusercontent.com/media/rakarakaa775/Asset-library-LPC/main/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TilesDungeon/Tile.png");
  });

  it("keeps approved asset resolution fail-closed for pending registry status", () => {
    expect(resolveAssetUrl({
      id: "asset-1",
      asset_path: "ASSET_LIBRARY/example.png",
      status: "pending",
    })).toBeNull();
  });

  it("keeps bundled terrain fallbacks local", () => {
    expect(assetStorageUrl("local/tile_water.png")).toBe("/assets/terrain/tile_water.png");
  });
});
