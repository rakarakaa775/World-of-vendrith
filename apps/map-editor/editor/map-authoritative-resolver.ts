import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapDocument, MapType } from './map-document';

export type AuthoritativeMapRow = {
  id: string;
  name: string;
  map_type: string;
  world_id: string | null;
  width: number | null;
  height: number | null;
  tile_size: number | string | null;
  metadata: Record<string, unknown> | null;
  editor_map_id: string;
  legacy_map_id: string | null;
  parent_editor_map_id: string | null;
};

export type AuthoritativeMapResolution = {
  row: AuthoritativeMapRow;
  document: MapDocument;
  version: number;
};

/**
 * Resolve persistence by identity first: requested map id -> authoritative maps
 * row -> access/ownership check -> durable latest snapshot -> contract checks.
 *
 * This deliberately does not invent a mapping between the editor's
 * world/region/playable types and database map_type values. The current
 * database contract exposes world/exterior/interior, while MapDocument uses
 * world/region/playable. A non-world save is therefore rejected until the
 * persisted map row can identify its editor scale unambiguously.
 */
export async function resolveAuthoritativeMap(
  client: SupabaseClient,
  requestedMapId: string,
  expectedMapType?: MapType,
): Promise<AuthoritativeMapResolution> {
  if (!requestedMapId.trim()) throw new Error('MAP_RESOLUTION_ERROR: map id is required');

  let identity = await client.rpc('map_editor_resolve_identity_v1', { p_editor_map_id: requestedMapId });
  if (identity.error && expectedMapType === 'world') {
    const bootstrap = await client.rpc('map_editor_bootstrap_world_identity_v1', { p_legacy_map_id: requestedMapId });
    if (bootstrap.error) throw new Error('MAP_IDENTITY_ERROR: ' + bootstrap.error.message);
    identity = await client.rpc('map_editor_resolve_identity_v1', { p_editor_map_id: requestedMapId });
  }
  if (identity.error) throw new Error('MAP_IDENTITY_ERROR: ' + identity.error.message);
  const identityRow = Array.isArray(identity.data) ? identity.data[0] : identity.data;
  if (!identityRow?.editor_map_id) throw new Error('MAP_IDENTITY_ERROR: authoritative identity is unavailable');
  if (expectedMapType && identityRow.map_type !== expectedMapType) throw new Error('IDENTITY_ERROR: requested map type does not match authoritative identity');


  // Phase 3: the existing World Map is idempotently registered in the
  // explicit editor identity layer. No legacy maps row is created or changed.
  const bootstrap = await client.rpc('map_editor_bootstrap_world_identity_v1', {
    p_legacy_map_id: requestedMapId,
  });
  if (bootstrap.error) {
    throw new Error(`MAP_IDENTITY_ERROR: ${bootstrap.error.message}`);
  }

  const rowResult = await client
    .from('maps')
    .select('id,name,map_type,world_id,width,height,tile_size,metadata')
    .eq('id', requestedMapId)
    .maybeSingle();

  if (rowResult.error) throw new Error(`MAP_RESOLUTION_ERROR: ${rowResult.error.message}`);
  let row = rowResult.data as AuthoritativeMapRow | null;
  if (!row?.id && !identityRow.legacy_map_id) {
    row = {
      id: identityRow.editor_map_id,
      editor_map_id: identityRow.editor_map_id,
      legacy_map_id: null,
      parent_editor_map_id: identityRow.parent_editor_map_id ?? null,
      name: document.name,
      map_type: identityRow.map_type,
      world_id: identityRow.world_id ?? null,
      width: document.width,
      height: document.height,
      tile_size: document.tileSize,
      metadata: null,
    };
  }
  if (!row?.id) throw new Error('MAP_RESOLUTION_ERROR: authoritative map row is unavailable');

  const loaded = await client.rpc('map_editor_load_identity_snapshot_v1', { p_editor_map_id: identityRow.editor_map_id });
  if (loaded.error) throw new Error(`MAP_SNAPSHOT_ERROR: ${loaded.error.message}`);
  const result = Array.isArray(loaded.data) ? loaded.data[0] : loaded.data;
  if (!result?.ok || !result.snapshot) throw new Error(`MAP_SNAPSHOT_ERROR: ${result?.code || 'authoritative snapshot is unavailable'}`);

  const { parseMapDocument } = await import('./map-serialization');
  const payload = typeof result.snapshot === 'string' ? result.snapshot : JSON.stringify(result.snapshot);
  const document = parseMapDocument(payload, identityRow.editor_map_id);
  const version = Number(result.version_number) || 0;

  if (document.id !== row.id) {
    throw new Error('IDENTITY_ERROR: authoritative snapshot identity does not match map row');
  }
  if (document.mapType === 'world' && row.map_type !== 'world') {
    throw new Error(`IDENTITY_ERROR: World Map row has incompatible database map_type "${row.map_type}"`);
  }
  if (expectedMapType && document.mapType !== expectedMapType) {
    throw new Error(`IDENTITY_ERROR: requested map type "${expectedMapType}" does not match authoritative document "${document.mapType}"`);
  }
  if (document.mapType !== identityRow.map_type) {
    throw new Error('IDENTITY_ERROR: authoritative snapshot map type does not match editor identity');
  }

  return { row: { ...row, editor_map_id: identityRow.editor_map_id, legacy_map_id: identityRow.legacy_map_id ?? null, parent_editor_map_id: identityRow.parent_editor_map_id ?? null }, document, version };
}
