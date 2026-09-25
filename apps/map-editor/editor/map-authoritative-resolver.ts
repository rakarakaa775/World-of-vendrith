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
 * Resolve persistence by editor identity first. The editor identity layer is
 * authoritative for hierarchy and map scale; the legacy maps row is optional
 * metadata only. This keeps World -> Region -> Playable -> Interior separate
 * from legacy exterior/interior storage labels.
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

  const legacyMapId = identityRow.legacy_map_id ?? null;
  const rowResult = legacyMapId
    ? await client
      .from('maps')
      .select('id,name,map_type,world_id,width,height,tile_size,metadata')
      .eq('id', legacyMapId)
      .maybeSingle()
    : { data: null, error: null };

  if (rowResult.error) throw new Error(`MAP_RESOLUTION_ERROR: ${rowResult.error.message}`);
  let row = rowResult.data as AuthoritativeMapRow | null;
  if (!row?.id && !identityRow.legacy_map_id) {
    row = {
      id: identityRow.editor_map_id,
      editor_map_id: identityRow.editor_map_id,
      legacy_map_id: null,
      parent_editor_map_id: identityRow.parent_editor_map_id ?? null,
      name: 'Unnamed Map',
      map_type: identityRow.map_type,
      world_id: identityRow.world_id ?? null,
      width: null,
      height: null,
      tile_size: null,
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

  if (document.id !== identityRow.editor_map_id) {
    throw new Error('IDENTITY_ERROR: authoritative snapshot identity does not match editor identity');
  }
  if (expectedMapType && document.mapType !== expectedMapType) {
    throw new Error(`IDENTITY_ERROR: requested map type "${expectedMapType}" does not match authoritative document "${document.mapType}"`);
  }
  if (document.mapType !== identityRow.map_type) {
    throw new Error('IDENTITY_ERROR: authoritative snapshot map type does not match editor identity');
  }

  return { row: { ...row, id: identityRow.editor_map_id, editor_map_id: identityRow.editor_map_id, legacy_map_id: identityRow.legacy_map_id ?? null, parent_editor_map_id: identityRow.parent_editor_map_id ?? null }, document, version };
}
