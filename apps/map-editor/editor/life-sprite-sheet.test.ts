import { describe, expect, it } from "vitest";
import { isLifeSpriteSheetGeometryCompatible, parseLifeSpriteSheetGeometry } from "./life-sprite-sheet";

const valid = {
  assetId: "lpc:human:walk:001", imageWidth: 576, imageHeight: 256,
  frameWidth: 64, frameHeight: 64, columns: 9, rows: 4,
  originX: 0, originY: 0, anchorX: 32, anchorY: 56, zIndex: 10,
};

describe("Life sprite-sheet geometry contract", () => {
  it("accepts a grid and retains origin, anchor and z-order", () => {
    expect(parseLifeSpriteSheetGeometry(valid)).toEqual(valid);
  });
  it("rejects a grid that exceeds image bounds", () => {
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, columns: 10 })).toThrow(/melampaui dimensi/);
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, originY: 1 })).toThrow(/melampaui dimensi/);
  });
  it("rejects invalid dimensions, origin, anchors and z-order", () => {
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, frameWidth: 0 })).toThrow(/positif/);
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, originX: -1 })).toThrow(/non-negatif/);
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, anchorX: 64 })).toThrow(/di dalam satu frame/);
    expect(() => parseLifeSpriteSheetGeometry({ ...valid, zIndex: 1.5 })).toThrow(/bilangan bulat/);
  });
  it("checks exact frame compatibility without guessing cell geometry", () => {
    const geometry = parseLifeSpriteSheetGeometry(valid);
    expect(isLifeSpriteSheetGeometryCompatible(geometry, { frameWidth: 64, frameHeight: 64 })).toBe(true);
    expect(isLifeSpriteSheetGeometryCompatible(geometry, { frameWidth: 32, frameHeight: 32 })).toBe(false);
  });
});
