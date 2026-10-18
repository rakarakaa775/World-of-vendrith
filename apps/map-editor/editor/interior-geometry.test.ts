import { describe, expect, it } from 'vitest';
import { deriveInteriorGeometry } from './interior-geometry';

describe('interior footprint geometry', () => {
  it('derives floor and boundary walls for a variable footprint', () => {
    const geometry = deriveInteriorGeometry({ x: 4, y: 7, width: 3, height: 4 });
    expect(geometry.floorCells).toHaveLength(12);
    expect(geometry.boundaryWalls).toHaveLength(14);
    expect(geometry.floorCells[0]).toEqual({ x: 4, y: 7 });
    expect(geometry.floorCells.at(-1)).toEqual({ x: 6, y: 10 });
    expect(geometry.presentation.hideExteriorRoof).toBe(true);
  });

  it('leaves a door opening without deleting or mutating source data', () => {
    const footprint = { x: 0, y: 0, width: 2, height: 3 };
    const geometry = deriveInteriorGeometry(footprint, { side: 'south', offset: 1 });
    expect(geometry.floorCells).toHaveLength(6);
    expect(geometry.boundaryWalls).toHaveLength(9);
    expect(geometry.boundaryWalls).not.toContain({ side: 'south', x: 1, y: 2 });
    expect(footprint).toEqual({ x: 0, y: 0, width: 2, height: 3 });
  });

  it('rejects invalid footprints and door offsets', () => {
    expect(() => deriveInteriorGeometry({ x: -1, y: 0, width: 2, height: 2 })).toThrow('INTERIOR_FOOTPRINT_INVALID');
    expect(() => deriveInteriorGeometry({ x: 0, y: 0, width: 2, height: 2 }, { side: 'east', offset: 2 })).toThrow('INTERIOR_DOOR_OFFSET_INVALID');
  });
});
