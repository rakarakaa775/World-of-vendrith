import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapDocument } from './map-document';
import { materializeChildMap, planWorldExpansion } from './world-building-expansion';
import { serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';
import { loadIdentityMapDocument } from './map-identity-persistence';

type CreatedChild = { key: string; editor_map_id: string; parent_editor_map_id: string; map_type: 'region' | 'playable' };
type MaterializeResult = { ok: boolean; code: string; created: CreatedChild[] };
type Progress = (message: string) => void;
const RPC_TIMEOUT_MS = 20000;
async function withRpcTimeout<T>(label: string, operation: PromiseLike<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<T>((_, reject) => { timeout = setTimeout(() => reject(new Error(`RPC_TIMEOUT:${label}:${RPC_TIMEOUT_MS}ms`)), RPC_TIMEOUT_MS); }),
    ]);
  } finally { if (timeout) clearTimeout(timeout); }
}

/** Persist all 20 descendants and their first snapshots through one transactional RPC. */
export async function persistWorldExpansion(client: SupabaseClient, world: MapDocument, onProgress?: Progress): Promise<MapDocument[]> {
  if (world.mapType !== 'world') throw new Error('WORLD_EXPANSION_REQUIRES_WORLD');
  const plan = planWorldExpansion(world);
  const children: Array<{ key: string; parent_key: string; map_type: 'region' | 'playable'; name: string; snapshot: unknown }> = [];

  for (const group of plan.regions) {
    const region = materializeChildMap(world, group.region);
    children.push({
      key: group.region.seedKey,
      parent_key: 'world',
      map_type: 'region',
      name: group.region.name,
      snapshot: serializeResolvedMapSnapshot(region),
    });
    for (const seed of group.playables) {
      const playable = materializeChildMap(region, seed);
      children.push({
        key: seed.seedKey,
        parent_key: group.region.seedKey,
        map_type: 'playable',
        name: seed.name,
        snapshot: serializeResolvedMapSnapshot(playable),
      });
    }
  }

  onProgress?.('Submitting hierarchy RPC (20 snapshots)…');
  const result = await withRpcTimeout('map_editor_materialize_world_hierarchy_v1', client.rpc('map_editor_materialize_world_hierarchy_v1', {
    p_world_editor_map_id: world.id,
    p_children: children,
  }));
  if (result.error) throw result.error;
  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as MaterializeResult | null;
  if (!row?.ok || row.code !== 'CREATED' || !Array.isArray(row.created) || row.created.length !== 20) {
    throw new Error(`WORLD_HIERARCHY_PERSIST_FAILED:${row?.code ?? 'EMPTY_RESULT'}`);
  }

  const byKey = new Map(row.created.map(child => [child.key, child]));
  if (new Set(row.created.map(child => child.editor_map_id)).size !== 20) throw new Error('WORLD_HIERARCHY_DUPLICATE_IDS');
  // Read authoritative snapshots back in bounded parallel batches. A slow RPC
  // must fail visibly instead of leaving the editor busy forever.
  const reloaded: MapDocument[] = [];
  const batchSize = 5;
  for (let offset = 0; offset < children.length; offset += batchSize) {
    const batch = children.slice(offset, offset + batchSize);
    onProgress?.(`Verifying saved snapshots ${Math.min(offset + batch.length, children.length)}/${children.length}…`);
    const docs = await Promise.all(batch.map(async child => {
      const persisted = byKey.get(child.key);
      if (!persisted || persisted.map_type !== child.map_type) throw new Error('WORLD_HIERARCHY_RESULT_MISMATCH');
      const loaded = await withRpcTimeout(`map_editor_load_identity_snapshot_v1:${persisted.editor_map_id}`, loadIdentityMapDocument(client, persisted.editor_map_id));
      if (!loaded.document) throw new Error(`WORLD_HIERARCHY_SNAPSHOT_READBACK_EMPTY:${persisted.editor_map_id}:${loaded.result.code}`);
      if (loaded.document.id !== persisted.editor_map_id || loaded.document.parentMapId !== persisted.parent_editor_map_id || loaded.document.mapType !== persisted.map_type) {
        throw new Error(`WORLD_HIERARCHY_SNAPSHOT_READBACK_MISMATCH:${persisted.editor_map_id}`);
      }
      return loaded.document;
    }));
    reloaded.push(...docs);
  }
  return reloaded;
}
