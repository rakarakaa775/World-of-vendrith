export type MergeCommitStatus = 'committed' | 'conflict';

export type MergeCommitResponse = {
  status: MergeCommitStatus;
  version_id: string | null;
  version_number: number | null;
  current_version: number;
};

export type MapMergePersistence = {
  commitResolvedMerge: (
    mapId: string,
    expectedVersion: number,
    snapshot: Record<string, unknown>,
    label?: string,
  ) => Promise<MergeCommitResponse>;
};

export type MergeRpcInvoker = (args: {
  p_map_id: string;
  p_expected_version: number;
  p_snapshot: Record<string, unknown>;
  p_label: string;
}) => Promise<MergeCommitResponse>;

export function createMapMergePersistence(invoker: MergeRpcInvoker): MapMergePersistence {
  return {
    commitResolvedMerge: (mapId, expectedVersion, snapshot, label = 'merge') =>
      invoker({
        p_map_id: mapId,
        p_expected_version: expectedVersion,
        p_snapshot: snapshot,
        p_label: label,
      }),
  };
}

export type MergePersistenceConflict = {
  status: 'conflict';
  currentVersion: number;
};

export type MergePersistenceCommit = {
  status: 'committed';
  versionId: string;
  versionNumber: number;
  currentVersion: number;
};

/**
 * Supabase/PostgREST returns RETURNS TABLE RPCs as an array of rows.
 * Normalize both the table-RPC array form and the object form so the
 * editor does not mistake a successful commit for missing version data.
 */
export function normalizeMergeCommitResponse(response: MergeCommitResponse | MergeCommitResponse[]): MergePersistenceCommit | MergePersistenceConflict {
  const normalized = Array.isArray(response) ? response[0] : response;
  if (!normalized) throw new Error('Merge commit returned no result row');

  if (normalized.status === 'conflict') {
    return { status: 'conflict', currentVersion: normalized.current_version };
  }
  if (!normalized.version_id || normalized.version_number == null) {
    throw new Error('Merge commit returned committed status without version metadata');
  }
  return {
    status: 'committed',
    versionId: normalized.version_id,
    versionNumber: normalized.version_number,
    currentVersion: normalized.current_version,
  };
}
