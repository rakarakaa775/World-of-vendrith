import { describe, expect, it, vi } from 'vitest';
import { prepareRefreshThenCommit } from './load-slot-commit-boundary';

describe('Load Slot commit boundary', () => {
  it('does not adopt a snapshot when preparation or validation fails', async () => {
    const commit = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);

    await expect(prepareRefreshThenCommit(
      async () => { throw new Error('SNAPSHOT_INVALID'); },
      refresh,
      commit,
    )).rejects.toThrow('SNAPSHOT_INVALID');

    expect(refresh).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
  });

  it('does not adopt a snapshot when refreshing the slot list fails', async () => {
    const commit = vi.fn();
    const refresh = vi.fn().mockRejectedValue(new Error('SLOT_REFRESH_FAILED'));
    const prepared = { worldId: 'world-1', exteriorId: 'exterior-1' };

    await expect(prepareRefreshThenCommit(
      async () => prepared,
      refresh,
      commit,
    )).rejects.toThrow('SLOT_REFRESH_FAILED');

    expect(commit).not.toHaveBeenCalled();
  });

  it('adopts only after preparation and refresh both succeed', async () => {
    const events: string[] = [];
    const prepared = { worldId: 'world-1', exteriorId: null };

    await expect(prepareRefreshThenCommit(
      async () => { events.push('prepare'); return prepared; },
      async () => { events.push('refresh'); },
      value => { events.push('commit'); expect(value).toBe(prepared); },
    )).resolves.toBe(prepared);

    expect(events).toEqual(['prepare', 'refresh', 'commit']);
  });
});
