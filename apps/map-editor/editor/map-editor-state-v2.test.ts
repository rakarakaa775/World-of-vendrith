import { describe, expect, it } from "vitest";
import { createMap, resizeMapDocument } from "./map-document";
import {
  initializeTerrainSemantics,
  parseMapEditorState,
  replaceMapEditorDocument,
  serializeInitializedMapEditorState,
} from "./map-editor-state-v2";
import { serializeMapDocument } from "./map-serialization";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
  type TerrainSemanticsSection,
} from "./terrain-semantics";
import { MAP_DOCUMENT_V2_SCHEMA, MAP_DOCUMENT_V2_VERSION } from "./map-snapshot-v2";

const semantics = (cells: TerrainSemanticsSection["cells"] = [{ x: 1, y: 1, surface: "land" }]): TerrainSemanticsSection => ({
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells,
});

function world(id = "world-a", width = 32, height = 32) {
  return { ...createMap("world", null, "exterior", null, width, height), id, name: id };
}

describe("opt-in map editor state v2 boundary", () => {
  it("loads legacy v1 documents without inventing terrain semantics", () => {
    const state = parseMapEditorState(serializeMapDocument(world()));
    expect(state.kind).toBe("legacy");
    expect(state.terrainSemantics).toBeNull();
    expect(state.document.id).toBe("world-a");
  });

  it("loads v2 documents as one initialized state", () => {
    const document = world();
    const state = parseMapEditorState(JSON.stringify({
      schema: MAP_DOCUMENT_V2_SCHEMA,
      version: MAP_DOCUMENT_V2_VERSION,
      document,
      terrainSemantics: semantics(),
    }));
    expect(state.kind).toBe("initialized");
    if (state.kind !== "initialized") throw new Error("Expected initialized state");
    expect(state.terrainSemantics.cells).toEqual([{ x: 1, y: 1, surface: "land" }]);
  });

  it("requires explicit initialization before legacy state can be serialized as v2", () => {
    const legacy = parseMapEditorState(serializeMapDocument(world()));
    expect(() => serializeInitializedMapEditorState(legacy)).toThrow(/before terrain semantics are initialized/);
    const initialized = initializeTerrainSemantics(legacy, semantics());
    expect(initialized.kind).toBe("initialized");
    expect(() => serializeInitializedMapEditorState(initialized)).not.toThrow();
  });

  it("rejects invalid semantics during explicit initialization", () => {
    const legacy = parseMapEditorState(serializeMapDocument(world()));
    expect(() => initializeTerrainSemantics(legacy, semantics([{ x: 32, y: 1, surface: "water" }]))).toThrow(/outside map bounds/);
  });

  it("clears semantics when switching to a different map identity", () => {
    const initialized = initializeTerrainSemantics(parseMapEditorState(serializeMapDocument(world("world-a"))), semantics());
    const switched = replaceMapEditorDocument(initialized, world("world-b"));
    expect(switched.kind).toBe("legacy");
    expect(switched.terrainSemantics).toBeNull();
    expect(switched.document.id).toBe("world-b");
  });

  it("preserves valid semantics for a same-map edit with unchanged dimensions", () => {
    const initialized = initializeTerrainSemantics(parseMapEditorState(serializeMapDocument(world())), semantics());
    const changed = replaceMapEditorDocument(initialized, { ...initialized.document, name: "Renamed world" });
    expect(changed.kind).toBe("initialized");
    if (changed.kind !== "initialized") throw new Error("Expected initialized state");
    expect(changed.terrainSemantics.cells).toEqual(semantics().cells);
  });

  it("clips semantics on shrink and does not invent semantics on expansion", () => {
    const initialDocument = world();
    const initialized = initializeTerrainSemantics(
      parseMapEditorState(serializeMapDocument(initialDocument)),
      semantics([{ x: 1, y: 1, surface: "land" }, { x: 20, y: 20, surface: "water" }]),
    );
    const shrunk = replaceMapEditorDocument(initialized, resizeMapDocument(initialized.document, 8, 8));
    expect(shrunk.kind).toBe("initialized");
    if (shrunk.kind !== "initialized") throw new Error("Expected initialized state");
    expect(shrunk.terrainSemantics.cells).toEqual([{ x: 1, y: 1, surface: "land" }]);

    const expanded = replaceMapEditorDocument(shrunk, resizeMapDocument(shrunk.document, 16, 16));
    expect(expanded.kind).toBe("initialized");
    if (expanded.kind !== "initialized") throw new Error("Expected initialized state");
    expect(expanded.terrainSemantics.cells).toEqual([{ x: 1, y: 1, surface: "land" }]);
  });

  it("rejects requested map identity mismatches and malformed v2 semantics", () => {
    expect(() => parseMapEditorState(serializeMapDocument(world("world-a")), "world-b")).toThrow(/identity/);
    expect(() => parseMapEditorState(JSON.stringify({
      schema: MAP_DOCUMENT_V2_SCHEMA,
      version: MAP_DOCUMENT_V2_VERSION,
      document: world(),
      terrainSemantics: { ...semantics(), version: 999 },
    }))).toThrow(/version/);
  });
});
