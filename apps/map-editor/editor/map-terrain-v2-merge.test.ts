import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import type { MapDocumentV2State } from "./map-history-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
  type TerrainSemanticsSection,
} from "./terrain-semantics";
import { mergeMapAndTerrainV2ThreeWay } from "./map-terrain-v2-merge";

const semantics = (cells: TerrainSemanticsSection["cells"] = []): TerrainSemanticsSection => ({
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells,
});

function state(name = "Base"): MapDocumentV2State {
  const document = createMap("world", null, "exterior", null, 3, 2);
  document.id = "world-merge-test";
  document.name = name;
  return { document, terrainSemantics: semantics() };
}

describe("mergeMapAndTerrainV2ThreeWay", () => {
  it("merges independent document and semantic edits as one combined state", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.document.layers[0].cells[0] = { tileId: "grass" };
    local.terrainSemantics = semantics([{ x: 0, y: 0, surface: "land" }]);
    remote.document.layers[0].cells[1] = { tileId: "sand" };
    remote.terrainSemantics = semantics([{ x: 2, y: 1, surface: "water", depth: "deep" }]);

    const result = mergeMapAndTerrainV2ThreeWay(base, local, remote);
    expect(result.status).toBe("merged");
    if (result.status !== "merged") throw new Error("Expected conflict-free combined merge");
    expect(result.state.document.layers[0].cells[0].tileId).toBe("grass");
    expect(result.state.document.layers[0].cells[1].tileId).toBe("sand");
    expect(result.state.terrainSemantics.cells).toEqual([
      { x: 0, y: 0, surface: "land" },
      { x: 2, y: 1, surface: "water", depth: "deep" },
    ]);
  });

  it("blocks adoption when terrain semantics conflict even if document merge is clean", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.terrainSemantics = semantics([{ x: 1, y: 0, surface: "water", depth: "shallow" }]);
    remote.terrainSemantics = semantics([{ x: 1, y: 0, surface: "water", depth: "deep" }]);

    const result = mergeMapAndTerrainV2ThreeWay(base, local, remote);
    expect(result.status).toBe("conflict");
    if (result.status !== "conflict") throw new Error("Expected semantic conflict");
    expect(result.reason).toBe("terrain-conflict");
    expect(result.documentMerge.conflicts).toEqual([]);
    expect(result.terrainConflicts).toHaveLength(1);
    expect("state" in result).toBe(false);
  });

  it("blocks adoption when document and semantic conflicts both occur", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.document.layers[0].cells[0] = { tileId: "grass" };
    remote.document.layers[0].cells[0] = { tileId: "sand" };
    local.terrainSemantics = semantics([{ x: 0, y: 0, surface: "water", depth: "shallow" }]);
    remote.terrainSemantics = semantics([{ x: 0, y: 0, surface: "water", depth: "deep" }]);

    const result = mergeMapAndTerrainV2ThreeWay(base, local, remote);
    expect(result.status).toBe("conflict");
    if (result.status !== "conflict") throw new Error("Expected combined conflicts");
    expect(result.reason).toBe("document-and-terrain-conflict");
    expect(result.documentMerge.conflicts.length).toBeGreaterThan(0);
    expect(result.terrainConflicts.length).toBe(1);
  });

  it("rejects different map identities before merging", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    remote.document.id = "another-world";
    expect(() => mergeMapAndTerrainV2ThreeWay(base, local, remote))
      .toThrow("Cannot merge different map identities");
  });

  it("rejects concurrent dimension changes instead of guessing semantic coordinate remapping", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    remote.document.width = 4;
    expect(() => mergeMapAndTerrainV2ThreeWay(base, local, remote))
      .toThrow("different dimensions");
  });

  it("rejects malformed terrain semantics before computing a preview", () => {
    const base = state();
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.terrainSemantics = semantics([{ x: 7, y: 0, surface: "land" }]);
    expect(() => mergeMapAndTerrainV2ThreeWay(base, local, remote))
      .toThrow("outside map bounds");
  });
});
