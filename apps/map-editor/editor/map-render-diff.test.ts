import { describe, expect, it } from "vitest";
import { createStarterMap } from "./map-document";
import { diffMapDocuments } from "./map-render-diff";

describe("map render diff", () => {
  it("detects a changed terrain cell and its terrain neighbors per layer", () => {
    const previous = createStarterMap();
    const next = {
      ...previous,
      layers: previous.layers.map(layer =>
        layer.kind === "ground"
          ? {
              ...layer,
              cells: layer.cells.map((cell, index) =>
                index === 10 * previous.width + 10 ? { tileId: "water-tile" } : cell,
              ),
            }
          : layer,
      ),
    };

    const diff = diffMapDocuments(previous, next);
    expect(diff.dimensionsChanged).toBe(false);
    expect(diff.changedTerrainByLayer).toHaveLength(1);
    expect(diff.changedTerrainByLayer[0]?.layerId).toBe("ground");
    expect(diff.changedTerrainByLayer[0]?.changedCells).toEqual(
      expect.arrayContaining([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 11, y: 10 },
        { x: 10, y: 9 },
        { x: 10, y: 11 },
      ]),
    );
  });

  it("does not merge changes from different terrain layers", () => {
    const previous = createStarterMap();
    const next = {
      ...previous,
      layers: previous.layers.map(layer =>
        layer.kind === "ground"
          ? {
              ...layer,
              cells: layer.cells.map((cell, index) =>
                index === 10 * previous.width + 10 ? { tileId: "water-tile" } : cell,
              ),
            }
          : layer.kind === "collision"
            ? {
                ...layer,
                cells: layer.cells.map((cell, index) =>
                  index === 20 * previous.width + 20 ? { tileId: "blocked" } : cell,
                ),
              }
            : layer,
      ),
    };

    const diff = diffMapDocuments(previous, next);
    expect(diff.changedTerrainByLayer.map(layer => layer.layerId)).toEqual(["ground", "collision"]);
    expect(diff.changedTerrainByLayer.find(layer => layer.layerId === "ground")?.changedCells).toEqual(
      expect.arrayContaining([{ x: 10, y: 10 }]),
    );
    expect(diff.changedTerrainByLayer.find(layer => layer.layerId === "collision")?.changedCells).toEqual(
      expect.arrayContaining([{ x: 20, y: 20 }]),
    );
  });

  it("detects object additions, edits, and removals", () => {
    const previous = createStarterMap();
    const object = {
      id: "building-1",
      kind: "building" as const,
      category: "house",
      x: 2,
      y: 3,
      width: 2,
      height: 2,
      assetId: "asset-1",
      rotation: 0,
      zIndex: 1,
      collision: false,
    };
    const added = {
      ...previous,
      layers: previous.layers.map(layer =>
        layer.kind === "objects" ? { ...layer, objects: [object] } : layer,
      ),
    };
    expect(diffMapDocuments(previous, added).changedObjectIds).toEqual(["building-1"]);

    const moved = {
      ...added,
      layers: added.layers.map(layer =>
        layer.kind === "objects" ? { ...layer, objects: [{ ...object, x: 5 }] } : layer,
      ),
    };
    expect(diffMapDocuments(added, moved).changedObjectIds).toEqual(["building-1"]);
    expect(diffMapDocuments(added, previous).changedObjectIds).toEqual(["building-1"]);
  });

  it("marks dimension changes as requiring a full render", () => {
    const previous = createStarterMap();
    const next = { ...previous, width: 64, height: 64 };
    const diff = diffMapDocuments(previous, next);

    expect(diff.dimensionsChanged).toBe(true);
    expect(diff.changedTerrainByLayer.every(layer => layer.changedCells.length === 64 * 64)).toBe(true);
    expect(diff.objectLayerChanged).toBe(true);
  });
});
