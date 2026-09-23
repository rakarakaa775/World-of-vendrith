import { describe, expect, it } from "vitest";
import { createStarterMap } from "./map-document";
import { eraseTerrainPaint, applyTerrainPaint } from "./terrain-paint";

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
