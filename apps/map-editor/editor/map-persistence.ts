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

export type MapDocumentAutosaver = {
  schedule(document: MapDocument, versionId?: string | null): void;
  flush(): Promise<RuntimeSnapshotResult | null>;
  cancel(): void;
};

export function createMapDocumentAutosaver(
  client: SupabaseClient,
  delayMs = 1000,
): MapDocumentAutosaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { document: MapDocument; versionId: string | null } | null = null;
  let inFlight: Promise<RuntimeSnapshotResult> | null = null;

  const run = async (): Promise<RuntimeSnapshotResult | null> => {
    if (!pending) return null;
    const next = pending;
    pending = null;
    inFlight = saveMapDocumentSnapshot(client, next.document, next.versionId);
    try {
      return await inFlight;
    } finally {
      inFlight = null;
    }
  };

  return {
    schedule(document, versionId = null) {
      pending = { document, versionId };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void run();
      }, Math.max(0, delayMs));
    },
    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const result = await run();
      if (inFlight) return await inFlight;
      return result;
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}
