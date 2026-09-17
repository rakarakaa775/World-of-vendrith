import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';
import { createCrashRecoveryJournal, type CrashRecoveryJournal } from './map-crash-recovery';

export type RuntimeSnapshotResult = {
  ok: boolean;
  code?: string;
  found?: boolean;
  id?: string;
  map_id?: string;
  version_id?: string | null;
  version_number?: number;
  updated_at?: string;
  snapshot?: unknown;
};

function normalizeRuntimeSnapshotResult(data: unknown): RuntimeSnapshotResult {
  if (Array.isArray(data)) return (data[0] ?? {}) as RuntimeSnapshotResult;
  return (data ?? {}) as RuntimeSnapshotResult;
}

function parsePersistedSnapshot(snapshot: unknown, requestedMapId?: string): MapDocument {
  const payload = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
  if (!payload || typeof payload !== 'object') throw new Error('Persisted map snapshot is invalid');
  const candidate = payload as { document?: unknown };
  // Canonical persisted shape is { schema, version, document }.
  // Keep a raw-document fallback for older rows.
  if ('document' in candidate) return parseMapDocument(payload as any, requestedMapId);
  return parseMapDocument({ schema: 'vandrith.map-document', version: 1, document: payload } as any, requestedMapId);
}

export async function saveMapDocumentSnapshot(client: SupabaseClient, document: MapDocument, versionId?: string | null): Promise<RuntimeSnapshotResult> {
  const snapshot = JSON.parse(serializeMapDocument(document));
  const { data, error } = await client.rpc('map_editor_upsert_runtime_snapshot_v1', { p_map_id: document.id, p_snapshot: snapshot, p_version_id: versionId ?? null });
  if (error) throw error;
  return normalizeRuntimeSnapshotResult(data);
}

/**
 * Runtime snapshots are the fast editor cache, while map_versions is the
 * durable authoritative history. Recover from the newest durable version
 * when the runtime row is absent or its payload cannot be parsed.
 */
export async function loadMapDocumentSnapshot(client: SupabaseClient, mapId: string): Promise<{ result: RuntimeSnapshotResult; document: MapDocument | null }> {
  const { data, error } = await client.rpc('map_editor_get_runtime_snapshot_v1', { p_map_id: mapId });
  if (error) throw error;
  const result = normalizeRuntimeSnapshotResult(data);

  if (result.ok && result.found && result.snapshot != null) {
    try {
      return { result, document: parsePersistedSnapshot(result.snapshot, mapId) };
    } catch (runtimeParseError) {
      console.warn('Runtime map snapshot parse failed; falling back to durable version', runtimeParseError);
    }
  }

  const { data: versionRows, error: versionError } = await client
    .from('map_versions')
    .select('id,map_id,version_number,snapshot,created_at')
    .eq('map_id', mapId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionError) throw versionError;
  const latest = versionRows?.[0] as any;
  if (!latest?.snapshot) return { result, document: null };

  let document: MapDocument;
  try {
    document = parsePersistedSnapshot(latest.snapshot, mapId);
  } catch (durableParseError) {
    console.warn('Durable map snapshot parse failed', durableParseError);
    return { result, document: null };
  }

  return {
    result: {
      ...result,
      ok: true,
      found: true,
      id: latest.id ?? result.id,
      map_id: latest.map_id ?? mapId,
      version_id: latest.id ?? result.version_id ?? null,
      version_number: Number(latest.version_number) || 0,
      updated_at: latest.created_at ?? result.updated_at,
      snapshot: latest.snapshot,
      code: 'durable-version-fallback',
    },
    document,
  };
}

export type MapDocumentAutosaver = { schedule(document: MapDocument, versionId?: string | null): void; flush(): Promise<RuntimeSnapshotResult | null>; cancel(): void };
export type MapDocumentRecoveryAutosaver = MapDocumentAutosaver & { recover(mapId: string): MapDocument | null; hasRecovery(mapId: string): boolean; clearRecovery(mapId: string): void };

export function createMapDocumentAutosaver(client: SupabaseClient, delayMs = 1000, journal: CrashRecoveryJournal = createCrashRecoveryJournal()): MapDocumentRecoveryAutosaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { document: MapDocument; versionId: string | null } | null = null;
  let inFlight: Promise<RuntimeSnapshotResult> | null = null;
  const run = async (): Promise<RuntimeSnapshotResult | null> => {
    if (!pending) return null;
    const next = pending; pending = null; journal.write(next.document);
    inFlight = saveMapDocumentSnapshot(client, next.document, next.versionId);
    try { return await inFlight; } finally { inFlight = null; }
  };
  return {
    schedule(document, versionId = null) { pending = { document, versionId }; journal.write(document); if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = null; void run(); }, Math.max(0, delayMs)); },
    async flush() { if (timer) { clearTimeout(timer); timer = null; } const result = await run(); if (inFlight) return await inFlight; return result; },
    cancel() { if (timer) clearTimeout(timer); timer = null; pending = null; },
    recover(mapId) { return journal.read(mapId); },
    hasRecovery(mapId) { return journal.has(mapId); },
    clearRecovery(mapId) { journal.clear(mapId); },
  };
}
