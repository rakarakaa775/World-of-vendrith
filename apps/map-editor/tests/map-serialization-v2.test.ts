import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseMapDocument, serializeMapDocument } from "../editor/map-serialization";
import { resizeMapDocumentV2 } from "../editor/map-document-v2";
import {
  parseMapDocumentEnvelope,
  parseMapDocumentV2,
  serializeMapDocumentV2,
} from "../editor/map-serialization-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "../editor/terrain-semantics";

const document = createMap("world");
const semantics = {
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells: [
    { x: 2, y: 3, surface: "water" as const, feature: "ocean_sea" as const, depth: "deep" as const },
    { x: 1, y: 1, surface: "land" as const, feature: "shoreline" as const },
  ],
};

describe("MapDocument v2 envelope", () => {
  it("round-trips the document and authored terrain semantics", () => {
    const parsed = parseMapDocumentV2(serializeMapDocumentV2(document, semantics));
    expect(parsed.document).toEqual(document);
    expect(parsed.terrainSemantics).toEqual(semantics);
  });

  it("keeps legacy v1 readable without inventing semantics", () => {
    const legacy = serializeMapDocument(document);
    const parsed = parseMapDocumentEnvelope(legacy);
    expect(parsed.document).toEqual(parseMapDocument(legacy));
    expect(parsed.terrainSemantics).toBeNull();
  });

  it("accepts a parsed v2 envelope through the compatibility parser", () => {
    const parsed = parseMapDocumentEnvelope(serializeMapDocumentV2(document, semantics));
    expect(parsed.document).toEqual(document);
    expect(parsed.terrainSemantics).toEqual(semantics);
  });

  it("rejects unsupported schema and version", () => {
    const valid = JSON.parse(serializeMapDocumentV2(document, semantics));
    expect(() => parseMapDocumentV2({ ...valid, schema: "other.schema" })).toThrow(/schema/i);
    expect(() => parseMapDocumentV2({ ...valid, version: 3 })).toThrow(/version/i);
    expect(() => parseMapDocumentEnvelope({ ...valid, version: 3 })).toThrow(/version/i);
  });

  it("rejects missing or invalid terrain semantics instead of silently dropping them", () => {
    const valid = JSON.parse(serializeMapDocumentV2(document, semantics));
    const { terrainSemantics: _removed, ...missing } = valid;
    expect(() => parseMapDocumentV2(missing)).toThrow();
    expect(() => parseMapDocumentV2({ ...valid, terrainSemantics: null })).toThrow();
    expect(() => parseMapDocumentV2({
      ...valid,
      terrainSemantics: { ...semantics, cells: [{ x: -1, y: 0, surface: "water" }] },
    })).toThrow();
  });

  it("rejects duplicate semantic coordinates", () => {
    const duplicate = {
      ...semantics,
      cells: [
        { x: 1, y: 1, surface: "land" as const },
        { x: 1, y: 1, surface: "water" as const },
      ],
    };
    expect(() => serializeMapDocumentV2(document, duplicate)).toThrow(/duplicate/i);
  });

  it("resizes the document and semantic section together, pruning out-of-bounds records", () => {
    const state = { document, terrainSemantics: semantics };
    const shrunk = resizeMapDocumentV2(state, 2, 2);
    expect(shrunk.document.width).toBe(2);
    expect(shrunk.document.height).toBe(2);
    expect(shrunk.document.layers.every(layer => layer.cells.length === 4)).toBe(true);
    expect(shrunk.terrainSemantics.cells).toEqual([
      { x: 1, y: 1, surface: "land", feature: "shoreline" },
    ]);

    const expanded = resizeMapDocumentV2(shrunk, 4, 4);
    expect(expanded.document.width).toBe(4);
    expect(expanded.terrainSemantics.cells).toEqual(shrunk.terrainSemantics.cells);
  });

  it("does not mutate the input state during resize", () => {
    const before = JSON.stringify({ document, terrainSemantics: semantics });
    resizeMapDocumentV2({ document, terrainSemantics: semantics }, 1, 1);
    expect(JSON.stringify({ document, terrainSemantics: semantics })).toBe(before);
  });

  it("rejects malformed JSON", () => {
    expect(() => parseMapDocumentV2("{not-json")).toThrow();
    expect(() => parseMapDocumentEnvelope("{not-json")).toThrow();
  });
});
