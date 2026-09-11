import { describe, expect, it } from 'vitest';
import { canApplyResolution, chooseConflict, createConflictResolutionSession, resolveAll } from './map-conflict-resolution-ui-model';
import type { MapMergeResult } from './map-entity-merge';

const result: MapMergeResult = { document: {} as never, conflicts: [{ kind:'terrain-cell', id:'ground:cell:1', base:{tileId:'grass'}, local:{tileId:'stone'}, remote:{tileId:'water'} }] };

describe('conflict resolution UI model', () => {
  it('starts with unresolved choices', () => expect(canApplyResolution(createConflictResolutionSession(result))).toBe(false));
  it('supports per-conflict choice', () => {
    const session = createConflictResolutionSession(result);
    expect(canApplyResolution(chooseConflict(session, 'ground:cell:1', 'local'))).toBe(true);
  });
  it('supports resolving all conflicts at once', () => {
    expect(canApplyResolution(resolveAll(createConflictResolutionSession(result), 'remote'))).toBe(true);
  });
});
