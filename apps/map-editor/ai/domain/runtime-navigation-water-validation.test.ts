import { describe, expect, it } from "vitest";
import { validateNavigationWaterCells } from "./runtime-navigation";

describe("validateNavigationWaterCells", () => {
  it("accepts explicit in-bounds semantic records without changing their meaning", () => {
    const result = validateNavigationWaterCells(4, 3, [{
      x: 1, y: 2, surface: "water", feature: "shoreline",
      depth: "shallow", shallowWalkable: true,
    }]);
    expect(result).toEqual({
      valid: true,
      cells: [{
        x: 1, y: 2, surface: "water", feature: "shoreline",
        depth: "shallow", shallowWalkable: true,
      }],
    });
  });

  it("rejects non-array payloads and invalid map dimensions", () => {
    expect(validateNavigationWaterCells(0, 3, []).valid).toBe(false);
    expect(validateNavigationWaterCells(3, 3, null)).toEqual({
      valid: false, errors: ["Water cells must be an array."],
    });
  });

  it("rejects cells outside map bounds and non-integer coordinates", () => {
    const result = validateNavigationWaterCells(3, 3, [
      { x: 3, y: 0, surface: "water", feature: "river" },
      { x: 1.5, y: 1, surface: "water", feature: "river" },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("Water cell 0 is outside map bounds.");
      expect(result.errors).toContain("Water cell 1 coordinates must be integers.");
    }
  });

  it("rejects duplicate coordinates rather than choosing an arbitrary record", () => {
    const result = validateNavigationWaterCells(3, 3, [
      { x: 1, y: 1, surface: "water", feature: "river" },
      { x: 1, y: 1, surface: "water", feature: "lake" },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain("Duplicate water cell coordinate 1:1.");
  });

  it("rejects invalid enum values and non-boolean traversal flags", () => {
    const result = validateNavigationWaterCells(3, 3, [{
      x: 0, y: 0, surface: "water", feature: "deepwater",
      depth: "abyss", current: "dangerous", bridge: "yes",
    }]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("Water cell 0 has invalid feature.");
      expect(result.errors).toContain("Water cell 0 has invalid depth.");
      expect(result.errors).toContain("Water cell 0 has invalid current.");
      expect(result.errors).toContain("Water cell 0 field bridge must be boolean.");
    }
  });

  it("rejects malformed entries without silently dropping them", () => {
    const result = validateNavigationWaterCells(2, 2, [null, { x: 0, y: 0, surface: "mud" }]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("Water cell 0 must be an object.");
      expect(result.errors).toContain("Water cell 1 has invalid surface.");
    }
  });
});
