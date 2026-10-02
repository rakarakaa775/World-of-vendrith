import { describe, expect, it } from "vitest";
import { createMap, resizeMapDocument } from "../editor/map-document";
import { parseMapDocument, serializeMapDocument } from "../editor/map-serialization";

describe("Map Editor Phase 0 foundation invariants", () => {
  it("allocates every layer from width × height", () => {
    const document = createMap("playable");
    expect(document.layers.every(layer => layer.cells.length === document.width * document.height)).toBe(true);
  });

  it("keeps resized documents dimensionally consistent", () => {
    const resized = resizeMapDocument(createMap("region"), 17, 9);
    expect(resized.width).toBe(17);
    expect(resized.height).toBe(9);
    expect(resized.layers.every(layer => layer.cells.length === 153)).toBe(true);
  });

  it("rejects a persisted document whose layer cell count is wrong", () => {
    const payload = JSON.parse(serializeMapDocument(createMap("world")));
    payload.document.layers[0].cells.pop();
    expect(() => parseMapDocument(JSON.stringify(payload))).toThrow("Layer cell count must equal width × height");
  });

  it("rejects a persisted document for the wrong requested map identity", () => {
    const document = createMap("world");
    const otherId = "requested-map-id-that-does-not-match";
    expect(() => parseMapDocument(serializeMapDocument(document), otherId)).toThrow(
      "Loaded map identity does not match requested map",
    );
  });
});
