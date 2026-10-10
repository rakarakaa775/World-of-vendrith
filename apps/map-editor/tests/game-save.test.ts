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

  it("loads a JSON-stringified current Game Save v1 envelope", () => {
    const world = createMap("world");
    world.id = "stringified-world";
    const exterior = createMap("playable", "region-1", "exterior");
    exterior.id = "stringified-exterior";
    const snapshot = JSON.stringify(serializeGameSaveSnapshot(world, exterior));

    const parsed = parseGameSaveSlotSnapshot(snapshot, "stringified-world");

    expect(parsed.format).toBe("game-save-v1");
    expect(parsed.world.id).toBe("stringified-world");
    expect(parsed.exterior?.id).toBe("stringified-exterior");
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

describe("Save Slot parser malformed payload regression", () => {
  it("rejects malformed JSON strings without returning a partial save", () => {
    expect(() => parseGameSaveSlotSnapshot("{not-json", "world-1")).toThrow();
  });

  it("rejects an exterior whose map type is not playable", () => {
    const world = createMap("world");
    world.id = "world-exterior-type";
    const invalidExterior = { ...createMap("world"), id: "not-playable" };

    expect(() => parseGameSaveSlotSnapshot(
      serializeGameSaveSnapshot(world, invalidExterior),
      "world-exterior-type",
    )).toThrow(/exterior playable map/i);
  });

  it("rejects JSON arrays instead of treating them as snapshot objects", () => {
    expect(() => parseGameSaveSlotSnapshot("[]", "world-1")).toThrow(/must be an object/i);
  });

  it("rejects a current Game Save envelope when the exterior key is absent", () => {
    const world = createMap("world");
    world.id = "missing-exterior-key";

    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.game-save",
      version: 1,
      world,
    }, "missing-exterior-key")).toThrow(/incomplete/i);
  });

  it("rejects legacy map-document snapshots with unsupported versions", () => {
    const world = createMap("world");
    world.id = "legacy-version-world";

    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.map-document",
      version: 2,
      document: world,
    }, "legacy-version-world")).toThrow(/unsupported Save Slot snapshot schema/i);
  });

  it("rejects unknown Save Slot snapshot schemas", () => {
    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.unknown-save",
      version: 1,
      world: createMap("world"),
      exterior: null,
    }, "world-1")).toThrow(/unsupported Save Slot snapshot schema/i);
  });

  it("rejects an exterior array instead of accepting it as a map document", () => {
    const world = createMap("world");
    world.id = "array-exterior-world";

    expect(() => parseGameSaveSlotSnapshot({
      schema: "vandrith.game-save",
      version: 1,
      world,
      exterior: [],
    }, "array-exterior-world")).toThrow(/invalid/i);
  });

  it("rejects legacy snapshots whose World identity does not match the authoritative map", () => {
    const world = createMap("world");
    world.id = "legacy-world-a";

    expect(() => parseGameSaveSlotSnapshot(
      serializeMapDocument(world),
      "legacy-world-b",
    )).toThrow();
  });
});
