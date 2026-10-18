import { describe, expect, it } from "vitest";
import { STARTER_TILES, isPaintableTerrainTile } from "./tile-palette";

describe("terrain palette paintability", () => {
  it("provides bundled local previews for the core terrain sheets", () => {
    const byId = new Map(STARTER_TILES.map(tile => [tile.id, tile]));
    for (const terrain of ["grass", "sand", "dirt", "water", "deepwater", "deepwater2", "brackish"]) {
      const tile = byId.get(terrain as never);
      expect(tile?.previewUrl).toBe(`/assets/terrain/${tile?.assetName}`);
    }
  });

  it("keeps derived water surfaces out of direct painting", () => {
    const derivedWater = ["water", "brackish", "deepwater2", "deepwater"];

    for (const terrain of derivedWater) {
      expect(isPaintableTerrainTile({ terrain: terrain as never })).toBe(false);
    }
  });

  it("allows direct painting of the remaining starter terrain types", () => {
    const paintable = STARTER_TILES.filter(isPaintableTerrainTile);

    expect(paintable.map((tile) => tile.terrain)).toEqual([
      "grass", "grassalt", "sand", "redsand", "dirt", "dirt2", "pavement",
      "tallgrass", "hole", "holek", "holemid", "lava", "lavarock",
    ]);
  });

  it("keeps the predicate stable for future tile options", () => {
    expect(isPaintableTerrainTile({ terrain: "sand" })).toBe(true);
    expect(isPaintableTerrainTile({ terrain: "water" })).toBe(false);
  });
});
