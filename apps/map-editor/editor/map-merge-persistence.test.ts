import { describe, expect, it } from 'vitest';
import { createMapMergePersistence } from './map-merge-persistence';

describe('createMapMergePersistence', () => {
  it('passes the expected version and merged snapshot to the RPC', async () => {
    const calls: unknown[] = [];
    const persistence = createMapMergePersistence(async args => {
      calls.push(args);
      return { status: 'committed', version_id: 'v2', version_number: 2, current_version: 2 };
    });
    const result = await persistence.commitResolvedMerge('map-1', 1, { id: 'map-1' }, 'conflict-merge');
    expect(result.status).toBe('committed');
    expect(calls).toEqual([{ p_map_id: 'map-1', p_expected_version: 1, p_snapshot: { id: 'map-1' }, p_label: 'conflict-merge' }]);
  });

  it('propagates a stale-version conflict without converting it to success', async () => {
    const persistence = createMapMergePersistence(async () => ({ status: 'conflict', version_id: null, version_number: null, current_version: 3 }));
    await expect(persistence.commitResolvedMerge('map-1', 2, { id: 'map-1' })).resolves.toMatchObject({ status: 'conflict', current_version: 3 });
  });
});
