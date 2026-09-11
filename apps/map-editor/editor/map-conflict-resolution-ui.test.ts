import { describe, expect, it } from 'vitest';
import { createConflictResolutionViewModel } from './map-conflict-resolution-ui';
import type { MapConflict } from './map-conflict-detection';

const conflict: MapConflict = {
  kind: 'diverged',
  local: { mapId: 'map-1', revision: '2', serialized: 'local' },
  remote: { mapId: 'map-1', revision: '3', serialized: 'remote' },
};

describe('conflict resolution UI contract', () => {
  it('exposes all supported resolution choices', () => {
    const vm = createConflictResolutionViewModel(conflict);
    expect(vm.options.map((option) => option.id)).toEqual([
      'keep-local',
      'keep-remote',
      'manual',
    ]);
  });

  it('marks destructive choices explicitly', () => {
    const vm = createConflictResolutionViewModel(conflict);
    expect(vm.options.find((option) => option.id === 'keep-local')?.destructive).toBe(true);
    expect(vm.options.find((option) => option.id === 'keep-remote')?.destructive).toBe(true);
    expect(vm.options.find((option) => option.id === 'manual')?.destructive).toBe(false);
  });
});
