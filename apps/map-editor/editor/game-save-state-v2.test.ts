import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { serializeGameSaveSnapshot } from "./game-save";
import { parseGameSaveStateV2, parseGameSaveStateV2ForWorld, serializeGameSaveStateV2 } from "./game-save-state-v2";
import { initializeTerrainSemantics, parseMapEditorState } from "./map-editor-state-v2";
import { serializeMapDocument } from "./map-serialization";
import { TERRAIN_SEMANTICS_SCHEMA, TERRAIN_SEMANTICS_VERSION } from "./terrain-semantics";

const semantics = {
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells: [{ x: 1, y: 1, surface: "land" as const }],
};

function map(type: "world" | "playable", id: string) {
  return { ...createMap(type, null, "exterior", null, 32, 32), id, name: id };
}

function initialized(type: "world" | "playable", id: string) {
  return initializeTerrainSemantics(
    parseMapEditorState(serializeMapDocument(map(type, id))),
    semantics,
  );
}

describe("opt-in game save state v2 adapter", () => {
  it("round-trips initialized world and exterior semantics", () => {
    const parsed = parseGameSaveStateV2(serializeGameSaveStateV2(initialized("world", "w"), initialized("playable", "e")));
    expect(parsed?.version).toBe(2);
    expect(parsed?.world.kind).toBe("initialized");
    expect(parsed?.exterior?.kind).toBe("initialized");
    if (parsed?.world.kind === "initialized") expect(parsed.world.terrainSemantics.cells).toEqual(semantics.cells);
  });

  it("loads v1 save envelopes as legacy states without inferred semantics", () => {
    const legacy = serializeGameSaveSnapshot(map("world", "w"), map("playable", "e"));
    const parsed = parseGameSaveStateV2(legacy);
    expect(parsed?.world.kind).toBe("legacy");
    expect(parsed?.world.terrainSemantics).toBeNull();
    expect(parsed?.exterior?.kind).toBe("legacy");
    expect(parsed?.exterior?.terrainSemantics).toBeNull();
  });

  it("accepts a legacy map nested in a v2 envelope", () => {
    const parsed = parseGameSaveStateV2({
      schema: "vandrith.game-save", version: 2,
      world: map("world", "w"), exterior: null,
    });
    expect(parsed?.world.kind).toBe("legacy");
    expect(parsed?.world.terrainSemantics).toBeNull();
  });

  it("rejects malformed terrain semantics atomically", () => {
    const valid = JSON.parse(serializeGameSaveStateV2(initialized("world", "w"), null)) as Record<string, unknown>;
    const world = valid.world as Record<string, unknown>;
    world.terrainSemantics = { ...semantics, version: 999 };
    expect(parseGameSaveStateV2(valid)).toBeNull();
  });

  it("rejects invalid map types and unsupported envelope versions", () => {
    expect(() => serializeGameSaveStateV2(initialized("playable", "not-world"), null)).toThrow(/map types/);
    expect(parseGameSaveStateV2({
      schema: "vandrith.game-save", version: 99, world: map("world", "w"), exterior: null,
    })).toBeNull();
    expect(parseGameSaveStateV2({
      schema: "vandrith.game-save", version: 2, world: map("world", "w"), exterior: map("playable", "e"),
    })).toBeNull();
  });

  it("rejects an invalid exterior rather than returning a partial save", () => {
    expect(parseGameSaveStateV2({
      schema: "vandrith.game-save", version: 2,
      world: map("world", "w"), exterior: map("world", "not-exterior"),
    })).toBeNull();
  });

  it("rejects malformed and incomplete envelopes", () => {
    expect(parseGameSaveStateV2("{")).toBeNull();
    expect(parseGameSaveStateV2({ schema: "vandrith.game-save", version: 2, world: map("world", "w") })).toBeNull();
  });

  it("enforces the caller's authoritative world identity", () => {
    const payload = serializeGameSaveStateV2(initialized("world", "authoritative-world"), null);
    expect(parseGameSaveStateV2ForWorld(payload, "authoritative-world")?.world.document.id).toBe("authoritative-world");
    expect(parseGameSaveStateV2ForWorld(payload, "different-world")).toBeNull();
    expect(parseGameSaveStateV2ForWorld(payload, "   ")).toBeNull();
  });

});
