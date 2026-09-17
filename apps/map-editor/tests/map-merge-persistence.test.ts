import { describe, expect, it } from 'vitest';
import { normalizeMergeCommitResponse, type MergeCommitResponse } from '../editor/map-merge-persistence';

const committed = (overrides: Partial<MergeCommitResponse> = {}): MergeCommitResponse => ({
  status: 'committed',
  version_id: 'version-1',
  version_number: 4,
  current_version: 4,
  projection_status: 'committed',
  projection_error: null,
  ...overrides,
});

describe('Map merge persistence response boundary', () => {
  it('preserves a committed version and successful projection status', () => {
    expect(normalizeMergeCommitResponse([committed()])).toEqual({
      status: 'committed',
      versionId: 'version-1',
      versionNumber: 4,
      currentVersion: 4,
      projectionStatus: 'committed',
      projectionError: null,
    });
  });

  it('preserves an authoritative commit when projection fails', () => {
    expect(normalizeMergeCommitResponse(committed({
      projection_status: 'failed',
      projection_error: 'navigation projection failed',
    }))).toEqual({
      status: 'committed',
      versionId: 'version-1',
      versionNumber: 4,
      currentVersion: 4,
      projectionStatus: 'failed',
      projectionError: 'navigation projection failed',
    });
  });

  it('normalizes optimistic concurrency conflicts without version metadata', () => {
    expect(normalizeMergeCommitResponse({
      status: 'conflict',
      version_id: null,
      version_number: null,
      current_version: 5,
      projection_status: 'not_run',
      projection_error: null,
    })).toEqual({ status: 'conflict', currentVersion: 5 });
  });

  it('rejects a committed response without projection status', () => {
    expect(() => normalizeMergeCommitResponse(committed({ projection_status: undefined as never })))
      .toThrow('Merge commit returned committed status without projection status');
  });

  it('rejects a committed response without version metadata', () => {
    expect(() => normalizeMergeCommitResponse(committed({ version_id: null })))
      .toThrow('Merge commit returned committed status without version metadata');
  });
});
