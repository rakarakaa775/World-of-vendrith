export type Viewport = { x: number; y: number; zoom: number };

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export function clampZoom(zoom: number): number {
  return Math.min(4, Math.max(0.25, zoom));
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
