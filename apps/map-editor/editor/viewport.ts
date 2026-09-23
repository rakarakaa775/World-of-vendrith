export type Viewport = { x: number; y: number; zoom: number };

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };
export const ZOOM_LEVELS = [0.25, 0.5, 1, 2, 4] as const;

export function nearestZoomLevel(zoom: number): number {
  return ZOOM_LEVELS.reduce((nearest, level) =>
    Math.abs(level - zoom) < Math.abs(nearest - zoom) ? level : nearest,
  ZOOM_LEVELS[0]);
}

export function nextZoomLevel(zoom: number, direction: -1 | 1): number {
  const index = ZOOM_LEVELS.findIndex(level => level >= zoom);
  const current = index === -1 ? ZOOM_LEVELS.length - 1 : index;
  const next = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, current + direction));
  return ZOOM_LEVELS[next];
}

export function snapToCell(value: number, tileSize: number): number {
  return Math.floor(value / tileSize);
}

export function clampZoom(zoom: number): number {
  return Math.min(4, Math.max(0.25, zoom));
}

export function panBy(viewport: Viewport, dx: number, dy: number): Viewport {
  return { ...viewport, x: viewport.x + dx, y: viewport.y + dy };
}

export function zoomAt(viewport: Viewport, factor: number, screenX: number, screenY: number): Viewport {
  const nextZoom = clampZoom(viewport.zoom * factor);
  const worldX = (screenX - viewport.x) / viewport.zoom;
  const worldY = (screenY - viewport.y) / viewport.zoom;
  return {
    zoom: nextZoom,
    x: screenX - worldX * nextZoom,
    y: screenY - worldY * nextZoom,
  };
}
