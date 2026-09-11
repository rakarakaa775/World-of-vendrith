import { describe, expect, it } from 'vitest';
import { createConflictResolutionSession, canApplyResolution, chooseConflict } from '../editor/map-conflict-resolution-ui-model';

describe('ConflictResolutionPanel integration contract', () => {
  it('keeps Apply disabled until every conflict has a choice', () => {
    const result = {
      document: {} as never,
      conflicts: [
        { kind: 'map-metadata', id: 'name', base: 'A', local: 'B', remote: 'C' },
        { kind: 'terrain-cell', id: 'layer:cell:0', base: { tileId: 1 }, local: { tileId: 2 }, remote: { tileId: 3 } },
      ],
    };
    let session = createConflictResolutionSession(result);
    expect(canApplyResolution(session)).toBe(false);
    session = chooseConflict(session, 'name', 'local');
    expect(canApplyResolution(session)).toBe(false);
    session = chooseConflict(session, 'layer:cell:0', 'remote');
    expect(canApplyResolution(session)).toBe(true);
  });
});
