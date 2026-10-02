import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { applyWaterDepthGradient, neighborMask, TERRAIN_MASK_BITS } from "./terrain-engine";

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


describe("terrain edge and neighbor masks", () => {
  it("computes the full 8-neighbor mask for a solid terrain cell", () => {
    let document = {
      ...createMap("world"),
      width: 3,
      height: 3,
      layers: createMap("world").layers.map(layer => ({
        ...layer,
        cells: Array.from({ length: 9 }, () => ({ tileId: "grass" })),
      })),
    };

    expect(neighborMask(document, "ground", { x: 1, y: 1 }, "grass")).toBe(255);
  });

  it("keeps only the occupied cardinal and diagonal neighbors", () => {
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
    ground.cells[8] = { tileId: "grass" };

    expect(neighborMask(document, "ground", { x: 1, y: 1 }, "grass"))
      .toBe(TERRAIN_MASK_BITS.n | TERRAIN_MASK_BITS.e | TERRAIN_MASK_BITS.se);
  });

  it("treats another terrain as an edge instead of part of the same terrain", () => {
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
    ground.cells[1] = { tileId: "water" };

    expect(neighborMask(document, "ground", { x: 1, y: 1 }, "grass"))
      .toBe(255 & ~TERRAIN_MASK_BITS.n);
  });
});
