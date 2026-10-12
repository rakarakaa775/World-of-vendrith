import { describe, expect, it, vi } from 'vitest';
import { saveGameSlotAtomically, type AtomicGameSaveSlotRequest } from './game-save-slot-atomic-client';

function request(overrides: Partial<AtomicGameSaveSlotRequest> = {}): AtomicGameSaveSlotRequest {
  return {
    worldMapId: 'world-1',
    expectedWorldVersion: 3,
    worldSnapshot: { schema: 'vandrith.map-document', version: 1, document: { id: 'world-1', mapType: 'world' } },
    exteriorMapId: 'exterior-1',
    expectedExteriorVersion: 2,
    exteriorSnapshot: { schema: 'vandrith.map-document', version: 1, document: { id: 'exterior-1', mapType: 'playable', playableSpace: 'exterior' } },
    slotNumber: 2,
    label: '  Before voyage  ',
    slotSnapshot: { schema: 'vandrith.game-save', version: 1, world: { id: 'world-1' }, exterior: { id: 'exterior-1' } },
    ...overrides,
  };
}

const committed = {
  ok: true,
  slot_number: 2,
  world_version_id: 'world-version-4',
  world_version_number: 4,
  exterior_version_id: 'exterior-version-3',
  exterior_version_number: 3,
  projection_status: 'not_run',
  projection_error: null,
};

function client(data: unknown = committed, error: unknown | null = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) };
}

describe('saveGameSlotAtomically client contract', () => {
  it('sends World, Exterior and slot as one RPC request and parses the SQL success shape', async () => {
    const rpcClient = client(committed);
    const input = request();

    const result = await saveGameSlotAtomically(rpcClient, input);

    expect(result).toEqual(committed);
    expect(result).toMatchObject({ ok: true, slot_number: 2, world_version_number: 4, exterior_version_number: 3 });
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
    expect(rpcClient.rpc).toHaveBeenCalledWith('map_editor_save_game_slot_atomic_v1', {
      p_world_map_id: 'world-1',
      p_expected_world_version: 3,
      p_world_snapshot: input.worldSnapshot,
      p_exterior_map_id: 'exterior-1',
      p_expected_exterior_version: 2,
      p_exterior_snapshot: input.exteriorSnapshot,
      p_slot_number: 2,
      p_label: 'Before voyage',
      p_slot_snapshot: input.slotSnapshot,
    });
  });

  it('supports a World-only slot and requires null Exterior version fields', async () => {
    const rpcClient = client({
      ok: true,
      slot_number: 2,
      world_version_id: 'world-version-4',
      world_version_number: 4,
      exterior_version_id: null,
      exterior_version_number: null,
    });
    await saveGameSlotAtomically(rpcClient, request({
      exteriorMapId: null,
      expectedExteriorVersion: null,
      exteriorSnapshot: null,
      label: ' ',
    }));

    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
    expect(rpcClient.rpc).toHaveBeenCalledWith('map_editor_save_game_slot_atomic_v1', expect.objectContaining({
      p_exterior_map_id: null,
      p_expected_exterior_version: null,
      p_exterior_snapshot: null,
      p_label: 'Save Slot 2',
    }));
  });

  it('returns a server-declared conflict without treating it as a successful save', async () => {
    const rpcClient = client({
      ok: false,
      code: 'VERSION_CONFLICT',
      current_world_version: 4,
      current_exterior_version: 3,
    });

    await expect(saveGameSlotAtomically(rpcClient, request())).resolves.toEqual({
      ok: false,
      code: 'VERSION_CONFLICT',
      current_world_version: 4,
      current_exterior_version: 3,
    });
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
  });

  it('rejects a successful response for a different slot or malformed success data', async () => {
    await expect(saveGameSlotAtomically(client({ ...committed, slot_number: 3 }), request()))
      .rejects.toThrow(/mismatched World\/slot identity/);
    await expect(saveGameSlotAtomically(client({ ok: true, slot_number: 2 }), request()))
      .rejects.toThrow(/mismatched World\/slot identity/);
    await expect(saveGameSlotAtomically(client({ ok: false }), request()))
      .rejects.toThrow(/failure response must include a code/);
  });

  it('rejects invalid slot numbers before making any RPC call', async () => {
    const rpcClient = client();

    await expect(saveGameSlotAtomically(rpcClient, request({ slotNumber: 13 })))
      .rejects.toThrow(/slotNumber/);
    expect(rpcClient.rpc).not.toHaveBeenCalled();
  });

  it('rejects ambiguous Exterior payloads and duplicate map identities before writing', async () => {
    const rpcClient = client();

    await expect(saveGameSlotAtomically(rpcClient, request({
      exteriorMapId: null,
      expectedExteriorVersion: 1,
      exteriorSnapshot: null,
    }))).rejects.toThrow(/must be null/);

    await expect(saveGameSlotAtomically(rpcClient, request({
      exteriorMapId: 'world-1',
    }))).rejects.toThrow(/IDs must differ/);

    expect(rpcClient.rpc).not.toHaveBeenCalled();
  });

  it('rejects invalid version baselines and non-object snapshots before writing', async () => {
    const rpcClient = client();

    await expect(saveGameSlotAtomically(rpcClient, request({ expectedWorldVersion: -1 })))
      .rejects.toThrow(/expectedWorldVersion/);
    await expect(saveGameSlotAtomically(rpcClient, request({ expectedExteriorVersion: 1.5 })))
      .rejects.toThrow(/expectedExteriorVersion/);
    await expect(saveGameSlotAtomically(rpcClient, request({ worldSnapshot: [] as unknown as Record<string, unknown> })))
      .rejects.toThrow(/worldSnapshot/);
    await expect(saveGameSlotAtomically(rpcClient, request({ slotSnapshot: null as unknown as Record<string, unknown> })))
      .rejects.toThrow(/slotSnapshot/);
    await expect(saveGameSlotAtomically(rpcClient, request({ exteriorSnapshot: null })))
      .rejects.toThrow(/exteriorSnapshot/);

    expect(rpcClient.rpc).not.toHaveBeenCalled();
  });

  it('propagates transport errors without retrying or falling back to legacy writes', async () => {
    const failure = new Error('slot write failed');
    const rpcClient = client(null, failure);

    await expect(saveGameSlotAtomically(rpcClient, request())).rejects.toBe(failure);
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
    expect(rpcClient.rpc).toHaveBeenCalledWith('map_editor_save_game_slot_atomic_v1', expect.any(Object));
  });
});
