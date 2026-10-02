import type { MapDocument } from './map-document';
import { mergeMapDocumentsThreeWay, type MapMergeResult } from './map-entity-merge';
import { createSupabaseMapMergePersistence, serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';
import { loadMapDocumentSnapshot } from './map-persistence';
import { normalizeMergeCommitResponse, type ProjectionStatus } from './map-merge-persistence';
import { parseMapDocument } from './map-serialization';
import { assertTerrainPreserved, formatTerrainTrace, traceTerrain } from './map-save-trace';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ConflictSaveResult =
  | { status: 'committed'; document: MapDocument; version: number; projectionStatus: ProjectionStatus; projectionError: string | null }
  | { status: 'conflict'; merge: MapMergeResult; expectedVersion: number; remoteVersion: number; remoteDocument: MapDocument }
  | { status: 'error'; error: unknown };

export async function saveWithConflictDetection(
  client: SupabaseClient,
  local: MapDocument,
  base: MapDocument,
  expectedVersion: number,
): Promise<ConflictSaveResult> {
  try {
    const remote = await loadMapDocumentSnapshot(client, local.id);
    const remoteDocument = remote.document;
    const remoteVersion = remote.result.version_number ?? 0;
    if (!remoteDocument) return { status: 'error', error: new Error('Authoritative map snapshot is unavailable') };

    const localTrace = traceTerrain(local, 'local', expectedVersion);
    const baseTrace = traceTerrain(base, 'base', expectedVersion);
    const remoteTrace = traceTerrain(remoteDocument, 'remote', remoteVersion);
    console.info('[MAP SAVE TRACE]', formatTerrainTrace(localTrace));
    console.info('[MAP SAVE TRACE]', formatTerrainTrace(baseTrace));
    console.info('[MAP SAVE TRACE]', formatTerrainTrace(remoteTrace));

    const merge = mergeMapDocumentsThreeWay(base, local, remoteDocument);
    if (merge.conflicts.length > 0) {
      return { status: 'conflict', merge, expectedVersion, remoteVersion, remoteDocument };
    }

    // A loaded save slot can legitimately be older than the current
    // authoritative version. If the three-way merge has no conflicts, rebase
    // the commit onto the version we just read instead of treating the
    // version mismatch itself as a user conflict.
    const commitVersion = remoteVersion !== expectedVersion ? remoteVersion : expectedVersion;
    const resolvedTrace = traceTerrain(merge.document, 'resolved-merge', commitVersion);
    const serialized = serializeResolvedMapSnapshot(merge.document);
    const serializedDocument = parseMapDocument(JSON.stringify(serialized), local.id);
    const serializedTrace = traceTerrain(serializedDocument, 'serialized-roundtrip', commitVersion);
    console.info('[MAP SAVE TRACE]', formatTerrainTrace(resolvedTrace));
    console.info('[MAP SAVE TRACE]', formatTerrainTrace(serializedTrace));
    try {
      assertTerrainPreserved(resolvedTrace, serializedTrace, 'resolved→serialized');
    } catch (error) {
      return { status: 'error', error };
    }

    const persistence = createSupabaseMapMergePersistence(client);
    const committed = normalizeMergeCommitResponse(
      await persistence.commitResolvedMerge(
        local.id,
        commitVersion,
        serialized,
        'map-editor-save',
      ),
    );

    if (committed.status === 'committed') {
      const authoritative = await loadMapDocumentSnapshot(client, local.id);
      if (!authoritative.document) {
        return { status: 'error', error: new Error('SAVE_POSTCOMMIT_VERIFY_FAILED: authoritative snapshot unavailable') };
      }
      const authoritativeTrace = traceTerrain(
        authoritative.document,
        'post-commit-authoritative',
        authoritative.result.version_number ?? committed.versionNumber,
      );
      console.info('[MAP SAVE TRACE]', formatTerrainTrace(authoritativeTrace));
      try {
        assertTerrainPreserved(resolvedTrace, authoritativeTrace, 'resolved→post-commit-authoritative');
      } catch (error) {
        return { status: 'error', error };
      }
    }

    if (committed.status === 'conflict') {
      const refreshed = await loadMapDocumentSnapshot(client, local.id);
      if (!refreshed.document) return { status: 'error', error: new Error('Remote map disappeared during save') };
      const refreshedVersion = refreshed.result.version_number ?? committed.currentVersion;
      return {
        status: 'conflict',
        merge: mergeMapDocumentsThreeWay(base, local, refreshed.document),
        expectedVersion: commitVersion,
        remoteVersion: refreshedVersion,
        remoteDocument: refreshed.document,
      };
    }

    return {
      status: 'committed',
      document: merge.document,
      version: committed.versionNumber,
      projectionStatus: committed.projectionStatus,
      projectionError: committed.projectionError,
    };
  } catch (error) {
    return { status: 'error', error };
  }
}
