import { describe, expect, it, vi } from 'vitest';
import { saveWithConflictDetection } from './map-conflict-save-controller';

const map = (name: string) => ({ id: 'm1', name, mapType: 'world', parentMapId: null, width: 1, height: 1, tileSize: 1, playableSpace: null, parentPlayableMapId: null, layers: [] } as never);

describe('saveWithConflictDetection', () => {
  it('opens a conflict when the authoritative version advanced', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { ok: true, found: true, version_number: 2, snapshot: map('remote') }, error: null });
    const result = await saveWithConflictDetection({ rpc } as never, map('local'), map('base'), 1);
    expect(result.status).toBe('conflict');
    if (result.status === 'conflict') expect(result.remoteVersion).toBe(2);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
