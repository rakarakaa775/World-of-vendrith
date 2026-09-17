import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseMapDocument, serializeMapDocument } from "../editor/map-serialization";

describe("Map Editor foundation invariants", () => {
  it("accepts a valid non-default grid whose cell count matches width × height", () => {
    const document = createMap("world");
    const payload = JSON.parse(serializeMapDocument(document));
    payload.document.width = 7;
    payload.document.height = 5;
    payload.document.layers = payload.document.layers.map((layer: any) => ({
      ...layer,
      cells: Array.from({ length: 35 }, () => ({ tileId: null })),
    }));

    expect(parseMapDocument(JSON.stringify(payload))).toEqual(payload.document);
  });

  it("rejects a persisted layer whose cell count does not match width × height", () => {
    const document = createMap("world");
    const payload = JSON.parse(serializeMapDocument(document));
    payload.document.width = 7;
    payload.document.height = 5;

    expect(() => parseMapDocument(JSON.stringify(payload))).toThrow(
      "Layer cell count must equal width × height",
    );
  });

  it("rejects a loaded document when its identity differs from the requested map", () => {
    const requestedMapId = "world-requested";
    const loaded = createMap("world");
    loaded.id = "different-world";

    expect(() => parseMapDocument(serializeMapDocument(loaded), requestedMapId)).toThrow(
      "Loaded map identity does not match requested map",
    );
  });
});
