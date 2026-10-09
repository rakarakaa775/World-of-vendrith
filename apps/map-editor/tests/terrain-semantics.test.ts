import { describe, expect, it } from "vitest";
import {
  TERRAIN_SEMANTICS_SCHEMA, TERRAIN_SEMANTICS_VERSION,
  resizeTerrainSemantics, validateTerrainSemantics,
} from "../editor/terrain-semantics";

const section = (cells: unknown[]) => ({
  schema: TERRAIN_SEMANTICS_SCHEMA, version: TERRAIN_SEMANTICS_VERSION, cells,
});

describe("canonical terrain semantics validator", () => {
  it("accepts valid authored semantics", () => {
    expect(validateTerrainSemantics(8, 8, section([
      { x: 2, y: 3, surface: "water", feature: "shoreline", depth: "shallow", shallowWalkable: true },
    ]))).toEqual(section([
      { x: 2, y: 3, surface: "water", feature: "shoreline", depth: "shallow", shallowWalkable: true },
    ]));
  });

  it("rejects incorrect schema, version, enum values, flags and unknown fields", () => {
    expect(() => validateTerrainSemantics(8, 8, { ...section([]), schema: "other" })).toThrow("Unsupported terrain semantics schema");
    expect(() => validateTerrainSemantics(8, 8, { ...section([]), version: 2 })).toThrow("Unsupported terrain semantics version");
    expect(() => validateTerrainSemantics(8, 8, section([{ x: 0, y: 0, surface: "water", depth: "bottomless" }]))).toThrow("invalid depth");
    expect(() => validateTerrainSemantics(8, 8, section([{ x: 0, y: 0, surface: "water", bridge: "yes" }]))).toThrow("invalid bridge");
    expect(() => validateTerrainSemantics(8, 8, section([{ x: 0, y: 0, surface: "water", unexpected: true }]))).toThrow("unknown fields");
  });

  it("rejects duplicate and out-of-bounds coordinates", () => {
    expect(() => validateTerrainSemantics(4, 4, section([
      { x: 1, y: 1, surface: "land" }, { x: 1, y: 1, surface: "water" },
    ]))).toThrow("Duplicate terrain semantic coordinate");
    expect(() => validateTerrainSemantics(4, 4, section([{ x: 4, y: 0, surface: "land" }]))).toThrow("outside map bounds");
    expect(() => validateTerrainSemantics(4, 4, section([{ x: 0.5, y: 0, surface: "land" }]))).toThrow("coordinates must be integers");
  });

  it("preserves in-bounds records on resize and does not fabricate new ones", () => {
    const valid = validateTerrainSemantics(4, 4, section([
      { x: 0, y: 0, surface: "land" }, { x: 3, y: 3, surface: "water", feature: "lake" },
    ]));
    expect(resizeTerrainSemantics(valid, 2, 2).cells).toEqual([{ x: 0, y: 0, surface: "land" }]);
    expect(resizeTerrainSemantics(valid, 8, 8).cells).toHaveLength(2);
  });

  it("rejects invalid dimensions", () => {
    expect(() => validateTerrainSemantics(0, 4, section([]))).toThrow("Map width must be a positive integer");
    const valid = validateTerrainSemantics(2, 2, section([]));
    expect(() => resizeTerrainSemantics(valid, 4, -1)).toThrow("Map height must be a positive integer");
  });
});
