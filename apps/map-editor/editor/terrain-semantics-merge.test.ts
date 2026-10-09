import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { parseMapSnapshot, serializeMapDocumentV2 } from "./map-snapshot-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
  type TerrainSemanticsSection,
} from "./terrain-semantics";
import { mergeTerrainSemanticsThreeWay } from "./terrain-semantics-merge";

const section = (cells: TerrainSemanticsSection["cells"] = []): TerrainSemanticsSection => ({
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells,
});

describe("mergeTerrainSemanticsThreeWay", () => {
  it("merges edits at independent coordinates", () => {
    const base = section([{ x: 0, y: 0, surface: "land" }]);
    const local = section([{ x: 0, y: 0, surface: "land" }, { x: 1, y: 0, surface: "water", depth: "shallow" }]);
    const remote = section([{ x: 0, y: 0, surface: "water", feature: "lake" }]);
    const result = mergeTerrainSemanticsThreeWay(3, 2, base, local, remote);

    expect(result.conflicts).toEqual([]);
    expect(result.terrainSemantics.cells).toEqual([
      { x: 0, y: 0, surface: "water", feature: "lake" },
      { x: 1, y: 0, surface: "water", depth: "shallow" },
    ]);
  });

  it("accepts identical edits to the same coordinate", () => {
    const base = section();
    const changed = section([{ x: 2, y: 1, surface: "water", depth: "deep" }]);
    const result = mergeTerrainSemanticsThreeWay(3, 2, base, changed, changed);

    expect(result.conflicts).toEqual([]);
    expect(result.terrainSemantics.cells).toEqual(changed.cells);
  });

  it("reports divergent edits to the same coordinate and returns a local-side preview", () => {
    const base = section([{ x: 1, y: 1, surface: "land" }]);
    const local = section([{ x: 1, y: 1, surface: "water", depth: "shallow" }]);
    const remote = section([{ x: 1, y: 1, surface: "water", depth: "deep" }]);
    const result = mergeTerrainSemanticsThreeWay(3, 3, base, local, remote);

    expect(result.conflicts).toEqual([{
      kind: "terrain-semantic-cell",
      id: "1,1",
      x: 1,
      y: 1,
      base: { x: 1, y: 1, surface: "land" },
      local: { x: 1, y: 1, surface: "water", depth: "shallow" },
      remote: { x: 1, y: 1, surface: "water", depth: "deep" },
    }]);
    expect(result.terrainSemantics.cells).toEqual(local.cells);
  });

  it("treats deleting a semantic record as a change and detects deletion-versus-edit", () => {
    const base = section([{ x: 0, y: 0, surface: "water", feature: "river" }]);
    const local = section();
    const remote = section([{ x: 0, y: 0, surface: "water", feature: "river", current: "strong" }]);
    const result = mergeTerrainSemanticsThreeWay(2, 2, base, local, remote);

    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toMatchObject({ id: "0,0", base: base.cells[0], local: null, remote: remote.cells[0] });
  });

  it("preserves a one-sided deletion when the other side is unchanged", () => {
    const base = section([{ x: 0, y: 0, surface: "water", feature: "river" }]);
    const result = mergeTerrainSemanticsThreeWay(2, 2, base, section(), base);

    expect(result.conflicts).toEqual([]);
    expect(result.terrainSemantics.cells).toEqual([]);
  });

  it("rejects invalid semantics before producing a merge result", () => {
    const invalid = section([{ x: 9, y: 0, surface: "land" }]);
    expect(() => mergeTerrainSemanticsThreeWay(2, 2, section(), invalid, section()))
      .toThrow("outside map bounds");
  });

  it("returns records in deterministic row-major order", () => {
    const unsorted = section([
      { x: 2, y: 1, surface: "land" },
      { x: 0, y: 0, surface: "water" },
      { x: 1, y: 0, surface: "land" },
    ]);
    const result = mergeTerrainSemanticsThreeWay(3, 2, section(), unsorted, section());

    expect(result.terrainSemantics.cells.map(({ x, y }) => [x, y])).toEqual([[0, 0], [1, 0], [2, 1]]);
  });
});
