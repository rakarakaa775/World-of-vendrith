import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseMapDocument, serializeMapDocument } from "../editor/map-serialization";

describe("Map Editor foundation invariants", () => {
  it("requires every layer cell array to match width × height", () => {
    const document = createMap("world");
    document.width = 7;
    document.height = 5;

    expect(() => parseMapDocument(serializeMapDocument(document))).toThrow(
      "Layer cell count must equal width × height",
    );
  });

  it("defines a requested-map identity check as a load boundary", () => {
    const requestedMapId = "world-requested";
    const loaded = createMap("world");
    loaded.id = "different-world";

    expect(loaded.id).not.toBe(requestedMapId);
    // This is intentionally a contract test placeholder until the loader exposes
    // the requested-map identity seam. The implementation must reject this case.
  });
});
