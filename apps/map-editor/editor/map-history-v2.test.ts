import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import {
  commitHistoryV2,
  createHistoryV2,
  MAP_HISTORY_V2_MAX_ENTRIES,
  redoHistoryV2,
  undoHistoryV2,
  type MapDocumentV2State,
} from "./map-history-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "./terrain-semantics";

function stateWithTerrain(x: number): MapDocumentV2State {
  return {
    document: {
      ...createMap("world", null, "exterior", null, 32, 32),
      id: "history-world",
      name: `World ${x}`,
    },
    terrainSemantics: {
      schema: TERRAIN_SEMANTICS_SCHEMA,
      version: TERRAIN_SEMANTICS_VERSION,
      cells: [{ x, y: 3, surface: x % 2 === 0 ? "land" : "water" }],
    },
  };
}

describe("combined v2 map history", () => {
  it("undoes and redoes the document and terrain semantics as one state", () => {
    const initial = stateWithTerrain(1);
    const changed = stateWithTerrain(2);
    const afterCommit = commitHistoryV2(createHistoryV2(initial), changed);

    expect(afterCommit.present).toEqual(changed);
    expect(undoHistoryV2(afterCommit).present).toEqual(initial);
    expect(redoHistoryV2(undoHistoryV2(afterCommit)).present).toEqual(changed);
  });

  it("returns the same history when committing the current state reference", () => {
    const history = createHistoryV2(stateWithTerrain(1));
    expect(commitHistoryV2(history, history.present)).toBe(history);
  });

  it("does not change history when undo or redo has no available state", () => {
    const history = createHistoryV2(stateWithTerrain(1));
    expect(undoHistoryV2(history)).toBe(history);
    expect(redoHistoryV2(history)).toBe(history);
  });

  it("clears redo history after a new commit following undo", () => {
    const initial = stateWithTerrain(1);
    const second = stateWithTerrain(2);
    const third = stateWithTerrain(3);
    const history = commitHistoryV2(
      commitHistoryV2(createHistoryV2(initial), second),
      third,
    );
    const undone = undoHistoryV2(history);
    const branched = commitHistoryV2(undone, stateWithTerrain(4));

    expect(undone.present).toEqual(second);
    expect(branched.present).toEqual(stateWithTerrain(4));
    expect(branched.future).toEqual([]);
    expect(redoHistoryV2(branched)).toBe(branched);
  });

  it("keeps every history entry as a combined immutable state reference", () => {
    const initial = stateWithTerrain(1);
    const changed = stateWithTerrain(2);
    const history = commitHistoryV2(createHistoryV2(initial), changed);

    expect(history.past).toEqual([initial]);
    expect(history.present).toBe(changed);
    expect(history.past[0].terrainSemantics.cells[0].x).toBe(1);
    expect(history.present.terrainSemantics.cells[0].x).toBe(2);
  });

  it("caps retained undo history to the configured maximum", () => {
    let history = createHistoryV2(stateWithTerrain(0));
    for (let index = 1; index <= MAP_HISTORY_V2_MAX_ENTRIES + 5; index += 1) {
      history = commitHistoryV2(history, stateWithTerrain(index % 32));
    }

    expect(history.past).toHaveLength(MAP_HISTORY_V2_MAX_ENTRIES);
    expect(history.future).toEqual([]);
  });

  it("rejects invalid document dimensions before adding history", () => {
    const initial = stateWithTerrain(1);
    const history = createHistoryV2(initial);
    const invalid = stateWithTerrain(2);
    const malformed = {
      ...invalid,
      document: { ...invalid.document, width: 33 },
    } as MapDocumentV2State;

    expect(() => commitHistoryV2(history, malformed)).toThrow();
    expect(history.present).toBe(initial);
    expect(history.past).toEqual([]);
  });

  it("rejects terrain semantics outside map bounds", () => {
    const invalid = stateWithTerrain(1);
    const malformed: MapDocumentV2State = {
      ...invalid,
      terrainSemantics: {
        ...invalid.terrainSemantics,
        cells: [{ x: 32, y: 3, surface: "land" }],
      },
    };

    expect(() => createHistoryV2(malformed)).toThrow(/outside map bounds/);
  });

});
