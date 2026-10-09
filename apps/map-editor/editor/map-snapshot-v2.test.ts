import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import {
  MAP_DOCUMENT_V2_SCHEMA,
  MAP_DOCUMENT_V2_VERSION,
  parseMapSnapshot,
  serializeMapDocumentV2,
} from "./map-snapshot-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "./terrain-semantics";
import type { MapDocumentV2State } from "./map-history-v2";

const state: MapDocumentV2State = {
  document: { ...createMap("world", null, "exterior", null, 32, 32), id: "world-test" },
  terrainSemantics: {
    schema: TERRAIN_SEMANTICS_SCHEMA,
    version: TERRAIN_SEMANTICS_VERSION,
    cells: [
      { x: 1, y: 1, surface: "land", feature: "shoreline" },
      { x: 2, y: 2, surface: "water", feature: "ocean_sea", depth: "deep" },
    ],
  },
};

describe("opt-in map snapshot v2 adapter", () => {
  it("round-trips document and terrain semantics together", () => {
    const parsed = parseMapSnapshot(serializeMapDocumentV2(state), "world-test");
    expect(parsed.format).toBe("v2");
    if (parsed.format !== "v2") throw new Error("Expected v2 snapshot");
    expect(parsed.state.document).toEqual(state.document);
    expect(parsed.state.terrainSemantics).toEqual(state.terrainSemantics);
  });

  it("keeps legacy v1 snapshots readable without inventing semantics", () => {
    const legacy = JSON.stringify({
      schema: "vandrith.map-document",
      version: 1,
      document: state.document,
    });
    const parsed = parseMapSnapshot(legacy, "world-test");
    expect(parsed).toEqual({
      format: "v1",
      document: state.document,
      terrainSemantics: null,
    });
  });

  it("rejects snapshots for a different requested map id", () => {
    expect(() => parseMapSnapshot(serializeMapDocumentV2(state), "another-map"))
      .toThrow();
  });

  it("rejects unsupported v2 versions", () => {
    const payload = JSON.parse(serializeMapDocumentV2(state));
    payload.version = MAP_DOCUMENT_V2_VERSION + 1;
    expect(() => parseMapSnapshot(payload)).toThrow("Unsupported map document v2 version");
  });

  it("rejects out-of-bounds or duplicate semantic cells", () => {
    const payload = JSON.parse(serializeMapDocumentV2(state));
    payload.terrainSemantics.cells.push({ x: 32, y: 0, surface: "land" });
    expect(() => parseMapSnapshot(payload)).toThrow("outside map bounds");
  });

  it("writes the explicit v2 envelope", () => {
    const payload = JSON.parse(serializeMapDocumentV2(state));
    expect(payload.schema).toBe(MAP_DOCUMENT_V2_SCHEMA);
    expect(payload.version).toBe(MAP_DOCUMENT_V2_VERSION);
    expect(payload.terrainSemantics.cells).toHaveLength(2);
  });
});
