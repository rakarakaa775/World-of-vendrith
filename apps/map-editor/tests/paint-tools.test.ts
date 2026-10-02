import { describe, expect, it } from "vitest";
import { applyPaint, pointsInLine, pointsForPaintShape, tileIdAtPoint } from "../editor/paint-tools";
import { createMap } from "../editor/map-document";

describe("terrain line tool", () => {
  it("draws a horizontal line including both endpoints", () => {
    expect(pointsInLine({ x: 2, y: 4 }, { x: 6, y: 4 })).toEqual([
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ]);
  });

  it("draws a vertical line including both endpoints", () => {
    expect(pointsInLine({ x: 3, y: 1 }, { x: 3, y: 5 })).toEqual([
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
    ]);
  });

  it("draws a diagonal line without gaps", () => {
    expect(pointsInLine({ x: 0, y: 0 }, { x: 4, y: 3 })).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
    ]);
  });

  it("supports reverse direction deterministically", () => {
    expect(pointsInLine({ x: 6, y: 4 }, { x: 2, y: 4 })).toEqual([
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ]);
  });

  it("routes the line shape through the shared paint-shape API", () => {
    const document = createMap("world");
    expect(pointsForPaintShape(document, "ground", "line", { x: 1, y: 2 }, { x: 4, y: 2 })).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it("builds a rectangle from the two opposite corners", () => {
    const document = createMap("world");
    expect(pointsForPaintShape(document, "ground", "rectangle", { x: 2, y: 1 }, { x: 4, y: 3 })).toEqual([
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ]);
  });

  it("builds a rectangle deterministically when dragged in reverse", () => {
    const document = createMap("world");
    expect(pointsForPaintShape(document, "ground", "rectangle", { x: 4, y: 3 }, { x: 2, y: 1 })).toEqual([
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ]);
  });


  it("returns the terrain tile at a valid point and null outside the grid", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: "grass" }));
    cells[1 + document.width * 2] = { tileId: "dirt" };
    const withTerrain = { ...document, layers: document.layers.map(layer => layer.id === "ground" ? { ...layer, cells } : layer) };

    expect(tileIdAtPoint(withTerrain, "ground", { x: 1, y: 2 })).toBe("dirt");
    expect(tileIdAtPoint(withTerrain, "ground", { x: -1, y: 2 })).toBeNull();
    expect(tileIdAtPoint(withTerrain, "ground", { x: document.width, y: 2 })).toBeNull();
  });

  it("erases selected cells by applying a null tile id", () => {
    const document = createMap("world");
    const painted = applyPaint(document, "ground", [{ x: 2, y: 2 }, { x: 3, y: 2 }], "dirt");
    const erased = applyPaint(painted, "ground", [{ x: 2, y: 2 }, { x: 3, y: 2 }], null);

    expect(tileIdAtPoint(painted, "ground", { x: 2, y: 2 })).toBe("dirt");
    expect(tileIdAtPoint(erased, "ground", { x: 2, y: 2 })).toBeNull();
    expect(tileIdAtPoint(erased, "ground", { x: 3, y: 2 })).toBeNull();
  });
  it("flood-fills only the contiguous matching terrain", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: "grass" }));
    for (let y = 0; y < document.height; y += 1) {
      cells[2 + y * document.width] = { tileId: "dirt" };
    }
    const withBarrier = {
      ...document,
      layers: document.layers.map(layer => layer.id === "ground" ? { ...layer, cells } : layer),
    };

    const filled = pointsForPaintShape(withBarrier, "ground", "flood", { x: 0, y: 0 });
    expect(filled).not.toContainEqual({ x: 3, y: 1 });
    expect(filled).toContainEqual({ x: 0, y: 0 });
    expect(filled).toHaveLength(document.height * 2);
  });
});
