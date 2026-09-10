import type { MapDocument } from './map-document';
import type { GridPoint } from './grid';
import { paintCell } from './map-state';

export type PaintShape = 'square' | 'line' | 'rectangle';

const pointKey = (p: GridPoint) => `${p.x}:${p.y}`;

export function pointsInSquare(center: GridPoint, size: number): GridPoint[] {
  const extent = Math.max(1, Math.floor(size));
  const before = Math.floor((extent - 1) / 2);
  const after = extent - before - 1;
  const points: GridPoint[] = [];
  for (let y = center.y - before; y <= center.y + after; y += 1) {
    for (let x = center.x - before; x <= center.x + after; x += 1) points.push({ x, y });
  }
  return points;
}

export function pointsInLine(start: GridPoint, end: GridPoint): GridPoint[] {
  let x0 = start.x, y0 = start.y;
  const x1 = end.x, y1 = end.y;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  const points: GridPoint[] = [];
  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x0 += sx; }
    if (twice <= dx) { error += dx; y0 += sy; }
  }
  return points;
}

export function pointsInRectangle(start: GridPoint, end: GridPoint): GridPoint[] {
  const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
  const points: GridPoint[] = [];
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) points.push({ x, y });
  return points;
}

export function applyPaint(document: MapDocument, layerId: string, points: GridPoint[], tileId: string | null): MapDocument {
  const unique = new Map<string, GridPoint>();
  for (const point of points) unique.set(pointKey(point), point);
  let next = document;
  for (const point of unique.values()) next = paintCell(next, layerId, point, tileId);
  return next;
}
