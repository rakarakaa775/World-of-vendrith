export type GridPoint = { x: number; y: number };

export function indexFor(point: GridPoint, width: number): number {
  return point.y * width + point.x;
}

export function pointFromIndex(index: number, width: number): GridPoint {
  return { x: index % width, y: Math.floor(index / width) };
}

export function isInsideGrid(point: GridPoint, width: number, height: number): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < width && point.y < height;
}
