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

  const access = await client.rpc('map_editor_can_access_v1', { p_map_id: requestedMapId });
  if (access.error) throw new Error(`MAP_ACCESS_ERROR: ${access.error.message}`);
  if (access.data !== true && access.data?.[0] !== true) {
    throw new Error('MAP_ACCESS_ERROR: map not found or not accessible');
  }

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
  const row = rowResult.data as AuthoritativeMapRow | null;
  if (!row?.id) throw new Error('MAP_RESOLUTION_ERROR: authoritative map row is unavailable');

  const loaded = await client.rpc('map_editor_load_document_snapshot_v1', { p_map_id: requestedMapId });
  if (loaded.error) throw new Error(`MAP_SNAPSHOT_ERROR: ${loaded.error.message}`);
  const result = Array.isArray(loaded.data) ? loaded.data[0] : loaded.data;
  if (!result?.snapshot) throw new Error(`MAP_SNAPSHOT_ERROR: authoritative snapshot is unavailable`);

  const { parseMapDocument } = await import('./map-serialization');
  const payload = typeof result.snapshot === 'string' ? result.snapshot : JSON.stringify(result.snapshot);
  const document = parseMapDocument(payload, requestedMapId);
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
  if (expectedMapType && expectedMapType !== 'world') {
    throw new Error(`MAP_TYPE_CONTRACT_ERROR: database map_type "${row.map_type}" does not uniquely identify editor map type "${expectedMapType}"`);
  }

  return { row, document, version };
}
