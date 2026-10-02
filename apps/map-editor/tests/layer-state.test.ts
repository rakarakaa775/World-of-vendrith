import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { applyLayerTemplate, assignLayerToGroup, createLayerGroup, createLayerTemplate, deleteLayerGroup, deleteLayerTemplate, duplicateLayer, isLayerEffectivelyLocked, isLayerEffectivelyVisible, mergeLayers, reorderLayer, setActiveLayer, updateLayer, updateLayerGroup } from "../editor/layer-state";

describe("layer state", () => {
  it("changes active, visibility, lock, and opacity metadata without mutating the source", () => {
    const document = createMap("playable");
    const before = JSON.stringify(document);
    const active = setActiveLayer(document, "objects");
    const hidden = updateLayer(active, "objects", { visible: false });
    const locked = updateLayer(hidden, "objects", { locked: true });
    const faded = updateLayer(locked, "objects", { opacity: 0.35 });
    expect(faded.layers.find(layer => layer.id === "objects")?.active).toBe(true);
    expect(faded.layers.find(layer => layer.id === "objects")?.visible).toBe(false);
    expect(faded.layers.find(layer => layer.id === "objects")?.locked).toBe(true);
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

  it("duplicates a layer without sharing cell or object references", () => {
    const document = createMap("playable");
    const ground = document.layers.find(layer => layer.id === "ground")!;
    ground.cells[0] = { tileId: "grass" };
    ground.objects.push({ id: "tree-1", kind: "decoration", category: "nature", x: 1, y: 1, width: 1, height: 1, assetId: "tree", rotation: 0, zIndex: 1, collision: false });
    const duplicated = duplicateLayer(document, "ground");
    const copy = duplicated.layers.find(layer => layer.id === "ground-copy")!;
    expect(copy.name).toBe("World Ocean Copy");
    expect(copy.active).toBe(false);
    expect(copy.cells[0]).toEqual({ tileId: "grass" });
    expect(copy.cells[0]).not.toBe(ground.cells[0]);
    expect(copy.objects[0].id).toBe("ground-copy-tree-1");
    expect(copy.objects[0]).not.toBe(ground.objects[0]);
    expect(duplicated.layers.map(layer => layer.id)).toContain("ground-copy");
    expect(document.layers).toHaveLength(3);
  });

  it("merges same-kind layers into the target and removes the source", () => {
    const document = createMap("playable");
    const source = document.layers.find(layer => layer.id === "objects")!;
    const sameKindSource = { ...source, id: "objects-2", kind: "objects" as const, cells: source.cells.map(cell => ({ ...cell })), objects: source.objects.map(object => ({ ...object })) };
    const withSource = { ...document, layers: [...document.layers, sameKindSource] };
    const result = mergeLayers(withSource, "objects", "objects-2");
    expect(result.layers.map(layer => layer.id)).not.toContain("objects-2");
    expect(result.layers.filter(layer => layer.kind === "objects")).toHaveLength(1);
    expect(result).not.toBe(withSource);
  });

  it("rejects cross-kind merges without mutating the source", () => {
    const document = createMap("playable");
    const result = mergeLayers(document, "ground", "objects");
    expect(result).toBe(document);
  });

  it("creates, applies, and deletes layer templates without copying source data", () => {
    const document = createMap("playable");
    const withTemplate = createLayerTemplate(document, "ground", "Terrain Base");
    const template = withTemplate.layerTemplates[0];
    expect(template.kind).toBe("ground");
    expect(template.opacity).toBe(1);
    const applied = applyLayerTemplate(withTemplate, template.id);
    const created = applied.layers.find(layer => layer.id === "template-ground-layer")!;
    expect(created.name).toBe("Terrain Base");
    expect(created.kind).toBe("ground");
    expect(created.cells.every(cell => cell.tileId === null)).toBe(true);
    expect(created.objects).toEqual([]);
    expect(created).not.toBe(document.layers.find(layer => layer.id === "ground"));
    const removed = deleteLayerTemplate(applied, template.id);
    expect(removed.layerTemplates).toHaveLength(0);
    expect(removed.layers).toHaveLength(document.layers.length + 1);
  });

  it("creates, assigns, updates, and deletes layer groups without data loss", () => {
    const document = createMap("playable");
    const grouped = createLayerGroup(document, "Terrain Stack");
    const groupId = grouped.layerGroups[0].id;
    const assigned = assignLayerToGroup(grouped, "ground", groupId);
    expect(assigned.layers.find(layer => layer.id === "ground")?.groupId).toBe(groupId);
    expect(isLayerEffectivelyVisible(assigned, assigned.layers.find(layer => layer.id === "ground")!)).toBe(true);
    const hidden = updateLayerGroup(assigned, groupId, { visible: false, locked: true, expanded: false });
    const ground = hidden.layers.find(layer => layer.id === "ground")!;
    expect(isLayerEffectivelyVisible(hidden, ground)).toBe(false);
    expect(isLayerEffectivelyLocked(hidden, ground)).toBe(true);
    const removed = deleteLayerGroup(hidden, groupId);
    expect(removed.layerGroups).toHaveLength(0);
    expect(removed.layers.find(layer => layer.id === "ground")?.groupId).toBeNull();
    expect(document.layerGroups).toHaveLength(0);
  });
});