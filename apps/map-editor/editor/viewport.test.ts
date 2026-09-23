import { describe, expect, it } from "vitest";
import { DEFAULT_VIEWPORT, panBy, zoomAt } from "./viewport";

describe("viewport", () => {
  it("pans freely in all four directions without map-bound clamping", () => {
    const start = { ...DEFAULT_VIEWPORT, x: 120, y: 80 };
    const moved = panBy(start, -5000, 9000);

    expect(moved).toEqual({ x: -4880, y: 9080, zoom: 1 });
  });

  it("preserves unbounded camera position while zooming around the cursor", () => {
    const start = { ...DEFAULT_VIEWPORT, x: -2400, y: 3100, zoom: 1 };
    const zoomed = zoomAt(start, 2, 320, 180);

    expect(zoomed.zoom).toBe(2);
    expect(zoomed.x).toBe(-5120);
    expect(zoomed.y).toBe(3100);
  });
});
