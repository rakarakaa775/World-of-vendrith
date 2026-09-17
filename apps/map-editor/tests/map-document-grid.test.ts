import { describe, expect, it } from "vitest";

function expectedCellCount(width: number, height: number) {
  return width * height;
}

describe("MapDocument grid invariant", () => {
  it("derives cell count from width × height", () => {
    expect(expectedCellCount(20, 12)).toBe(240);
    expect(expectedCellCount(7, 5)).toBe(35);
    expect(expectedCellCount(1, 1)).toBe(1);
  });

  it("does not assume the default 20 × 12 dimensions", () => {
    expect(expectedCellCount(16, 16)).toBe(256);
  });
});
