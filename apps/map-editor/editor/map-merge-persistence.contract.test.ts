import { describe, expect, it } from 'vitest';
import { createMapMergePersistence, normalizeMergeCommitResponse } from './map-merge-persistence';

describe('merge persistence contract', () => {
  it('normalizes PostgREST table-RPC array responses', () => {
    const result = normalizeMergeCommitResponse([{
      status: 'committed',
      version_id: 'v2',
      version_number: 2,
      current_version: 2,
      projection_status: 'committed',
      projection_error: null,
    }]);

    expect(result).toEqual({
      status: 'committed',
      versionId: 'v2',
      versionNumber: 2,
      currentVersion: 2,
      projectionStatus: 'committed',
      projectionError: null,
    });
  });

  it('rejects a committed response without version metadata', () => {
    expect(() => normalizeMergeCommitResponse({
      status: 'committed',
      version_id: null,
      version_number: null,
      current_version: 2,
      projection_status: 'committed',
      projection_error: null,
    })).toThrow('committed status without version metadata');
  });

  it('preserves stale-version conflicts', () => {
    const result = normalizeMergeCommitResponse({
      status: 'conflict',
      version_id: null,
      version_number: null,
      current_version: 4,
      projection_status: 'not_run',
      projection_error: null,
    });

    expect(result).toEqual({ status: 'conflict', currentVersion: 4 });
  });

  it('keeps the RPC adapter thin', async () => {
    const calls: unknown[] = [];
    const persistence = createMapMergePersistence(async args => {
      calls.push(args);
      return { status: 'conflict', version_id: null, version_number: null, current_version: 3 };
    });

    await persistence.commitResolvedMerge('map-1', 2, { id: 'map-1' });
    expect(calls).toEqual([{
      p_map_id: 'map-1',
      p_expected_version: 2,
      p_snapshot: { id: 'map-1' },
      p_label: 'merge',
    }]);
  });
});
