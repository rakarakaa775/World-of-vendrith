/**
 * Client adapter for the candidate server-validated Load Slot RPC.
 *
 * This adapter is intentionally not wired into the active editor until the
 * candidate migration and authenticated Save -> Load -> Save tests pass.
 * It does not read the save-slot table directly or fall back to legacy reads.
 */

export type ValidatedLoadSlotRpcClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown | null }>;
};

export type ValidatedLoadSlotSuccess = {
  ok: true;
  map_id: string;
  slot_number: number;
  label: string;
  version_id: string;
  version_number: number;
  snapshot: Record<string, unknown>;
  updated_at?: string;
};

export type ValidatedLoadSlotFailure = {
  ok: false;
  code: string;
  slot_number?: number;
};

export type ValidatedLoadSlotResult = ValidatedLoadSlotSuccess | ValidatedLoadSlotFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseResult(value: unknown): ValidatedLoadSlotResult {
  if (!isRecord(value) || typeof value.ok !== 'boolean') {
    throw new Error('LOAD_SLOT_INVALID_RESPONSE: expected an object with an ok flag');
  }

  if (value.ok === false) {
    if (typeof value.code !== 'string' || value.code.trim() === '') {
      throw new Error('LOAD_SLOT_INVALID_RESPONSE: failure response must include a code');
    }
    return {
      ok: false,
      code: value.code,
      ...(typeof value.slot_number === 'number' ? { slot_number: value.slot_number } : {}),
    };
  }

  if (
    typeof value.map_id !== 'string'
    || typeof value.slot_number !== 'number'
    || !Number.isInteger(value.slot_number)
    || typeof value.label !== 'string'
    || typeof value.version_id !== 'string'
    || typeof value.version_number !== 'number'
    || !Number.isInteger(value.version_number)
    || !isRecord(value.snapshot)
  ) {
    throw new Error('LOAD_SLOT_INVALID_RESPONSE: success response is missing validated slot fields');
  }

  return {
    ok: true,
    map_id: value.map_id,
    slot_number: value.slot_number,
    label: value.label,
    version_id: value.version_id,
    version_number: value.version_number,
    snapshot: value.snapshot,
    ...(typeof value.updated_at === 'string' ? { updated_at: value.updated_at } : {}),
  };
}

/**
 * Ask the server to validate the slot and its canonical version references.
 * Server-declared failures are returned as a discriminated result; transport
 * errors are thrown. No direct table read or legacy fallback is performed.
 */
export async function loadGameSlotValidated(
  client: ValidatedLoadSlotRpcClient,
  worldMapId: string,
  slotNumber: number,
): Promise<ValidatedLoadSlotResult> {
  if (typeof worldMapId !== 'string' || worldMapId.trim() === '') {
    throw new Error('LOAD_SLOT_INVALID: worldMapId is required');
  }
  if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > 12) {
    throw new Error('LOAD_SLOT_INVALID: slotNumber must be an integer from 1 through 12');
  }

  const { data, error } = await client.rpc('map_editor_load_save_slot_validated_v1', {
    p_map_id: worldMapId,
    p_slot_number: slotNumber,
  });
  if (error) throw error;
  const result = parseResult(data);
  if (result.ok && result.map_id !== worldMapId) {
    throw new Error('LOAD_SLOT_IDENTITY_MISMATCH: response World ID does not match the requested World');
  }
  if (result.ok && result.slot_number !== slotNumber) {
    throw new Error('LOAD_SLOT_IDENTITY_MISMATCH: response slot number does not match the requested slot');
  }
  return result;
}
