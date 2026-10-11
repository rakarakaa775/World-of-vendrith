/**
 * Client adapter for the future single-transaction Game Save Slot RPC.
 *
 * Deliberately not wired into the active editor until
 * map_editor_save_game_slot_atomic_v1 exists and passes isolated database tests.
 * Never add a legacy multi-RPC fallback here: that would restore the partial-save
 * failure mode this adapter is intended to prevent.
 */

export type AtomicGameSaveSlotRequest = {
  worldMapId: string;
  expectedWorldVersion: number;
  worldSnapshot: Record<string, unknown>;
  exteriorMapId: string | null;
  expectedExteriorVersion: number | null;
  exteriorSnapshot: Record<string, unknown> | null;
  slotNumber: number;
  label: string;
  slotSnapshot: Record<string, unknown>;
};

export type AtomicRpcClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown | null }>;
};

function requireNonEmpty(value: string, name: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`ATOMIC_SAVE_INVALID: ${name} is required`);
  }
}

function requireVersion(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`ATOMIC_SAVE_INVALID: ${name} must be a non-negative integer`);
  }
}

function requireObject(value: unknown, name: string): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`ATOMIC_SAVE_INVALID: ${name} must be an object`);
  }
}

/**
 * Submit one request to the future atomic RPC. This function does not retry,
 * split the operation into multiple writes, or fall back to legacy RPCs.
 */
export async function saveGameSlotAtomically(
  client: AtomicRpcClient,
  request: AtomicGameSaveSlotRequest,
): Promise<unknown> {
  requireNonEmpty(request.worldMapId, 'worldMapId');
  requireVersion(request.expectedWorldVersion, 'expectedWorldVersion');
  requireObject(request.worldSnapshot, 'worldSnapshot');
  requireObject(request.slotSnapshot, 'slotSnapshot');

  if (!Number.isInteger(request.slotNumber) || request.slotNumber < 1 || request.slotNumber > 12) {
    throw new Error('ATOMIC_SAVE_INVALID: slotNumber must be an integer from 1 through 12');
  }

  if (request.exteriorMapId === null) {
    if (request.expectedExteriorVersion !== null || request.exteriorSnapshot !== null) {
      throw new Error('ATOMIC_SAVE_INVALID: exterior version and snapshot must be null without an exterior map ID');
    }
  } else {
    requireNonEmpty(request.exteriorMapId, 'exteriorMapId');
    if (request.exteriorMapId === request.worldMapId) {
      throw new Error('ATOMIC_SAVE_INVALID: World and Exterior IDs must differ');
    }
    if (request.expectedExteriorVersion === null) {
      throw new Error('ATOMIC_SAVE_INVALID: expectedExteriorVersion is required for an exterior map');
    }
    requireVersion(request.expectedExteriorVersion, 'expectedExteriorVersion');
    requireObject(request.exteriorSnapshot, 'exteriorSnapshot');
  }

  const { data, error } = await client.rpc('map_editor_save_game_slot_atomic_v1', {
    p_world_map_id: request.worldMapId,
    p_expected_world_version: request.expectedWorldVersion,
    p_world_snapshot: request.worldSnapshot,
    p_exterior_map_id: request.exteriorMapId,
    p_expected_exterior_version: request.expectedExteriorVersion,
    p_exterior_snapshot: request.exteriorSnapshot,
    p_slot_number: request.slotNumber,
    p_label: request.label.trim() || `Save Slot ${request.slotNumber}`,
    p_slot_snapshot: request.slotSnapshot,
  });

  if (error) throw error;
  return data;
}
