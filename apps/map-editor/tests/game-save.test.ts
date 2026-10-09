import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { parseGameSaveSlotSnapshot, parseGameSaveSnapshot, serializeGameSaveSnapshot } from "../editor/game-save";
import { serializeMapDocument } from "../editor/map-serialization";

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


describe("Save Slot snapshot format dispatch", () => {
  it("loads current Game Save v1 and validates authoritative World identity", () => {
    const world = createMap("world");
    world.id = "authoritative-world";
    const exterior = createMap("playable", "region-1", "exterior");
    exterior.id = "exterior-map";

    const parsed = parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(world, exterior), "authoritative-world");
    expect(parsed.format).toBe("game-save-v1");
    expect(parsed.world.id).toBe("authoritative-world");
    expect(parsed.exterior?.id).toBe("exterior-map");
  });

  it("keeps legacy single-map Save Slots loadable without inventing an exterior", () => {
    const world = createMap("world");
    world.id = "legacy-world";
    const parsed = parseGameSaveSlotSnapshot(serializeMapDocument(world), "legacy-world");

    expect(parsed.format).toBe("legacy-map-document-v1");
    expect(parsed.world.id).toBe("legacy-world");
    expect(parsed.exterior).toBeNull();
  });

  it("rejects mismatched world identity and unsupported schema versions", () => {
    const world = createMap("world");
    world.id = "world-a";
    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(world, null), "world-b"))
      .toThrow(/authoritative map/i);
    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.game-save", version: 2, world, exterior: null,
    }, "world-a")).toThrow(/unsupported Game Save snapshot version/i);
  });

  it("rejects a playable interior as the exterior without partially accepting the save", () => {
    const world = createMap("world");
    world.id = "world-with-interior";
    const interior = { ...createMap("playable", "region-1", "exterior"), id: "interior", playableSpace: "interior" as const, parentPlayableMapId: "parent-playable" };
    expect(() => parseGameSaveSlotSnapshot(
      serializeGameSaveSnapshot(world, interior),
      "world-with-interior",
    )).toThrow(/not an exterior playable map/i);
  });

  it("rejects an incomplete current Game Save envelope atomically", () => {
    const world = createMap("world");
    world.id = "incomplete-world";
    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.game-save", version: 1, world,
    }, "incomplete-world")).toThrow(/incomplete/i);
  });

  it("rejects a non-world map in the World slot", () => {
    const playable = createMap("playable", "region-1", "exterior");
    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(playable, null), playable.id))
      .toThrow(/not a World Map/i);
  });
});
