import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseMapDocumentV2, serializeMapDocumentV2 } from "../editor/map-serialization-v2";
import { TERRAIN_SEMANTICS_SCHEMA, TERRAIN_SEMANTICS_VERSION } from "../editor/terrain-semantics";

describe("MapDocument v2 envelope", () => {
  it("round-trips authored terrain semantics", () => {
    const document = createMap("world");
    const semantics = { schema: TERRAIN_SEMANTICS_SCHEMA, version: TERRAIN_SEMANTICS_VERSION, cells: [{ x: 2, y: 3, surface: "water" as const, feature: "ocean_sea" as const, depth: "deep" as const }] };
    const parsed = parseMapDocumentV2(serializeMapDocumentV2(document, semantics));
    expect(parsed.document).toEqual(document);
    expect(parsed.terrainSemantics).toEqual(semantics);
  });
});
