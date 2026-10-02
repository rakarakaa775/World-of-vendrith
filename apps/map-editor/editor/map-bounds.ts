import type { MapDocument, MapParentBounds } from './map-document';

export function isValidParentBounds(bounds: MapParentBounds | null | undefined, parent: MapDocument): boolean {
  if (!bounds) return false;
  return Number.isInteger(bounds.x)
    && Number.isInteger(bounds.y)
    && Number.isInteger(bounds.width)
    && Number.isInteger(bounds.height)
    && bounds.x >= 0
    && bounds.y >= 0
    && bounds.width > 0
    && bounds.height > 0
    && bounds.x + bounds.width <= parent.width
    && bounds.y + bounds.height <= parent.height;
}

export function clampParentBounds(bounds: MapParentBounds, parent: MapDocument): MapParentBounds {
  const width = Math.min(Math.max(1, Math.floor(bounds.width)), parent.width);
  const height = Math.min(Math.max(1, Math.floor(bounds.height)), parent.height);
  const x = Math.min(Math.max(0, Math.floor(bounds.x)), Math.max(0, parent.width - width));
  const y = Math.min(Math.max(0, Math.floor(bounds.y)), Math.max(0, parent.height - height));
  return { x, y, width, height };
}

export function setRegionParentBounds(region: MapDocument, parent: MapDocument, bounds: MapParentBounds): MapDocument {
  if (region.mapType !== 'region' || region.parentMapId !== parent.id) {
    throw new Error('Invalid region parent');
  }
  if (!isValidParentBounds(bounds, parent)) {
    throw new Error('Invalid region parent bounds');
  }
  return { ...region, parentBounds: { ...bounds } };
}
