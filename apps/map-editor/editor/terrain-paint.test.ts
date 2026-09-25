import { describe, expect, it } from "vitest";
import { createStarterMap } from "./map-document";
import { eraseTerrainPaint, applyTerrainPaint } from "./terrain-paint";

describe("terrain paint", () => {
  it("paints only valid, unique ground cells", () => {
    const base = createStarterMap();
    const result = applyTerrainPaint(
      base,
      "ground",
      [{ x: 2, y: 2 }, { x: 2, y: 2 }, { x: -1, y: 2 }, { x: 128, y: 2 }],
      "starter-tile",
    );
    const ground = result.document.layers.find(layer => layer.id === "ground")!;
    expect(ground.cells[2 + 2 * ground.width].tileId).toBe("starter-tile");
    expect(result.affected).toContainEqual({ x: 2, y: 2 });
  });

  it("does not mutate the source document", () => {
    const base = createStarterMap();
    const result = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }], "starter-tile").document;
    expect(base).not.toBe(result);
    expect(base.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * base.width].tileId).toBeNull();
  });

  it("ignores locked or invisible ground layers", () => {
    const base = createStarterMap();
    const locked = { ...base, layers: base.layers.map(layer => layer.id === "ground" ? { ...layer, locked: true } : layer) };
    const hidden = { ...base, layers: base.layers.map(layer => layer.id === "ground" ? { ...layer, visible: false } : layer) };
    expect(applyTerrainPaint(locked, "ground", [{ x: 1, y: 1 }], "starter-tile").document).toBe(locked);
    expect(applyTerrainPaint(hidden, "ground", [{ x: 1, y: 1 }], "starter-tile").document).toBe(hidden);
  });

  it("erases a ground cell without mutating the source", () => {
    const base = createStarterMap();
    const painted = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }], "starter-tile").document;
    expect(painted.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * painted.width].tileId).toBe("starter-tile");

    const erased = eraseTerrainPaint(painted, "ground", [{ x: 2, y: 2 }]).document;
    expect(erased).not.toBe(painted);
    expect(erased.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * erased.width].tileId).toBeNull();
    expect(painted.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * painted.width].tileId).toBe("starter-tile");
  });
});
