import { describe, expect, it, vi } from 'vitest';
import { createMap } from './map-document';
import { persistWorldExpansion } from './world-hierarchy-persistence';

describe('persistWorldExpansion', () => {
  it('submits 4 Region and 16 Playable snapshots, then reads back authoritative snapshots', async () => {
    const world = { ...createMap('world', null, 'exterior', null, 8, 8), id: '00000000-0000-4000-8000-000000000001' };
    const persisted = new Map<string, any>();
    const rpc = vi.fn(async (name: string, args: any) => {
      if (name === 'map_editor_materialize_world_hierarchy_v1') {
        const created = args.p_children.map((child: any, index: number) => {
          const editor_map_id = `00000000-0000-4000-8000-${String(index + 2).padStart(12, '0')}`;
          const parentIndex = args.p_children.findIndex((p: any) => p.key === child.parent_key);
          const parent_editor_map_id = child.parent_key === 'world' ? world.id : `00000000-0000-4000-8000-${String(parentIndex + 2).padStart(12, '0')}`;
          const document = { ...child.snapshot.document, id: editor_map_id, parentMapId: parent_editor_map_id, mapType: child.map_type, name: child.name };
          persisted.set(editor_map_id, { ...document, version_number: 1 });
          return { key: child.key, editor_map_id, parent_editor_map_id, map_type: child.map_type };
        });
        return { error: null, data: [{ ok: true, code: 'CREATED', created }] };
      }
      if (name === 'map_editor_load_identity_snapshot_v1') {
        const doc = persisted.get(args.p_editor_map_id);
        return { error: null, data: [{ ok: true, code: 'OK', editor_map_id: args.p_editor_map_id, version_id: 'version-1', version_number: 1, snapshot: { schema: 'vandrith.map-document', version: 1, document: doc } }] };
      }
      throw new Error(`Unexpected RPC ${name}`);
    });
    const result = await persistWorldExpansion({ rpc } as any, world);
    expect(rpc.mock.calls.filter(call => call[0] === 'map_editor_materialize_world_hierarchy_v1')).toHaveLength(1);
    expect(rpc.mock.calls[0][1].p_children).toHaveLength(20);
    expect(rpc.mock.calls.filter(call => call[0] === 'map_editor_load_identity_snapshot_v1')).toHaveLength(20);
    expect(result.filter(map => map.mapType === 'region')).toHaveLength(4);
    expect(result.filter(map => map.mapType === 'playable')).toHaveLength(16);
    expect(new Set(result.map(map => map.id)).size).toBe(20);
    expect(result.every(map => map.id.startsWith('00000000-0000-4000-8000-'))).toBe(true);
    for (const playable of result.filter(map => map.mapType === 'playable')) {
      expect(result.some(region => region.mapType === 'region' && region.id === playable.parentMapId)).toBe(true);
    }
  });

  it('rejects failed transactional RPC results', async () => {
    const world = { ...createMap('world', null, 'exterior', null, 8, 8), id: 'world-id' };
    const client = { rpc: vi.fn(async () => ({ error: null, data: [{ ok: false, code: 'EDITOR_HIERARCHY_SHAPE_INVALID', created: [] }] })) };
    await expect(persistWorldExpansion(client as any, world)).rejects.toThrow('WORLD_HIERARCHY_PERSIST_FAILED:EDITOR_HIERARCHY_SHAPE_INVALID');
  });
});
