import { describe, expect, it } from "vitest";
import { createMap, resizeMapDocument } from "./map-document";
import {
  commitMapEditorStateHistory,
  continueMapEditorStateGestureHistory,
  createMapEditorStateHistory,
  MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES,
  redoMapEditorStateHistory,
  resetMapEditorStateHistory,
  undoMapEditorStateHistory,
} from "./map-editor-state-history-v2";
import {
  initializeTerrainSemantics,
  parseMapEditorState,
  replaceMapEditorDocument,
} from "./map-editor-state-v2";
import { serializeMapDocument } from "./map-serialization";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

const semantics = (x: number): TerrainSemanticsSection => ({
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells: [{ x, y: 1, surface: x % 2 ? "land" : "water" }],
});
const legacy = () => parseMapEditorState(serializeMapDocument({
  ...createMap("world", null, "exterior", null, 32, 32), id: "world-a", name: "World A",
}));
const initialized = (x: number) => initializeTerrainSemantics(legacy(), semantics(x));

describe("combined editor state history v2", () => {
  it("undoes and redoes document and semantics together", () => {
    const first = initialized(1);
    const second = replaceMapEditorDocument(first, { ...first.document, name: "Renamed" });
    const history = commitMapEditorStateHistory(createMapEditorStateHistory(first), second);
    expect(history.present.document.name).toBe("Renamed");
    expect(undoMapEditorStateHistory(history).present).toEqual(first);
    expect(redoMapEditorStateHistory(undoMapEditorStateHistory(history)).present).toEqual(second);
  });

  it("groups repeated paint gesture updates into one atomic undo step", () => {
    const first = initialized(1);
    const gestureStart = replaceMapEditorDocument(first, {
      ...first.document,
      name: "Paint started",
    });
    const started = commitMapEditorStateHistory(createMapEditorStateHistory(first), gestureStart);
    const gestureNext = replaceMapEditorDocument(gestureStart, {
      ...gestureStart.document,
      name: "Paint continued",
    });
    const continued = continueMapEditorStateGestureHistory(started, gestureNext);

    expect(continued.past).toEqual(started.past);
    expect(continued.present).toEqual(gestureNext);
    expect(undoMapEditorStateHistory(continued).present).toEqual(first);
  });

  it("clears redo during a gesture and rejects cross-map continuation", () => {
    const first = initialized(1);
    const second = replaceMapEditorDocument(first, { ...first.document, name: "Second" });
    const third = replaceMapEditorDocument(second, { ...second.document, name: "Third" });
    const history = commitMapEditorStateHistory(
      commitMapEditorStateHistory(createMapEditorStateHistory(first), second),
      third,
    );
    const undone = undoMapEditorStateHistory(history);
    const branch = replaceMapEditorDocument(undone.present, {
      ...undone.present.document,
      name: "Gesture branch",
    });
    const continued = continueMapEditorStateGestureHistory(undone, branch);
    expect(continued.future).toEqual([]);

    const otherMap = parseMapEditorState(serializeMapDocument({
      ...createMap("world", null, "exterior", null, 32, 32), id: "world-other", name: "Other",
    }));
    expect(() => continueMapEditorStateGestureHistory(continued, otherMap)).toThrow(/identity changed/);
  });

  it("supports legacy states without fabricating semantics", () => {
    const state = legacy();
    const history = createMapEditorStateHistory(state);
    expect(history.present.kind).toBe("legacy");
    expect(history.present.terrainSemantics).toBeNull();
  });

  it("invalidates redo after a new commit", () => {
    const first = initialized(1);
    const second = replaceMapEditorDocument(first, { ...first.document, name: "Second" });
    const third = replaceMapEditorDocument(first, { ...first.document, name: "Third" });
    const history = commitMapEditorStateHistory(
      commitMapEditorStateHistory(createMapEditorStateHistory(first), second),
      third,
    );
    const undone = undoMapEditorStateHistory(history);
    const branchState = replaceMapEditorDocument(undone.present, {
      ...undone.present.document,
      name: "Branch",
    });
    const branched = commitMapEditorStateHistory(undone, branchState);
    expect(branched.future).toEqual([]);
    expect(redoMapEditorStateHistory(branched)).toBe(branched);
  });

  it("rejects cross-map commits and requires an explicit history reset", () => {
    const first = initialized(1);
    const otherMap = parseMapEditorState(serializeMapDocument({
      ...createMap("world", null, "exterior", null, 32, 32), id: "world-b", name: "World B",
    }));
    const history = createMapEditorStateHistory(first);
    expect(() => commitMapEditorStateHistory(history, otherMap)).toThrow(/identity changed/);
    const reset = resetMapEditorStateHistory(otherMap);
    expect(reset.past).toEqual([]);
    expect(reset.present.document.id).toBe("world-b");
  });

  it("rejects invalid combined state without mutating existing history", () => {
    const first = initialized(1);
    const history = createMapEditorStateHistory(first);
    const malformed = {
      ...first,
      terrainSemantics: { ...semantics(1), cells: [{ x: 32, y: 1, surface: "land" as const }] },
    };
    expect(() => commitMapEditorStateHistory(history, malformed)).toThrow(/outside map bounds/);
    expect(history.present).toBe(first);
    expect(history.past).toEqual([]);
  });

  it("bounds retained past and future entries", () => {
    let history = createMapEditorStateHistory(initialized(1));
    for (let index = 0; index < MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES + 3; index += 1) {
      const current = history.present;
      const next = replaceMapEditorDocument(current, {
        ...current.document,
        name: `World ${index}`,
      });
      history = commitMapEditorStateHistory(history, next);
    }
    expect(history.past).toHaveLength(MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES);
  });

  it("clips semantics during a resize before committing the combined state", () => {
    const first = initializeTerrainSemantics(legacy(), {
      ...semantics(1),
      cells: [{ x: 1, y: 1, surface: "land" }, { x: 20, y: 20, surface: "water" }],
    });
    const resized = replaceMapEditorDocument(first, resizeMapDocument(first.document, 8, 8));
    const history = commitMapEditorStateHistory(createMapEditorStateHistory(first), resized);
    expect(history.present.kind).toBe("initialized");
    if (history.present.kind !== "initialized") throw new Error("Expected initialized state");
    expect(history.present.terrainSemantics.cells).toEqual([{ x: 1, y: 1, surface: "land" }]);
    const undone = undoMapEditorStateHistory(history);
    expect(undone.present).toEqual(first);
  });
});
