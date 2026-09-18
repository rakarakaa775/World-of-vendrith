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
    if (name === 'map_editor_can_access_v1') return { data: access, error: null };
    if (name === 'map_editor_bootstrap_world_identity_v1') return { data: [{ editor_map_id: 'world-1', legacy_map_id: 'world-1', world_id: 'world-id', map_type: 'world', parent_editor_map_id: null, created_by: 'owner-1' }], error: null };\n    return { data: { snapshot, version_number: 12 }, error: null };
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
  it('requires an accessible map before reading its snapshot', async () => {
    await expect(resolveAuthoritativeMap(clientFor({}, worldDocument, false), 'world-1'))
      .rejects.toThrow('MAP_ACCESS_ERROR');
  });

  it('resolves the authoritative world row and version', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: worldDocument };
    const result = await resolveAuthoritativeMap(clientFor({
      id: 'world-1', name: 'World Map', map_type: 'world', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot), 'world-1', 'world');

    expect(result.row.map_type).toBe('world');
    expect(result.document.id).toBe('world-1');
    expect(result.version).toBe(12);\n    expect((clientFor as any)).toBeDefined();
  });

  it('does not silently map an exterior database row to region/playable', async () => {
    const snapshot = { schema: 'vandrith.map-document', version: 1, document: { ...worldDocument, id: 'exterior-1', mapType: 'region' } };
    await expect(resolveAuthoritativeMap(clientFor({
      id: 'exterior-1', name: 'Region', map_type: 'exterior', world_id: null,
      width: 20, height: 12, tile_size: 32, metadata: null,
    }, snapshot), 'exterior-1', 'region')).rejects.toThrow('MAP_TYPE_CONTRACT_ERROR');
  });
});
