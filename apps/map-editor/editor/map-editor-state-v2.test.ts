import { describe, expect, it } from "vitest";
import { createMap, resizeMapDocument } from "./map-document";
import { adoptMapSnapshotV2, applyDocumentChangeV2, initializeTerrainSemanticsV2 } from "./map-editor-state-v2";
import { serializeMapDocument } from "./map-serialization";
import { TERRAIN_SEMANTICS_SCHEMA, TERRAIN_SEMANTICS_VERSION } from "./terrain-semantics";

const document = { ...createMap("world", null, "exterior", null, 8, 8), id: "state-world" };
const semantics = {
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells: [{ x: 1, y: 1, surface: "water" as const, feature: "river" as const, depth: "shallow" as const }],
};

describe("explicit Terrain v2 editor state", () => {
  it("adopts legacy v1 without fabricating terrain semantics", () => {
    const state = adoptMapSnapshotV2(serializeMapDocument(document), document.id);
    expect(state).toEqual({ format: "legacy-uninitialized", document, terrainSemantics: null });
    const changed = applyDocumentChangeV2(state, { ...document, name: "renamed" });
    expect(changed.format).toBe("legacy-uninitialized");
    if (changed.format === "legacy-uninitialized") expect(changed.terrainSemantics).toBeNull();
  });

  it("keeps document and validated semantics together on same-size edits", () => {
    const state = initializeTerrainSemanticsV2(document, semantics);
    const changed = applyDocumentChangeV2(state, { ...document, name: "changed" });
    expect(changed.format).toBe("v2");
    if (changed.format === "v2") {
      expect(changed.state.document.name).toBe("changed");
      expect(changed.state.terrainSemantics).toEqual(semantics);
    }
  });

  it("clips out-of-bounds semantic cells on shrink and invents none on expansion", () => {
    const state = initializeTerrainSemanticsV2(document, {
      ...semantics,
      cells: [semantics.cells[0], { x: 7, y: 7, surface: "land" as const }],
    });
    const shrunk = applyDocumentChangeV2(state, resizeMapDocument(document, 4, 4));
    expect(shrunk.format).toBe("v2");
    if (shrunk.format === "v2") expect(shrunk.state.terrainSemantics.cells).toEqual([semantics.cells[0]]);
    const expanded = applyDocumentChangeV2(shrunk, resizeMapDocument(shrunk.format === "v2" ? shrunk.state.document : document, 12, 12));
    expect(expanded.format).toBe("v2");
    if (expanded.format === "v2") expect(expanded.state.terrainSemantics.cells).toEqual([semantics.cells[0]]);
  });

  it("rejects applying a document from another map identity", () => {
    const state = initializeTerrainSemanticsV2(document, semantics);
    expect(() => applyDocumentChangeV2(state, { ...document, id: "other-map" })).toThrow(/identity changed/);
  });

  it("rejects invalid semantics during explicit initialization", () => {
    expect(() => initializeTerrainSemanticsV2(document, {
      ...semantics,
      cells: [{ x: 8, y: 0, surface: "land" }],
    })).toThrow(/outside map bounds/);
  });
});
