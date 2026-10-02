import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { normalizeSelection } from "../editor/selection";
import { boxSelectObjectIds, toggleObjectSelection } from "../editor/object-state";

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
