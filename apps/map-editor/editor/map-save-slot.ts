import type { GameSaveSnapshot } from "./game-save";
import { parseGameSaveSnapshot } from "./game-save";

export type SaveSlotRpcResult = {
  ok: boolean;
  map_id?: string;
  slot_number?: number;
  label?: string;
  version_id?: string | null;
  version_number?: number;
  snapshot?: unknown;
  updated_at?: string;
  code?: string;
};

export function normalizeSaveSlotRpcResult(data: unknown): SaveSlotRpcResult | null {
  if (Array.isArray(data)) data = data[0];
  if (!data || typeof data !== "object") return null;
  return data as SaveSlotRpcResult;
}

export function validateSaveSlotRpcResult(
  data: unknown,
  expected: { mapId: string; slotNumber: number },
): SaveSlotRpcResult {
  const result = normalizeSaveSlotRpcResult(data);
  if (!result?.ok) throw new Error(result?.code || "SAVE_SLOT_FAILED");
  if (result.map_id !== expected.mapId) throw new Error("SAVE_SLOT_MAP_MISMATCH");
  if (Number(result.slot_number) !== expected.slotNumber) throw new Error("SAVE_SLOT_NUMBER_MISMATCH");
  if (!result.version_id || Number(result.version_number) < 1) throw new Error("SAVE_SLOT_VERSION_METADATA_MISSING");
  if (result.snapshot === null || result.snapshot === undefined) throw new Error("SAVE_SLOT_SNAPSHOT_MISSING");
  return result;
}

export function parseSaveSlotSnapshot(result: SaveSlotRpcResult): GameSaveSnapshot {
  const parsed = parseGameSaveSnapshot(result.snapshot);
  if (!parsed) throw new Error("INVALID_GAME_SAVE_SNAPSHOT");
  return parsed;
}
