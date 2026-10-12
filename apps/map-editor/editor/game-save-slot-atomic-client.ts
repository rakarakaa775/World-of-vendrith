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

export type AtomicGameSaveSlotSuccess = {
  ok: true;
  slot_number: number;
  world_version_id: string;
  world_version_number: number;
  exterior_version_id: string | null;
  exterior_version_number: number | null;
  projection_status?: string;
  projection_error?: string | null;
};

export type AtomicGameSaveSlotFailure = {
  ok: false;
  code: string;
  current_world_version?: number;
  current_exterior_version?: number | null;
};

export type AtomicGameSaveSlotResult = AtomicGameSaveSlotSuccess | AtomicGameSaveSlotFailure;

export type AtomicRpcClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown | null }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

function parseResult(value: unknown, request: AtomicGameSaveSlotRequest): AtomicGameSaveSlotResult {
  if (!isRecord(value) || typeof value.ok !== 'boolean') {
    throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: expected an object with an ok flag');
  }

  if (value.ok === false) {
    if (typeof value.code !== 'string' || value.code.trim() === '') {
      throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: failure response must include a code');
    }
    return {
      ok: false,
      code: value.code,
      ...(typeof value.current_world_version === 'number' ? { current_world_version: value.current_world_version } : {}),
      ...(typeof value.current_exterior_version === 'number' || value.current_exterior_version === null
        ? { current_exterior_version: value.current_exterior_version as number | null }
        : {}),
    };
  }

  if (
    !Number.isInteger(value.slot_number)
    || value.slot_number !== request.slotNumber
    || typeof value.world_version_id !== 'string'
    || value.world_version_id.trim() === ''
    || typeof value.world_version_number !== 'number'
    || !Number.isInteger(value.world_version_number)
    || value.world_version_number < 1
  ) {
    throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: success response has missing or mismatched World/slot identity');
  }

  const exteriorVersionId = value.exterior_version_id;
  const exteriorVersionNumber = value.exterior_version_number;
  if (request.exteriorMapId === null) {
    if (exteriorVersionId !== null || exteriorVersionNumber !== null) {
      throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: World-only success must have null Exterior version fields');
    }
  } else if (
    typeof exteriorVersionId !== 'string'
    || exteriorVersionId.trim() === ''
    || typeof exteriorVersionNumber !== 'number'
    || !Number.isInteger(exteriorVersionNumber)
    || exteriorVersionNumber < 1
  ) {
    throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: success response has invalid Exterior version fields');
  }

  if (value.projection_status !== undefined && typeof value.projection_status !== 'string') {
    throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: projection_status must be a string when present');
  }
  if (value.projection_error !== undefined && value.projection_error !== null && typeof value.projection_error !== 'string') {
    throw new Error('ATOMIC_SAVE_INVALID_RESPONSE: projection_error must be a string or null when present');
  }

  return {
    ok: true,
    slot_number: value.slot_number as number,
    world_version_id: value.world_version_id,
    world_version_number: value.world_version_number,
    exterior_version_id: exteriorVersionId as string | null,
    exterior_version_number: exteriorVersionNumber as number | null,
    ...(typeof value.projection_status === 'string' ? { projection_status: value.projection_status } : {}),
    ...(typeof value.projection_error === 'string' || value.projection_error === null
      ? { projection_error: value.projection_error as string | null }
      : {}),
  };
}

/**
 * Submit one request to the future atomic RPC. This function does not retry,
 * split the operation into multiple writes, or fall back to legacy RPCs.
 * Server-declared failures remain explicit results; malformed responses throw.
 */
export async function saveGameSlotAtomically(
  client: AtomicRpcClient,
  request: AtomicGameSaveSlotRequest,
): Promise<AtomicGameSaveSlotResult> {
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
  return parseResult(data, request);
}
