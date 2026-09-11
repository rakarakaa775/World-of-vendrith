import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

export type RuntimeSnapshotResult = {
  ok: boolean;
  code?: string;
  found?: boolean;
  id?: string;
  map_id?: string;
  version_id?: string | null;
  updated_at?: string;
  snapshot?: unknown;
};

export async function saveMapDocumentSnapshot(
  client: SupabaseClient,
  document: MapDocument,
  versionId?: string | null,
): Promise<RuntimeSnapshotResult> {
  const snapshot = JSON.parse(serializeMapDocument(document));
  const { data, error } = await client.rpc('map_editor_upsert_runtime_snapshot_v1', {
    p_map_id: document.id,
    p_snapshot: snapshot,
    p_version_id: versionId ?? null,
  });
  if (error) throw error;
  return data as RuntimeSnapshotResult;
}

export async function loadMapDocumentSnapshot(
  client: SupabaseClient,
  mapId: string,
): Promise<{ result: RuntimeSnapshotResult; document: MapDocument | null }> {
  const { data, error } = await client.rpc('map_editor_get_runtime_snapshot_v1', {
    p_map_id: mapId,
  });
  if (error) throw error;
  const result = data as RuntimeSnapshotResult;
  if (!result.ok || !result.found || result.snapshot == null) return { result, document: null };
  const document = parseMapDocument(JSON.stringify(result.snapshot));
  return { result, document };
}
