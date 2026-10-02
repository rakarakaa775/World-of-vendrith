import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { getTerrainAssetBinding, createTerrainAssetBindingMap } from "./terrain-asset-binding";
import { resolveTerrainRenderCell } from "./terrain-resolver";

const binding = (terrain: "grass" | "water", mask: number, assetId: string) => ({
  terrain,
  mask,
  assetId,
  sourceRuleKey: null,
  region: null,
});

describe("terrain asset binding lookup", () => {
  const bindings = createTerrainAssetBindingMap([
    binding("grass", 255, "grass-base"),
    binding("grass", 3, "grass-mask-3"),
  ]);

  it("prefers an exact verified mask", () => {
    expect(getTerrainAssetBinding(bindings, "grass", 3)?.assetId).toBe("grass-mask-3");
  });

  it("falls back to the verified base mask when the exact mask is absent", () => {
    expect(getTerrainAssetBinding(bindings, "grass", 17)?.assetId).toBe("grass-base");
  });

  it("returns null when neither exact nor base mask is bound", () => {
    expect(getTerrainAssetBinding(createTerrainAssetBindingMap([
      binding("grass", 3, "grass-mask-3"),
    ]), "grass", 17)).toBeNull();
  });

  it("returns null when the terrain has no bindings", () => {
    expect(getTerrainAssetBinding(bindings, "water", 17)).toBeNull();
  });
});

describe("terrain render resolution", () => {
  it("uses the semantic neighbor mask for normal terrain", () => {
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
    const map = createTerrainAssetBindingMap([
      binding("grass", 255, "grass-base"),
      binding("grass", 3, "grass-mask-3"),
    ]);

    const resolved = resolveTerrainRenderCell(document, "ground", { x: 1, y: 1 }, map);
    expect(resolved?.mask).toBe(3);
    expect(resolved?.assetId).toBe("grass-mask-3");
  });

  it("uses an exact approved shoreline binding when available", () => {
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
    ground.cells[5] = { tileId: "water" };
    const map = createTerrainAssetBindingMap([
      binding("grass", 255, "grass-base"),
      binding("grass", 2, "grass-shore-2"),
    ]);

    const resolved = resolveTerrainRenderCell(document, "ground", { x: 1, y: 1 }, map);
    expect(resolved?.shorelineMask).toBe(2);
    expect(resolved?.mask).toBe(2);
    expect(resolved?.assetId).toBe("grass-shore-2");
  });

  it("forces the verified base mask for land touching water", () => {
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
    ground.cells[5] = { tileId: "water" };
    const map = createTerrainAssetBindingMap([
      binding("grass", 255, "grass-base"),
      binding("grass", 3, "grass-mask-3"),
    ]);

    const resolved = resolveTerrainRenderCell(document, "ground", { x: 1, y: 1 }, map);
    expect(resolved?.mask).toBe(255);
    expect(resolved?.assetId).toBe("grass-base");
    expect(resolved?.shorelineMask).toBe(2);
  });

  it("keeps deepwater on its canonical render mask", () => {
    const base = createMap("world");
    const resolved = resolveTerrainRenderCell(base, "ground", { x: 0, y: 0 }, createTerrainAssetBindingMap([]));
    expect(resolved?.terrain).toBe("deepwater");
    expect(resolved?.mask).toBe(255);
    expect(resolved?.shorelineMask).toBeNull();
  });
});
