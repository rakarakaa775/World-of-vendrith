import { describe, expect, it } from "vitest";
import { terrainVariationIndex } from "./terrain-variation";

describe("terrain variation", () => {
  it("is deterministic for the same world, cell, and terrain", () => {
    expect(terrainVariationIndex("world-a", 12, 7, "grass", 3))
      .toBe(terrainVariationIndex("world-a", 12, 7, "grass", 3));
  });

  it("stays inside the requested variant range", () => {
    const value = terrainVariationIndex("world-a", 12, 7, "grass", 3);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(3);
  });
});
