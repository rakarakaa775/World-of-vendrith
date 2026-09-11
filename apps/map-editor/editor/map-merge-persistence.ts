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
