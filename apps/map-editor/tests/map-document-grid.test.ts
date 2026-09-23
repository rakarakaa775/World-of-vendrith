import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";

describe("MapDocument grid invariant", () => {
  it("keeps every layer aligned with the document dimensions", () => {
    const document = createMap("playable");

    for (const layer of document.layers) {
      expect(layer.cells).toHaveLength(document.width * document.height);
    }
  });

  it("uses the expected default 128 × 128 grid without a hardcoded test count", () => {
    const document = createMap("world");

    expect(document.width).toBe(128);
    expect(document.height).toBe(128);
    for (const layer of document.layers) {
      expect(layer.cells).toHaveLength(document.width * document.height);
    }
  });
});
