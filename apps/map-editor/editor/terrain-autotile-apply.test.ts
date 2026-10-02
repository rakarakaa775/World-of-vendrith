import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { createTerrainAssetBindingMap } from "./terrain-asset-binding";
import { applyTerrainAutotile } from "./terrain-autotile-apply";

const binding = (terrain: "grass", mask: number, assetId: string) => ({
  terrain,
  mask,
  assetId,
  sourceRuleKey: null,
  region: null,
});

describe("terrain autotile render variants", () => {
  it("re-evaluates the edited cell perimeter without mutating MapDocument render state", () => {
    const base = createMap("world");
    const document = {
      ...base,
      width: 3,
      height: 3,
      layers: base.layers.map(layer => ({
        ...layer,
        cells: Array.from({ length: 9 }, () => ({ tileId: "deepwater" })),
      })),
    };
    const ground = document.layers.find(layer => layer.id === "ground")!;
    ground.cells[4] = { tileId: "grass" };
    ground.cells[1] = { tileId: "grass" };
    ground.cells[5] = { tileId: "grass" };

    const result = applyTerrainAutotile(
      document,
      "ground",
      [{ x: 1, y: 1 }],
      createTerrainAssetBindingMap([
        binding("grass", 3, "grass-mask-3"),
        binding("grass", 255, "grass-base"),
      ]),
    );

    expect(result.document).toBe(document);
    expect(result.variants).toHaveLength(9);
    expect(result.variants.find(v => v.point.x === 1 && v.point.y === 1)).toMatchObject({
      terrain: "grass",
      mask: 255,
      assetId: "grass-base",
    });
  });
  it("propagates the derived dual-grid corner mask without persisting it", () => {
    const base = createMap("world");
    const document = {
      ...base,
      width: 3,
      height: 3,
      layers: base.layers.map(layer => ({
        ...layer,
        cells: Array.from({ length: 9 }, () => ({ tileId: "grass" })),
      })),
    };
    const ground = document.layers.find(layer => layer.id === "ground")!;
    ground.cells[0] = { tileId: "water" };
    const before = JSON.stringify(document);

    const result = applyTerrainAutotile(document, "ground", [{ x: 1, y: 1 }]);

    expect(result.document).toBe(document);
    expect(result.variants.find(v => v.point.x === 1 && v.point.y === 1)?.cornerMask).toBe(14);
    expect(JSON.stringify(document)).toBe(before);
  });

});
