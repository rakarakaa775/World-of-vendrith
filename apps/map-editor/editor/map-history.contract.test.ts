import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { commitHistory, createHistory, redoHistory, undoHistory } from './map-history';
import { paintCell } from './map-state';

describe('MapHistory contract', () => {
  it('clears redo history after a new branch edit', () => {
    const base = createStarterMap();
    const first = paintCell(base, 'ground', { x: 1, y: 1 }, 'tile-a');
    const second = paintCell(first, 'ground', { x: 2, y: 2 }, 'tile-b');

    const afterFirst = commitHistory(createHistory(base), first);
    const undone = undoHistory(afterFirst);
    const branched = commitHistory(undone, second);

    expect(branched.past).toHaveLength(1);
    expect(branched.future).toHaveLength(0);
    expect(branched.present).toBe(second);
  });
});
