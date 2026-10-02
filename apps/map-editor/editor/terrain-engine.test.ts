import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { applyWaterDepthGradient } from "./terrain-engine";

describe("water depth gradient", () => {
  it("collapses leftover shoreline bands to deepwater when a WORLD map has no land", () => {
    const base = createMap("world");
    const ground = base.layers.find(layer => layer.id === "ground")!;
    const mixed = {
      ...base,
      layers: base.layers.map(layer =>
        layer.id === "ground"
          ? {
              ...layer,
              cells: layer.cells.map((cell, index) =>
                index === 0 ? { tileId: "water" } :
                index === 1 ? { tileId: "brackish" } :
                index === 2 ? { tileId: "deepwater2" } :
                cell,
              ),
            }
          : layer,
      ),
    };

    const result = applyWaterDepthGradient(mixed, ground.id);
    const resultGround = result.layers.find(layer => layer.id === "ground")!;

    expect(resultGround.cells.every(cell => cell.tileId === "deepwater")).toBe(true);
  });

  it("rebuilds water bands from the nearest land cell", () => {
    const base = createMap("world");
    const ground = base.layers.find(layer => layer.id === "ground")!;
    const center = Math.floor(base.width / 2) + Math.floor(base.height / 2) * base.width;
    const mixed = {
      ...base,
      layers: base.layers.map(layer =>
        layer.id === "ground"
          ? {
              ...layer,
              cells: layer.cells.map((cell, index) =>
                index === center ? { tileId: "grass" } : { tileId: "deepwater" },
              ),
            }
          : layer,
      ),
    };

    const result = applyWaterDepthGradient(mixed, ground.id);
    const resultGround = result.layers.find(layer => layer.id === "ground")!;
    const x = center % base.width;
    const y = Math.floor(center / base.width);

    expect(resultGround.cells[center].tileId).toBe("grass");
    expect(resultGround.cells[y * base.width + (x + 1)].tileId).toBe("water");
    expect(resultGround.cells[y * base.width + (x + 2)].tileId).toBe("brackish");
    expect(resultGround.cells[y * base.width + (x + 4)].tileId).toBe("deepwater2");
    expect(resultGround.cells[y * base.width + (x + 5)].tileId).toBe("deepwater");
  });
});
