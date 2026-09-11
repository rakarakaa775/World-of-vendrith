import type { MapDocument } from './map-document';
import type { MapMergeResult } from './map-entity-merge';
import type { ConflictResolutionSession } from './map-conflict-resolution-ui-model';
import { applyResolution } from './map-conflict-resolution-ui-model';
import { normalizeMergeCommitResponse, type MapMergePersistence, type MergePersistenceCommit, type MergePersistenceConflict } from './map-merge-persistence';
import { serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';

export type ConflictCommitResult =
  | { status: 'committed'; document: MapDocument; commit: MergePersistenceCommit }
  | { status: 'conflict'; document: MapDocument; conflict: MergePersistenceConflict };

export async function commitResolvedConflict(
  persistence: MapMergePersistence,
  mapId: string,
  expectedVersion: number,
  result: MapMergeResult,
  session: ConflictResolutionSession,
): Promise<ConflictCommitResult> {
  const document = applyResolution(result, session);
  const response = await persistence.commitResolvedMerge(
    mapId,
    expectedVersion,
    serializeResolvedMapSnapshot(document),
    'conflict-resolution',
  );
  const commit = normalizeMergeCommitResponse(response);
  if (commit.status === 'conflict') return { status: 'conflict', document, conflict: commit };
  return { status: 'committed', document, commit };
}
