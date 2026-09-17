import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import {
  MAP_DOCUMENT_SCHEMA,
  MAP_DOCUMENT_VERSION,
  parseMapDocument,
  serializeMapDocument,
} from "../editor/map-serialization";

describe("MapDocument serialization contract", () => {
  it("round-trips the canonical envelope", () => {
    const document = createMap("world");
    const parsed = parseMapDocument(serializeMapDocument(document));

    expect(parsed).toEqual(document);
  });

  it("accepts the audited authoritative World Map identity shape", () => {
    const document = {
      ...createMap("world"),
      id: "87ba34eb-5a75-42fa-8919-63e44b700c02",
      name: "World Map",
      mapType: "world" as const,
      parentMapId: null,
    };
    const payload = JSON.stringify({
      schema: MAP_DOCUMENT_SCHEMA,
      version: MAP_DOCUMENT_VERSION,
      document,
    });

    expect(parseMapDocument(payload, document.id)).toEqual(document);
  });

  it("requires the canonical schema and version", () => {
    const document = createMap("world");
    const payload = JSON.parse(serializeMapDocument(document));

    payload.schema = "other.schema";
    expect(() => parseMapDocument(JSON.stringify(payload))).toThrow(
      "Unsupported map document schema",
    );

    payload.schema = MAP_DOCUMENT_SCHEMA;
    payload.version = MAP_DOCUMENT_VERSION + 1;
    expect(() => parseMapDocument(JSON.stringify(payload))).toThrow(
      "Unsupported map document version",
    );
  });

  it("rejects invalid document dimensions", () => {
    const document = createMap("world");
    const payload = JSON.parse(serializeMapDocument(document));

    payload.document.width = 0;
    expect(() => parseMapDocument(JSON.stringify(payload))).toThrow(
      "Map width must be a positive integer",
    );
  });
});
