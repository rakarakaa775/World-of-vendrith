import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { terrainFromTileId, waterDepthBand } from "../editor/terrain-engine";

describe("water depth debug bands", () => {
  it("maps derived water terrain families to stable depth bands", () => {
    expect(waterDepthBand(terrainFromTileId("water"))).toBe(1);
    expect(waterDepthBand(terrainFromTileId("brackish"))).toBe(2);
    expect(waterDepthBand(terrainFromTileId("deepwater2"))).toBe(3);
    expect(waterDepthBand(terrainFromTileId("deepwater"))).toBe(4);
    expect(waterDepthBand(terrainFromTileId("grass"))).toBeNull();
  });

  it("derives the view value without mutating the map document", () => {
    const document = createMap("world");
    const before = JSON.stringify(document);
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const tileId = ground.cells[0]?.tileId ?? null;

    waterDepthBand(terrainFromTileId(tileId));

    expect(JSON.stringify(document)).toBe(before);
  });
});

