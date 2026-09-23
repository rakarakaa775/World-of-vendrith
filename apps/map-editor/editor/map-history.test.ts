import { describe, expect, it } from "vitest";
import { createStarterMap } from "./map-document";
import { commitHistory, createHistory, redoHistory, undoHistory } from "./map-history";
import { paintCell } from "./map-state";

describe("map history", () => {
  it("supports undo and redo after an edit", () => {
    const base = createStarterMap();
    const edited = paintCell(base, "ground", { x: 1, y: 1 }, "starter-tile");
    const history = commitHistory(createHistory(base), edited);
    const undone = undoHistory(history);
    expect(undone.present).toBe(base);
    const redone = redoHistory(undone);
    expect(redone.present).toBe(edited);
  });
});
