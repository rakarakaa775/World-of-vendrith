import { describe, expect, it, vi } from 'vitest';
import { loadGameSlotValidated } from './game-load-slot-validated-client';

function client(data: unknown, error: unknown | null = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) };
}

const success = {
  ok: true,
  map_id: 'world-1',
  slot_number: 2,
  label: 'Before voyage',
  version_id: 'version-7',
  version_number: 7,
  snapshot: {
    schema: 'vandrith.game-save',
    version: 1,
    world: { id: 'world-1', mapType: 'world' },
    exterior: null,
  },
  updated_at: '2026-10-12T00:00:00.000Z',
};

describe('loadGameSlotValidated', () => {
  it('calls only the validated server RPC and returns a parsed success', async () => {
    const rpcClient = client(success);

    await expect(loadGameSlotValidated(rpcClient, 'world-1', 2)).resolves.toEqual(success);

    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
    expect(rpcClient.rpc).toHaveBeenCalledWith('map_editor_load_save_slot_validated_v1', {
      p_map_id: 'world-1',
      p_slot_number: 2,
    });
  });

  it('returns stable server-declared failures without reading slot tables', async () => {
    const rpcClient = client({ ok: false, code: 'SLOT_EMPTY', slot_number: 2 });

    await expect(loadGameSlotValidated(rpcClient, 'world-1', 2)).resolves.toEqual({
      ok: false,
      code: 'SLOT_EMPTY',
      slot_number: 2,
    });
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid map IDs and slot numbers before making an RPC call', async () => {
    const rpcClient = client(success);

    await expect(loadGameSlotValidated(rpcClient, ' ', 2)).rejects.toThrow(/worldMapId/);
    await expect(loadGameSlotValidated(rpcClient, 'world-1', 0)).rejects.toThrow(/slotNumber/);
    await expect(loadGameSlotValidated(rpcClient, 'world-1', 13)).rejects.toThrow(/slotNumber/);
    expect(rpcClient.rpc).not.toHaveBeenCalled();
  });

  it('rejects malformed success responses instead of passing unvalidated data through', async () => {
    const rpcClient = client({ ok: true, snapshot: [] });

    await expect(loadGameSlotValidated(rpcClient, 'world-1', 2))
      .rejects.toThrow(/missing validated slot fields/);
  });

  it('rejects malformed failure responses without an error code', async () => {
    const rpcClient = client({ ok: false });

    await expect(loadGameSlotValidated(rpcClient, 'world-1', 2))
      .rejects.toThrow(/failure response must include a code/);
  });

  it('propagates transport errors and does not fall back to direct table reads', async () => {
    const failure = new Error('load RPC unavailable');
    const rpcClient = client(null, failure);

    await expect(loadGameSlotValidated(rpcClient, 'world-1', 2)).rejects.toBe(failure);
    expect(rpcClient.rpc).toHaveBeenCalledTimes(1);
  });
});
