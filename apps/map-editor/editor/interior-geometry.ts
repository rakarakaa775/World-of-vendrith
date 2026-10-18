export type Footprint = { x: number; y: number; width: number; height: number };
export type FloorCell = { x: number; y: number };
export type WallSegment = { side: 'north' | 'south' | 'east' | 'west'; x: number; y: number };
export type InteriorGeometry = {
  footprint: Footprint;
  floorCells: FloorCell[];
  boundaryWalls: WallSegment[];
  /** Presentation-only: roof stays in exterior data and is hidden in interior view. */
  presentation: { hideExteriorRoof: true };
};

export type DoorOpening = { side: WallSegment['side']; offset: number };

/**
 * Derives floor cells and boundary wall segments from a building footprint.
 * Door openings omit one boundary segment; they do not alter the exterior map.
 * Coordinates are map-tile coordinates and the footprint is half-open.
 */
export function deriveInteriorGeometry(footprint: Footprint, door?: DoorOpening): InteriorGeometry {
  const { x, y, width, height } = footprint;
  if (![x, y, width, height].every(Number.isInteger) || x < 0 || y < 0 || width < 1 || height < 1) {
    throw new Error('INTERIOR_FOOTPRINT_INVALID');
  }
  if (door) {
    const sideLength = door.side === 'north' || door.side === 'south' ? width : height;
    if (!Number.isInteger(door.offset) || door.offset < 0 || door.offset >= sideLength) {
      throw new Error('INTERIOR_DOOR_OFFSET_INVALID');
    }
  }

  const floorCells: FloorCell[] = [];
  for (let dy = 0; dy < height; dy += 1) {
    for (let dx = 0; dx < width; dx += 1) floorCells.push({ x: x + dx, y: y + dy });
  }

  const boundaryWalls: WallSegment[] = [];
  const add = (side: WallSegment['side'], sx: number, sy: number, offset: number) => {
    if (door?.side === side && door.offset === offset) return;
    boundaryWalls.push({ side, x: sx, y: sy });
  };
  for (let dx = 0; dx < width; dx += 1) {
    add('north', x + dx, y, dx);
    add('south', x + dx, y + height - 1, dx);
  }
  for (let dy = 0; dy < height; dy += 1) {
    add('west', x, y + dy, dy);
    add('east', x + width - 1, y + dy, dy);
  }
  return { footprint: { ...footprint }, floorCells, boundaryWalls, presentation: { hideExteriorRoof: true } };
}
