import { describe, expect, it } from "vitest";
import {
  normalizeSaveSlotRpcResult,
  parseSaveSlotSnapshot,
  validateSaveSlotRpcResult,
} from "./map-save-slot";

const validSnapshot = {
  schema: "vandrith.game-save" as const,
  version: 1 as const,
  world: {
    schema: "vandrith.map-document" as const,
    version: 1 as const,
    document: {
      version: 1 as const,
      id: "world-1",
      name: "World",
      mapType: "world" as const,
      parentMapId: null,
      width: 1,
      height: 1,
      tileSize: 32,
      layers: [
        { id: "ground", name: "Ground", kind: "ground" as const, visible: true, locked: false, active: true, cells: [{ tileId: null }] }
      ],
    },
  },
  exterior: null,
};

describe("map save-slot RPC contract", () => {
  it("normalizes a PostgREST array response", () => {
    expect(normalizeSaveSlotRpcResult([{ ok: true, map_id: "map-1", slot_number: 1 }]))
      .toEqual({ ok: true, map_id: "map-1", slot_number: 1 });
  });

  it("rejects a response for another map or slot", () => {
    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "other-map", slot_number: 1, version_id: "v1", version_number: 1, snapshot: validSnapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_MAP_MISMATCH");

    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 2, version_id: "v1", version_number: 1, snapshot: validSnapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_NUMBER_MISMATCH");
  });

  it("requires version metadata and a snapshot", () => {
    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 1, snapshot: validSnapshot },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_VERSION_METADATA_MISSING");

    expect(() => validateSaveSlotRpcResult(
      { ok: true, map_id: "map-1", slot_number: 1, version_id: "v1", version_number: 1 },
      { mapId: "map-1", slotNumber: 1 },
    )).toThrow("SAVE_SLOT_SNAPSHOT_MISSING");
  });

  it("parses the canonical game-save envelope with the existing strict parser", () => {
    expect(parseSaveSlotSnapshot({ ok: true, snapshot: validSnapshot }).schema).toBe("vandrith.game-save");
    expect(() => parseSaveSlotSnapshot({ ok: true, snapshot: { schema: "other", version: 1 } }))
      .toThrow("INVALID_GAME_SAVE_SNAPSHOT");
  });
});
