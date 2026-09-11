import type { MapDocument } from './map-document';
import { mergeMapDocumentsThreeWay, type MapMergeResult } from './map-entity-merge';
import { createSupabaseMapMergePersistence, serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';
import { loadMapDocumentSnapshot } from './map-persistence';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ConflictSaveResult =
  | { status: 'committed'; document: MapDocument; version: number }
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

    const merge = mergeMapDocumentsThreeWay(base, local, remoteDocument);
    if (remoteVersion !== expectedVersion || merge.conflicts.length > 0) {
      return { status: 'conflict', merge, expectedVersion, remoteVersion, remoteDocument };
    }

    const persistence = createSupabaseMapMergePersistence(client);
    const committed = await persistence.commitResolvedMerge(local.id, expectedVersion, serializeResolvedMapSnapshot(merge.document), 'map-editor-save');
    if (committed.status === 'conflict') {
      const refreshed = await loadMapDocumentSnapshot(client, local.id);
      if (!refreshed.document) return { status: 'error', error: new Error('Remote map disappeared during save') };
      const refreshedVersion = refreshed.result.version_number ?? committed.current_version;
      return { status: 'conflict', merge: mergeMapDocumentsThreeWay(base, local, refreshed.document), expectedVersion, remoteVersion: refreshedVersion, remoteDocument: refreshed.document };
    }
    return { status: 'committed', document: merge.document, version: committed.version_number };
  } catch (error) {
    return { status: 'error', error };
  }
}
