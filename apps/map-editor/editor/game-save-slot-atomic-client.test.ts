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

function client(data: unknown = { status: 'committed' }, error: unknown | null = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) };
}

describe('saveGameSlotAtomically client contract', () => {
  it('sends World, Exterior and slot as one RPC request', async () => {
    const rpcClient = client({ status: 'committed', slot_number: 2 });
    const input = request();

    const result = await saveGameSlotAtomically(rpcClient, input);

    expect(result).toEqual({ status: 'committed', slot_number: 2 });
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

  it('supports a World-only slot with all Exterior fields null', async () => {
    const rpcClient = client();
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

  it('propagates RPC errors without retrying or falling back to legacy writes', async () => {
    const failure = new Error('slot write failed');
    const rpcClient = client(null, failure);

    await expect(saveGameSlotAtomically(rpcClient, request())).rejects.toBe(failure);
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
    expect(rpcClient.rpc).toHaveBeenCalledWith('map_editor_save_game_slot_atomic_v1', expect.any(Object));
  });
});
