import { describe, expect, it } from "vitest";
import {
  normalizeSaveSlotRpcResult,
  parseSaveSlotSnapshot,
  validateSaveSlotRpcResult,
} from "./map-save-slot";

const snapshot = {
  schema: "vandrith.game-save",
  version: 1,
  world: { id: "world-1" },
  exterior: null,
};

describe("map save-slot RPC contract", () => {
  it("normalizes a PostgREST array response", () => {
    expect(normalizeSaveSlotRpcResult([{ ok: true, map_id: "map-1", slot_number: 1 }]))
      .toEqual({ ok: true, map_id: "map-1", slot_number: 1 });
  });

  it("rejects a response for another map or slot", () => {
    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "other-map", slot_number: 1, version_id: "v1", version_number: 1, snapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_MAP_MISMATCH");

    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 2, version_id: "v1", version_number: 1, snapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_NUMBER_MISMATCH");
  });

  it("requires version metadata and a snapshot", () => {
    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 1, snapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_VERSION_METADATA_MISSING");

    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 1, version_id: "v1", version_number: 1 },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_SNAPSHOT_MISSING");
  });

  it("parses only the canonical game-save envelope", () => {
    expect(parseSaveSlotSnapshot({ ok: true, snapshot: JSON.stringify(snapshot) })).toEqual(snapshot);
    expect(() => parseSaveSlotSnapshot({ ok: true, snapshot: { schema: "other", version: 1 } }))
      .toThrow("INVALID_GAME_SAVE_SNAPSHOT");
  });
});
