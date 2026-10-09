import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { createMapV2CrashRecoveryJournal } from "./map-crash-recovery-v2";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
} from "./terrain-semantics";
import type { MapDocumentV2State } from "./map-history-v2";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key: string) { return values.get(key) ?? null; },
    key(index: number) { return [...values.keys()][index] ?? null; },
    removeItem(key: string) { values.delete(key); },
    setItem(key: string, value: string) { values.set(key, String(value)); },
  } as Storage;
}

const state: MapDocumentV2State = {
  document: { ...createMap("world", null, "exterior", null, 32, 32), id: "recovery-world" },
  terrainSemantics: {
    schema: TERRAIN_SEMANTICS_SCHEMA,
    version: TERRAIN_SEMANTICS_VERSION,
    cells: [
      { x: 4, y: 4, surface: "land", feature: "shoreline" },
      { x: 5, y: 4, surface: "water", feature: "ocean_sea", depth: "deep" },
    ],
  },
};

describe("opt-in v2 crash recovery journal", () => {
  it("recovers the document and terrain semantics together", () => {
    const storage = createMemoryStorage();
    const journal = createMapV2CrashRecoveryJournal(storage);
    journal.write(state);

    expect(journal.has("recovery-world")).toBe(true);
    expect(journal.read("recovery-world")).toEqual(state);
  });

  it("does not return a recovery entry for a different map id", () => {
    const journal = createMapV2CrashRecoveryJournal(createMemoryStorage());
    journal.write(state);

    expect(journal.read("another-world")).toBeNull();
  });

  it("returns null for malformed recovery data", () => {
    const storage = createMemoryStorage();
    const journal = createMapV2CrashRecoveryJournal(storage);
    storage.setItem("vandrith.map-editor.recovery.v2.recovery-world", "{broken");

    expect(journal.read("recovery-world")).toBeNull();
  });

  it("clears only the requested map's recovery entry", () => {
    const storage = createMemoryStorage();
    const journal = createMapV2CrashRecoveryJournal(storage);
    journal.write(state);
    journal.clear("recovery-world");

    expect(journal.has("recovery-world")).toBe(false);
    expect(journal.read("recovery-world")).toBeNull();
  });
});
