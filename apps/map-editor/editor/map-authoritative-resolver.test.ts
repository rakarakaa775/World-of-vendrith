import { describe, expect, it, vi } from 'vitest';
import { resolveAuthoritativeMap } from './map-authoritative-resolver';

const worldDocument = {
  version: 1,
  id: 'world-1',
  name: 'World Map',
  mapType: 'world',
  parentMapId: null,
  width: 20,
  height: 12,
  tileSize: 32,
  layers: [
    { id: 'ground', name: 'Ground', kind: 'ground', visible: true, locked: false, active: true, cells: Array.from({ length: 240 }, () => ({ tileId: null })), objects: [] },
  ],
};

const clientFor = (row: Record<string, unknown>, snapshot: unknown, access = true) => ({
  rpc: vi.fn(async (name: string) => {
    if (name === 'map_editor_resolve_identity_v1') return access
      ? { data: [{ editor_map_id: row.editor_map_id ?? row.id ?? 'world-1', legacy_map_id: row.legacy_map_id ?? row.id ?? 'world-1', world_id: row.world_id ?? 'world-id', map_type: row.map_type ?? 'world', parent_editor_map_id: null, created_by: 'owner-1' }], error: null }
      : { data: null, error: { message: 'map not found or not accessible' } };
    if (name === 'map_editor_can_access_v1') return { data: access, error: null };
    if (name === 'map_editor_bootstrap_world_identity_v1') return { data: [{ editor_map_id: 'world-1', legacy_map_id: 'world-1', world_id: 'world-id', map_type: 'world', parent_editor_map_id: null, created_by: 'owner-1' }], error: null };
    if (name === 'map_editor_load_identity_snapshot_v1') return { data: { ok: true, snapshot, version_number: 12 }, error: null };
    return { data: { snapshot, version_number: 12 }, error: null };
  }),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(async () => ({ data: row, error: null })),
      })),
    })),
  })),
}) as never;

describe('authoritative map resolution', () => {
  it('requires an accessible identity before reading its snapshot', async () => {
    await expect(resolveAuthoritativeMap(clientFor({}, worldDocument, false), 'world-1'))
      .rejects.toThrow('MAP_IDENTITY_ERROR');
  });

  it('resolves the authoritative world row and version', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: worldDocument };
    const result = await resolveAuthoritativeMap(clientFor({
      id: 'world-1', name: 'World Map', map_type: 'world', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot), 'world-1', 'world');

    expect(result.row.map_type).toBe('world');
    expect(result.document.id).toBe('world-1');
    expect(result.version).toBe(12);
  });

  it('does not silently map an exterior database row to region/playable', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: { ...worldDocument, id: 'exterior-1', mapType: 'region' } };
    const client = clientFor({
      id: 'exterior-1', name: 'Region', map_type: 'region', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot);
    await expect(resolveAuthoritativeMap(client, 'exterior-1', 'playable')).rejects.toThrow('IDENTITY_ERROR');
  });

  it('accepts a playable identity backed by a legacy exterior row', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: { ...worldDocument, id: 'playable-1', mapType: 'playable', playableSpace: 'exterior' } };
    const result = await resolveAuthoritativeMap(clientFor({
      id: 'playable-1', name: 'Exterior Playable', map_type: 'exterior', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot), 'playable-1', 'playable');
    expect(result.document.playableSpace).toBe('exterior');
    expect(result.row.map_type).toBe('exterior');
  });

  it('rejects a world document whose authoritative row is not world', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: { ...worldDocument, id: 'world-2', mapType: 'world' } };
    await expect(resolveAuthoritativeMap(clientFor({
      id: 'world-2', name: 'World', map_type: 'interior', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot), 'world-2', 'world')).rejects.toThrow('IDENTITY_ERROR');
  });
});
