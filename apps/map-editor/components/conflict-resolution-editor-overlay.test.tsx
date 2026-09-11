import { describe, expect, it } from 'vitest';
import { createConflictResolutionSession } from '../editor/map-conflict-resolution-ui-model';

describe('conflict resolution editor overlay contract', () => {
  it('starts with every conflict unresolved', () => {
    const result = { document: {} as never, conflicts: [{ kind: 'map-metadata' as const, id: 'name', base: 'A', local: 'B', remote: 'C' }] };
    const session = createConflictResolutionSession(result);
    expect(session.conflicts).toHaveLength(1);
    expect(session.conflicts[0].choice).toBeNull();
  });
});
