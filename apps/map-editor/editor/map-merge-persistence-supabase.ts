import type { SupabaseClient } from '@supabase/supabase-js';
import { serializeMapDocument } from './map-serialization';
import { createMapMergePersistence, type MapMergePersistence } from './map-merge-persistence';

export function createSupabaseMapMergePersistence(client: SupabaseClient): MapMergePersistence {
  return createMapMergePersistence(async ({ p_map_id, p_expected_version, p_snapshot, p_label }) => {
    const { data, error } = await client.rpc('map_editor_commit_merge_v1', {
      p_map_id,
      p_expected_version,
      p_snapshot,
      p_label,
    });
    if (error) throw error;
    return data as Awaited<ReturnType<MapMergePersistence['commitResolvedMerge']>>;
  });
}

export function serializeResolvedMapSnapshot(document: Parameters<typeof serializeMapDocument>[0]): Record<string, unknown> {
  return JSON.parse(serializeMapDocument(document)) as Record<string, unknown>;
}
