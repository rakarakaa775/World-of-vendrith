import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";

describe("MapDocument grid invariant", () => {
  it("allocates cells from width × height for a non-default document size", () => {
    const document = createMap("playable");
    const resized = { ...document, width: 7, height: 5 };

    for (const layer of resized.layers) {
      expect(layer.cells).toHaveLength(resized.width * resized.height);
    }
  });

  it("keeps the default 20 × 12 document at 240 cells", () => {
    const document = createMap("world");

    for (const layer of document.layers) {
      expect(layer.cells).toHaveLength(document.width * document.height);
    }
  });
});
