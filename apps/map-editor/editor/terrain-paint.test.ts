import { describe, expect, it } from "vitest";
import { createMap, createStarterMap } from "./map-document";
import { eraseTerrainPaint, applyTerrainPaint } from "./terrain-paint";
import { deriveWaterProjection } from "./water-projection";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import { commitHistory, createHistory, redoHistory, undoHistory } from "./map-history";

describe("terrain paint", () => {
  it("paints only valid, unique ground cells and recalculates the affected perimeter", () => {
    const base = createStarterMap();
    const result = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }, { x: 2, y: 2 }], "starter-tile");
    expect(result.affected).toContainEqual({ x: 2, y: 2 });
    expect(result.affected.length).toBeGreaterThan(1);
    expect(result.validation.filter(item => item.terrain !== null).every(item => item.valid)).toBe(true);
    expect(result.variants.some(item => item.point.x === 2 && item.point.y === 2)).toBe(true);
  });

  it("rejects a mixed valid/out-of-grid paint request without partial mutation", () => {
    const base = createStarterMap();
    const result = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }, { x: 128, y: 2 }], "starter-tile");
    expect(result.document).toBe(base);
    expect(result.affected).toHaveLength(0);
  });

  it("does not mutate the source document", () => {
    const base = createStarterMap();
    const result = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }], "starter-tile").document;
    expect(base).not.toBe(result);
    expect(base.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * base.width].tileId).toBeNull();
  });

  it("keeps water depth bands out of canonical cells after painting land on a World Map", () => {
    const base = createMap("world", null, "exterior", null, 7, 1);
    const painted = applyTerrainPaint(base, "ground", [{ x: 3, y: 0 }], "grass").document;
    const ground = painted.layers.find(layer => layer.id === "ground")!;

    expect(ground.cells.map(cell => cell.tileId)).toEqual([
      "deepwater", "deepwater", "deepwater", "grass", "deepwater", "deepwater", "deepwater",
    ]);
    expect(deriveWaterProjection(painted, "ground")?.bands).toEqual([
      "deepwater2", "brackish", "water", null, "water", "brackish", "deepwater2",
    ]);
  });

  it("preserves canonical water cells through schema-v1 save/load round-trip", () => {
    const base = createMap("world", null, "exterior", null, 7, 1);
    const painted = applyTerrainPaint(base, "ground", [{ x: 3, y: 0 }], "grass").document;
    const loaded = parseMapDocument(serializeMapDocument(painted));
    expect(loaded.layers.find(layer => layer.id === "ground")?.cells.map(cell => cell.tileId)).toEqual([
      "deepwater", "deepwater", "deepwater", "grass", "deepwater", "deepwater", "deepwater",
    ]);
    expect(deriveWaterProjection(loaded, "ground")?.bands).toEqual([
      "deepwater2", "brackish", "water", null, "water", "brackish", "deepwater2",
    ]);
  });

  it("keeps canonical water cells through undo and redo", () => {
    const base = createMap("world", null, "exterior", null, 7, 1);
    const edited = applyTerrainPaint(base, "ground", [{ x: 3, y: 0 }], "grass").document;
    const history = commitHistory(createHistory(base), edited);
    const undone = undoHistory(history);
    const redone = redoHistory(undone);

    expect(undone.present.layers.find(layer => layer.id === "ground")?.cells.map(cell => cell.tileId))
      .toEqual(Array.from({ length: 7 }, () => "deepwater"));
    expect(redone.present.layers.find(layer => layer.id === "ground")?.cells.map(cell => cell.tileId)).toEqual([
      "deepwater", "deepwater", "deepwater", "grass", "deepwater", "deepwater", "deepwater",
    ]);
    expect(deriveWaterProjection(redone.present, "ground")?.bands).toEqual([
      "deepwater2", "brackish", "water", null, "water", "brackish", "deepwater2",
    ]);
  });

  it("ignores locked or invisible ground layers", () => {
    const base = createStarterMap();
    const locked = { ...base, layers: base.layers.map(layer => layer.id === "ground" ? { ...layer, locked: true } : layer) };
    const hidden = { ...base, layers: base.layers.map(layer => layer.id === "ground" ? { ...layer, visible: false } : layer) };
    expect(applyTerrainPaint(locked, "ground", [{ x: 1, y: 1 }], "starter-tile").document).toBe(locked);
    expect(applyTerrainPaint(hidden, "ground", [{ x: 1, y: 1 }], "starter-tile").document).toBe(hidden);
  });

  it("erases a ground cell without mutating the source", () => {
    const base = createStarterMap();
    const painted = applyTerrainPaint(base, "ground", [{ x: 2, y: 2 }], "starter-tile").document;
    const erased = eraseTerrainPaint(painted, "ground", [{ x: 2, y: 2 }]).document;
    expect(erased).not.toBe(painted);
    expect(erased.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * erased.width].tileId).toBeNull();
    expect(painted.layers.find(layer => layer.id === "ground")?.cells[2 + 2 * painted.width].tileId).not.toBeNull();
  });
});
