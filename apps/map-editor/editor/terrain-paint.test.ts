import { describe, expect, it } from "vitest";
import { createStarterMap } from "./map-document";
import { eraseTerrainPaint, applyTerrainPaint } from "./terrain-paint";
import { pointsInFloodFill, pointsInLine, pointsInRectangle } from "./paint-tools";

describe("terrain erase", () => {
  it("clears a ground cell as a new document", () => {
    const base = createStarterMap();
    const painted = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }], "starter-tile").document;
    expect(painted.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * painted.width].tileId).toBe("starter-tile");

    const erased = eraseTerrainPaint(painted, "ground", [{ x: 2, y: 2 }]).document;
    expect(erased).not.toBe(painted);
    expect(erased.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * erased.width].tileId).toBeNull();
  });
});

describe("terrain tool geometry", () => {
  it("generates a deterministic line", () => {
    expect(pointsInLine({ x: 1, y: 1 }, { x: 4, y: 2 })).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it("generates a filled rectangle in inclusive bounds", () => {
    const points = pointsInRectangle({ x: 2, y: 3 }, { x: 4, y: 5 });
    expect(points).toHaveLength(9);
    expect(new Set(points.map(point => `${point.x}:${point.y}`)).size).toBe(9);
    expect(points).toContainEqual({ x: 2, y: 3 });
    expect(points).toContainEqual({ x: 4, y: 5 });
  });

  it("flood-fills only the connected matching terrain region", () => {
    const base = createStarterMap();
    const first = applyTerrainPaint(base, "ground", [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ], "starter-tile").document;
    const second = applyTerrainPaint(first, "ground", [{ x: 3, y: 1 }], "water-tile").document;
    const points = pointsInFloodFill(second, "ground", { x: 1, y: 1 });

    expect(points).toHaveLength(3);
    expect(new Set(points.map(point => `${point.x}:${point.y}`))).toEqual(
      new Set(["1:1", "2:1", "1:2"]),
    );
    expect(points).not.toContainEqual({ x: 3, y: 1 });
  });
});
