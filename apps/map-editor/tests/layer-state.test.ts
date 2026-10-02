import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { reorderLayer, setActiveLayer, updateLayer } from "../editor/layer-state";

describe("layer state", () => {
  it("changes active, visibility, and lock metadata without mutating the source", () => {
    const document = createMap("playable");
    const before = JSON.stringify(document);
    const active = setActiveLayer(document, "objects");
    const hidden = updateLayer(active, "objects", { visible: false });
    const locked = updateLayer(hidden, "objects", { locked: true });

    expect(locked.layers.find(layer => layer.id === "objects")?.active).toBe(true);
    expect(locked.layers.find(layer => layer.id === "objects")?.visible).toBe(false);
    expect(locked.layers.find(layer => layer.id === "objects")?.locked).toBe(true);
    const faded = updateLayer(locked, "objects", { opacity: 0.35 });
    expect(faded.layers.find(layer => layer.id === "objects")?.opacity).toBe(0.35);
    expect(JSON.stringify(document)).toBe(before);
  });

  it("reorders layers deterministically and keeps all layer identities", () => {
    const document = createMap("playable");
    const ids = document.layers.map(layer => layer.id);
    const moved = reorderLayer(document, "objects", "up");

    expect(moved.layers.map(layer => layer.id)).toEqual(["objects", "ground", "collision"]);
    expect(new Set(moved.layers.map(layer => layer.id))).toEqual(new Set(ids));
    expect(moved).not.toBe(document);
  });
});
