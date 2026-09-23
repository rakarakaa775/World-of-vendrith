import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseGameSaveSnapshot, serializeGameSaveSnapshot } from "../editor/game-save";

describe("Unified World + Exterior save", () => {
  it("stores World and Exterior in one game-save snapshot", () => {
    const world = createMap("world");
    world.id = "world-1";
    const exterior = createMap("playable", "region-1", "exterior");
    exterior.id = "exterior-1";

    const snapshot = serializeGameSaveSnapshot(world, exterior);
    const parsed = parseGameSaveSnapshot(snapshot);

    expect(parsed?.schema).toBe("vandrith.game-save");
    expect(parsed?.version).toBe(1);
    expect(parsed?.world.id).toBe("world-1");
    expect(parsed?.exterior?.id).toBe("exterior-1");
  });

  it("keeps the exterior optional for World-only saves", () => {
    const world = createMap("world");
    const snapshot = serializeGameSaveSnapshot(world, null);
    const parsed = parseGameSaveSnapshot(snapshot);

    expect(parsed?.world.id).toBe(world.id);
    expect(parsed?.exterior).toBeNull();
  });

  it("rejects non-unified snapshots so legacy World snapshots remain distinguishable", () => {
    const world = createMap("world");
    expect(parseGameSaveSnapshot(world)).toBeNull();
  });
});
