import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { COLLISION_BLOCKED_TILE_ID, paintCell } from './map-state';

describe('collision cells', () => {
  it('stores a collision marker on the collision layer', () => {
    const document = createMap('playable');
    const next = paintCell(document, 'collision', { x: 4, y: 5 }, COLLISION_BLOCKED_TILE_ID);
    expect(next.layers.find(layer => layer.id === 'collision')?.cells[5 * next.width + 4]?.tileId)
      .toBe(COLLISION_BLOCKED_TILE_ID);
  });
});
