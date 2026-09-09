import type { MapDocument, MapLayer } from './map-document';

export function setActiveLayer(document: MapDocument, layerId: string): MapDocument {
  return { ...document, layers: document.layers.map(layer => ({ ...layer, active: layer.id === layerId })) as MapLayer[] };
}

export function updateLayer(document: MapDocument, layerId: string, patch: Partial<Pick<MapLayer, 'name' | 'visible' | 'locked'>>): MapDocument {
  return { ...document, layers: document.layers.map(layer => layer.id === layerId ? { ...layer, ...patch } : layer) };
}

export function reorderLayer(document: MapDocument, layerId: string, direction: 'up' | 'down'): MapDocument {
  const index = document.layers.findIndex(layer => layer.id === layerId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= document.layers.length) return document;
  const layers = [...document.layers];
  [layers[index], layers[target]] = [layers[target], layers[index]];
  return { ...document, layers };
}
