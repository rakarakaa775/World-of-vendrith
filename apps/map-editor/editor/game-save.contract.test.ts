import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { parseGameSaveSnapshot, serializeGameSaveSnapshot } from './game-save';

function map(id: string, mapType: 'world' | 'playable' = 'world') {
  const document = createMap(mapType);
  document.id = id;
  document.name = id;
  return document;
}

describe('game save contract', () => {
  it('round-trips a world-only save snapshot', () => {
    const world = map('world-1');
    const snapshot = serializeGameSaveSnapshot(world, null);

    expect(parseGameSaveSnapshot(snapshot)).toEqual(snapshot);
  });

  it('round-trips a world + exterior save snapshot', () => {
    const world = map('world-1');
    const exterior = map('exterior-1', 'playable');
    const snapshot = serializeGameSaveSnapshot(world, exterior);

    expect(parseGameSaveSnapshot(snapshot)).toEqual(snapshot);
  });

  it('rejects a slot snapshot with an invalid world document', () => {
    const snapshot = {
      schema: 'vandrith.game-save',
      version: 1,
      world: { id: 'world-1', mapType: 'world', width: 2, height: 2 },
      exterior: null,
    };

    expect(parseGameSaveSnapshot(snapshot)).toBeNull();
  });

  it('rejects a slot snapshot with an invalid exterior document', () => {
    const snapshot = {
      schema: 'vandrith.game-save',
      version: 1,
      world: map('world-1'),
      exterior: { id: 'exterior-1', mapType: 'playable', width: 2, height: 2 },
    };

    expect(parseGameSaveSnapshot(snapshot)).toBeNull();
  });

  it('rejects an unsupported save schema or version', () => {
    const world = map('world-1');

    expect(parseGameSaveSnapshot({
      schema: 'other.save',
      version: 1,
      world,
      exterior: null,
    })).toBeNull();

    expect(parseGameSaveSnapshot({
      schema: 'vandrith.game-save',
      version: 2,
      world,
      exterior: null,
    })).toBeNull();
  });
});
