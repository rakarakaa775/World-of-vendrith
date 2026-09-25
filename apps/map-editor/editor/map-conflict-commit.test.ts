import { describe, expect, it, vi } from 'vitest';
import { createMap } from './map-document';
import { createConflictResolutionSession, chooseConflict } from './map-conflict-resolution-ui-model';
import { commitResolvedConflict } from './map-conflict-commit';

describe('commitResolvedConflict', () => {
  it('commits the resolved document with the authoritative expected version', async () => {
    const base = createMap('world');
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.name = 'Local'; remote.name = 'Remote';
    const result = { document: structuredClone(remote), conflicts: [{ kind: 'map-metadata' as const, id: 'name', base: base.name, local: local.name, remote: remote.name }] };
    const session = chooseConflict(createConflictResolutionSession(result), 'name', 'local');
    const commitResolvedMerge = vi.fn().mockResolvedValue({ status: 'committed', version_id: 'v2', version_number: 2, current_version: 2, projection_status: 'committed', projection_error: null });
    const outcome = await commitResolvedConflict({ commitResolvedMerge }, base.id, 1, result, session);
    expect(commitResolvedMerge).toHaveBeenCalledWith(base.id, 1, expect.any(String), 'conflict-resolution');
    expect(JSON.parse((commitResolvedMerge.mock.calls[0] as unknown[])[2] as string).document.name).toBe('Local');
    expect(outcome.status).toBe('committed');
  });

  it('returns a conflict without treating the local resolution as persisted', async () => {
    const map = createMap('world');
    const result = { document: map, conflicts: [{ kind: 'map-metadata' as const, id: 'name', base: 'A', local: 'B', remote: 'C' }] };
    const session = chooseConflict(createConflictResolutionSession(result), 'name', 'local');
    const outcome = await commitResolvedConflict({ commitResolvedMerge: vi.fn().mockResolvedValue({ status: 'conflict', version_id: null, version_number: null, current_version: 3, projection_status: 'not_run', projection_error: null }) }, map.id, 2, result, session);
    expect(outcome.status).toBe('conflict');
    if (outcome.status === 'conflict') expect(outcome.conflict.currentVersion).toBe(3);
  });
});
