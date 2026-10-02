import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import {
  terrainPairIsCompatible,
  terrainTransitionIssues,
  validateTerrainCell,
} from "./terrain-validation";

function mapWithCenter(centerTile: string, northTile = "grass") {
  const base = createMap("world");
  return {
    ...base,
    width: 3,
    height: 3,
    layers: base.layers.map(layer =>
      layer.id === "ground"
        ? {
            ...layer,
            cells: Array.from({ length: 9 }, () => ({ tileId: "grass" })).map(
              (cell, index) =>
                index === 4
                  ? { tileId: centerTile }
                  : index === 1
                    ? { tileId: northTile }
                    : cell,
            ),
          }
        : layer,
    ),
  };
}

describe("terrain transition validation", () => {
  it("accepts the verified grass/dirt transition in either cell direction", () => {
    expect(terrainPairIsCompatible("grass", "dirt")).toBe(true);
    expect(terrainPairIsCompatible("dirt", "grass")).toBe(true);
    expect(terrainTransitionIssues(mapWithCenter("dirt"), "ground", { x: 1, y: 1 }, "dirt")).toEqual([]);
  });

  it("accepts authored land directly against the derived water family", () => {
    expect(terrainPairIsCompatible("sand", "water")).toBe(true);
    expect(terrainPairIsCompatible("grass", "deepwater")).toBe(true);
    expect(terrainTransitionIssues(mapWithCenter("sand", "water"), "ground", { x: 1, y: 1 }, "sand")).toEqual([]);
  });

  it("reports an unregistered non-water transition without changing the document", () => {
    const document = mapWithCenter("sand");
    const issues = terrainTransitionIssues(document, "ground", { x: 1, y: 1 }, "sand");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("unregistered-transition");

    const result = validateTerrainCell(document, "ground", { x: 1, y: 1 });
    expect(result.valid).toBe(true);
    expect(result.issues.some(issue => issue.code === "unregistered-transition")).toBe(true);
  });
});
