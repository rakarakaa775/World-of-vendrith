import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import {
  parseGameSaveStateV2,
  parseGameSaveStateV2ForWorld,
  serializeGameSaveStateV2,
} from "./game-save-state-v2";
import { initializeTerrainSemantics } from "./map-editor-state-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "./terrain-semantics";

const worldDocument = {
  ...createMap("world", null, "exterior", null, 8, 8),
  id: "save-state-world",
};

const legacyWorld = {
  kind: "legacy" as const,
  document: worldDocument,
  terrainSemantics: null,
};

const initializedWorld = initializeTerrainSemantics(legacyWorld, {
  schema: TERRAIN_SEMANTICS_SCHEMA,
  version: TERRAIN_SEMANTICS_VERSION,
  cells: [
    { x: 2, y: 3, surface: "water" as const, feature: "river" as const, depth: "shallow" as const },
  ],
});

describe("atomic game save state v2", () => {
  it("round-trips initialized terrain semantics with the world snapshot", () => {
    const serialized = serializeGameSaveStateV2(initializedWorld, null);
    const parsed = parseGameSaveStateV2(serialized);

    expect(parsed).not.toBeNull();
    expect(parsed?.world).toEqual(initializedWorld);
    expect(parsed?.exterior).toBeNull();
  });

  it("keeps legacy world saves explicitly uninitialized", () => {
    const parsed = parseGameSaveStateV2(serializeGameSaveStateV2(legacyWorld, null));

    expect(parsed?.world).toEqual(legacyWorld);
    if (parsed?.world.kind === "legacy") {
      expect(parsed.world.terrainSemantics).toBeNull();
    } else {
      throw new Error("Expected legacy world state");
    }
  });

  it("rejects malformed nested terrain semantics atomically", () => {
    const payload = JSON.parse(serializeGameSaveStateV2(initializedWorld, null));
    payload.world.terrainSemantics.cells.push({
      x: 2,
      y: 3,
      surface: "land",
    });

    expect(parseGameSaveStateV2(payload)).toBeNull();
  });

  it("reads version 1 game saves without inferring Terrain v2 semantics", () => {
    const legacyPayload = {
      schema: "vandrith.game-save",
      version: 1,
      world: worldDocument,
      exterior: null,
    };

    const parsed = parseGameSaveStateV2(legacyPayload);

    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe(2);
    expect(parsed?.world.kind).toBe("legacy");
    if (parsed?.world.kind === "legacy") {
      expect(parsed.world.terrainSemantics).toBeNull();
    } else {
      throw new Error("Expected legacy world state");
    }
  });

  it("enforces the authoritative world identity after parsing", () => {
    const serialized = serializeGameSaveStateV2(initializedWorld, null);

    expect(parseGameSaveStateV2ForWorld(serialized, "save-state-world")).not.toBeNull();
    expect(parseGameSaveStateV2ForWorld(serialized, "different-world")).toBeNull();
    expect(parseGameSaveStateV2ForWorld(serialized, "   ")).toBeNull();
  });
});
