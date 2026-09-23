import { describe, expect, it } from "vitest";
import { pointsInLine, pointsForPaintShape } from "../editor/paint-tools";
import { createMap } from "../editor/map-document";

describe("terrain line tool", () => {
  it("draws a horizontal line including both endpoints", () => {
    expect(pointsInLine({ x: 2, y: 4 }, { x: 6, y: 4 })).toEqual([
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ]);
  });

  it("draws a vertical line including both endpoints", () => {
    expect(pointsInLine({ x: 3, y: 1 }, { x: 3, y: 5 })).toEqual([
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
    ]);
  });

  it("draws a diagonal line without gaps", () => {
    expect(pointsInLine({ x: 0, y: 0 }, { x: 4, y: 3 })).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
    ]);
  });

  it("supports reverse direction deterministically", () => {
    expect(pointsInLine({ x: 6, y: 4 }, { x: 2, y: 4 })).toEqual([
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ]);
  });

  it("routes the line shape through the shared paint-shape API", () => {
    const document = createMap("world");
    expect(pointsForPaintShape(document, "ground", "line", { x: 1, y: 2 }, { x: 4, y: 2 })).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });
});
