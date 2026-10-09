import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import {
  commitHistoryV2,
  createHistoryV2,
  redoHistoryV2,
  undoHistoryV2,
  type MapDocumentV2State,
} from "../editor/map-history-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "../editor/terrain-semantics";

const initial: MapDocumentV2State = {
  document: createMap("world"),
  terrainSemantics: {
    schema: TERRAIN_SEMANTICS_SCHEMA,
    version: TERRAIN_SEMANTICS_VERSION,
    cells: [{ x: 1, y: 1, surface: "land", feature: "shoreline" }],
  },
};

const edited: MapDocumentV2State = {
  document: { ...initial.document, name: "Edited World" },
  terrainSemantics: {
    ...initial.terrainSemantics,
    cells: [{ x: 2, y: 2, surface: "water", feature: "ocean_sea", depth: "deep" }],
  },
};

describe("MapDocument v2 atomic history", () => {
  it("undo restores document and semantics from the same snapshot", () => {
    const history = commitHistoryV2(createHistoryV2(initial), edited);
    const undone = undoHistoryV2(history);
    expect(undone.present.document).toEqual(initial.document);
    expect(undone.present.terrainSemantics).toEqual(initial.terrainSemantics);
    expect(undone.future[0]).toEqual(edited);
  });

  it("redo restores document and semantics together", () => {
    const history = commitHistoryV2(createHistoryV2(initial), edited);
    const redone = redoHistoryV2(undoHistoryV2(history));
    expect(redone.present).toEqual(edited);
  });

  it("a new edit after undo clears the redo branch atomically", () => {
    const history = commitHistoryV2(createHistoryV2(initial), edited);
    const undone = undoHistoryV2(history);
    const alternative: MapDocumentV2State = {
      document: { ...initial.document, name: "Alternative World" },
      terrainSemantics: {
        ...initial.terrainSemantics,
        cells: [{ x: 3, y: 3, surface: "land", feature: "none" }],
      },
    };
    const branched = commitHistoryV2(undone, alternative);
    expect(branched.present).toEqual(alternative);
    expect(branched.future).toEqual([]);
    expect(branched.past.at(-1)).toEqual(initial);
  });

  it("does not create history for the identical state reference", () => {
    const history = createHistoryV2(initial);
    expect(commitHistoryV2(history, initial)).toBe(history);
  });

  it("undo and redo at boundaries are safe no-ops", () => {
    const history = createHistoryV2(initial);
    expect(undoHistoryV2(history)).toBe(history);
    expect(redoHistoryV2(history)).toBe(history);
  });
});
