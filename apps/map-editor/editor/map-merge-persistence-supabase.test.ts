import { describe, expect, it, vi } from 'vitest';
import { createSupabaseMapMergePersistence } from './map-merge-persistence-supabase';

describe('Supabase map merge persistence', () => {
  it('passes the authoritative expected version to the merge RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { status: 'committed', version_id: 'v2', version_number: 2, current_version: 2 }, error: null });
    const persistence = createSupabaseMapMergePersistence({ rpc } as never);
    const result = await persistence.commitResolvedMerge('map-1', 1, { id: 'map-1' }, 'conflict-resolution');
    expect(result.status).toBe('committed');
    expect(rpc).toHaveBeenCalledWith('map_editor_commit_merge_v1', {
      p_map_id: 'map-1',
      p_expected_version: 1,
      p_snapshot: { id: 'map-1' },
      p_label: 'conflict-resolution',
    });
  });

  it('preserves an optimistic concurrency conflict', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { status: 'conflict', version_id: null, version_number: null, current_version: 3 }, error: null });
    const persistence = createSupabaseMapMergePersistence({ rpc } as never);
    const result = await persistence.commitResolvedMerge('map-1', 2, { id: 'map-1' });
    expect(result.status).toBe('conflict');
    expect(result.current_version).toBe(3);
  });
});
