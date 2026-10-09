import { describe, expect, it } from "vitest";
import { createMap, createStarterMap } from "./map-document";
import { eraseTerrainPaint, applyTerrainPaint } from "./terrain-paint";
import { deriveWaterProjection } from "./water-projection";
import { analyzeTerrainBrushPreview } from "./terrain-brush-preview";
import { createTerrainAssetBindingMap } from "./terrain-asset-binding";
import { resolveTerrainRenderCell } from "./terrain-resolver";
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

  it("shows projected shoreline bands in the brush preview without mutating canonical cells", () => {
    const base = createMap("world", null, "exterior", null, 7, 1);
    const preview = analyzeTerrainBrushPreview(base, "ground", [{ x: 3, y: 0 }], "grass");
    const byX = new Map(preview.cells.map(cell => [cell.point.x, cell.terrain]));

    // Preview agrees with the canvas projection around the prospective land.
    expect(byX.get(2)).toBe("water");
    expect(byX.get(4)).toBe("water");
    // The preview is a temporary render projection, not an authored edit.
    expect(base.layers.find(layer => layer.id === "ground")?.cells.map(cell => cell.tileId))
      .toEqual(Array.from({ length: 7 }, () => "deepwater"));
  });

  it("matches canvas shoreline mask and asset binding in the brush preview", () => {
    const base = createMap("world", null, "exterior", null, 3, 3);
    const bindings = createTerrainAssetBindingMap([
      {
        terrain: "grass",
        mask: 255,
        assetId: "grass-base-approved",
        sourceRuleKey: null,
        region: null,
      },
    ]);
    const preview = analyzeTerrainBrushPreview(
      base,
      "ground",
      [{ x: 1, y: 1 }],
      "grass",
      bindings,
    );
    const previewCenter = preview.cells.find(cell => cell.point.x === 1 && cell.point.y === 1);

    // The canvas resolves a projected temporary document. Reconstruct that
    // render-only projection here to compare the preview's exact mask/binding.
    const painted = applyTerrainPaint(base, "ground", [{ x: 1, y: 1 }], "grass").document;
    const projection = deriveWaterProjection(painted, "ground")!;
    const ground = painted.layers.find(layer => layer.id === "ground")!;
    const renderDocument = {
      ...painted,
      layers: painted.layers.map(layer => layer.id !== "ground" ? layer : ({
        ...layer,
        cells: layer.cells.map((cell, index) => projection.bands[index]
          ? { ...cell, tileId: projection.bands[index] }
          : cell),
      })),
    };
    const canvasCenter = resolveTerrainRenderCell(
      renderDocument,
      "ground",
      { x: 1, y: 1 },
      bindings,
    );

    expect(ground.cells[4].tileId).toBe("grass");
    expect(previewCenter).toBeDefined();
    expect(previewCenter?.mask).toBe(canvasCenter?.mask);
    expect(previewCenter?.assetId).toBe(canvasCenter?.assetId);
    expect(previewCenter?.tileId).toBe(canvasCenter?.tileId);
    expect(previewCenter?.bound).toBe(canvasCenter?.assetId !== null);
    expect(previewCenter?.assetId).toBe("grass-base-approved");
    expect(base.layers.find(layer => layer.id === "ground")?.cells.every(cell => cell.tileId === "deepwater")).toBe(true);
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
