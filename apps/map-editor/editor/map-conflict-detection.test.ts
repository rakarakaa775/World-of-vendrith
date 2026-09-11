import { describe, expect, it } from 'vitest';
import { detectMapConflict, type MapSnapshotIdentity } from './map-conflict-detection';

const base: MapSnapshotIdentity = { mapId: 'map-1', revision: '1', serialized: 'base' };
const local: MapSnapshotIdentity = { mapId: 'map-1', revision: '2', serialized: 'local' };
const remote: MapSnapshotIdentity = { mapId: 'map-1', revision: '2', serialized: 'remote' };

describe('detectMapConflict', () => {
  it('returns no conflict when local and remote match', () => {
    expect(detectMapConflict(base, local, { ...remote, serialized: local.serialized })).toBeNull();
  });

  it('detects a remote-only change', () => {
    expect(detectMapConflict(base, base, remote)?.kind).toBe('remote-newer');
  });

  it('detects a local-only change', () => {
    expect(detectMapConflict(base, local, base)?.kind).toBe('local-newer');
  });

  it('detects divergent changes', () => {
    expect(detectMapConflict(base, local, remote)?.kind).toBe('diverged');
  });
});
