import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { normalizeSelection } from "../editor/selection";
import { boxSelectObjectIds, toggleObjectSelection } from "../editor/object-state";
import { copySelection, pasteSelection, replaceSelection, moveSelection } from "../editor/selection-clipboard";

describe("map editor selection", () => {
  it("normalizes a forward drag into an inclusive rectangle", () => {
    expect(normalizeSelection({ x: 2, y: 3 }, { x: 5, y: 7 })).toEqual({
      x: 2, y: 3, width: 4, height: 5,
    });
  });

  it("normalizes a reverse drag deterministically", () => {
    expect(normalizeSelection({ x: 5, y: 7 }, { x: 2, y: 3 })).toEqual({
      x: 2, y: 3, width: 4, height: 5,
    });
  });

  it("selects objects intersecting the selection box", () => {
    const document = createMap("world");
    const objects = [
      { id: "a", kind: "decoration" as const, category: "tree", x: 2, y: 2, width: 2, height: 2, assetId: "a", rotation: 0, zIndex: 0, collision: false },
      { id: "b", kind: "decoration" as const, category: "tree", x: 8, y: 8, width: 2, height: 2, assetId: "b", rotation: 0, zIndex: 0, collision: false },
    ];
    const withObjects = {
      ...document,
      layers: document.layers.map(layer =>
        layer.id === "objects" ? { ...layer, objects } : layer,
      ),
    };

    expect(boxSelectObjectIds(withObjects, "objects", { x: 1, y: 1, width: 4, height: 4 })).toEqual(["a"]);
    expect(boxSelectObjectIds(withObjects, "objects", { x: 7, y: 7, width: 4, height: 4 })).toEqual(["b"]);
  });

  it("supports additive multi-selection without duplicates", () => {
    expect(toggleObjectSelection(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleObjectSelection(["a", "b"], "a")).toEqual(["b"]);
  });

  it("does not mutate the document during box selection", () => {
    const document = createMap("world");
    const objects = [
      { id: "a", kind: "decoration" as const, category: "tree", x: 2, y: 2, width: 2, height: 2, assetId: "a", rotation: 0, zIndex: 0, collision: false },
    ];
    const withObjects = {
      ...document,
      layers: document.layers.map(layer =>
        layer.id === "objects" ? { ...layer, objects } : layer,
      ),
    };
    const before = JSON.stringify(withObjects);
    boxSelectObjectIds(withObjects, "objects", { x: 0, y: 0, width: 5, height: 5 });
    expect(JSON.stringify(withObjects)).toBe(before);
  });
});


describe("terrain selection clipboard", () => {
  function withGround(document: ReturnType<typeof createMap>, cells: Array<{ tileId: string | null }>) {
    return {
      ...document,
      layers: document.layers.map(layer => layer.id === "ground" ? { ...layer, cells } : layer),
    };
  }

  it("copies and pastes a selection without mutating the source", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: null as string | null }));
    cells[1 + document.width] = { tileId: "grass" };
    const source = withGround(document, cells);
    const before = JSON.stringify(source);
    const clipboard = copySelection(source, "ground", { x: 1, y: 1, width: 1, height: 1 });
    const pasted = pasteSelection(source, "ground", clipboard, { x: 3, y: 3 });
    expect(pasted.layers.find(layer => layer.id === "ground")!.cells[3 + 3 * document.width].tileId).toBe("grass");
    expect(JSON.stringify(source)).toBe(before);
  });

  it("replaces every cell inside the selection", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: "grass" as string | null }));
    const source = withGround(document, cells);
    const replaced = replaceSelection(source, "ground", { x: 2, y: 2, width: 2, height: 2 }, "dirt");
    const next = replaced.layers.find(layer => layer.id === "ground")!.cells;
    expect(next[2 + 2 * document.width].tileId).toBe("dirt");
    expect(next[3 + 3 * document.width].tileId).toBe("dirt");
    expect(next[1 + 1 * document.width].tileId).toBe("grass");
  });

  it("moves a selection without leaving a duplicate source cell", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: null as string | null }));
    cells[2 + 2 * document.width] = { tileId: "dirt" };
    const source = withGround(document, cells);
    const result = moveSelection(source, "ground", { x: 2, y: 2, width: 1, height: 1 }, { x: 1, y: 0 });
    const moved = result.document.layers.find(layer => layer.id === "ground")!.cells;
    expect(moved[2 + 2 * document.width].tileId).toBeNull();
    expect(moved[3 + 2 * document.width].tileId).toBe("dirt");
    expect(result.selection).toEqual({ x: 3, y: 2, width: 1, height: 1 });
  });

  it("clamps a moved selection to the map bounds", () => {
    const document = createMap("world");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    const cells = ground.cells.map(() => ({ tileId: null as string | null }));
    cells[document.width - 1] = { tileId: "grass" };
    const source = withGround(document, cells);
    const result = moveSelection(source, "ground", { x: document.width - 1, y: 0, width: 1, height: 1 }, { x: 5, y: 0 });
    expect(result.selection.x).toBe(document.width - 1);
    expect(result.document.layers.find(layer => layer.id === "ground")!.cells[document.width - 1].tileId).toBe("grass");
  });
});