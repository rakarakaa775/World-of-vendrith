import type { MapDocument, MapLayer } from './map-document';

export function setActiveLayer(document: MapDocument, layerId: string): MapDocument {
  return { ...document, layers: document.layers.map(layer => ({ ...layer, active: layer.id === layerId })) as MapLayer[] };
}

export function updateLayer(document: MapDocument, layerId: string, patch: Partial<Pick<MapLayer, 'name' | 'visible' | 'locked' | 'opacity'>>): MapDocument {
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

function nextLayerIdentity(document: MapDocument, source: MapLayer): { id: string; name: string } {
  const baseId = `${source.id}-copy`;
  const baseName = `${source.name} Copy`;
  let suffix = 1;
  let id = baseId;
  let name = baseName;
  while (document.layers.some(layer => layer.id === id)) {
    suffix += 1;
    id = `${baseId}-${suffix}`;
    name = `${baseName} ${suffix}`;
  }
  return { id, name };
}

export function duplicateLayer(document: MapDocument, layerId: string): MapDocument {
  const sourceIndex = document.layers.findIndex(layer => layer.id === layerId);
  if (sourceIndex < 0) return document;
  const source = document.layers[sourceIndex];
  const identity = nextLayerIdentity(document, source);
  const duplicate: MapLayer = {
    ...source,
    id: identity.id,
    name: identity.name,
    active: false,
    cells: source.cells.map(cell => ({ ...cell })),
    objects: source.objects.map(object => ({ ...object, id: `${identity.id}-${object.id}` })),
  };
  const layers = [...document.layers];
  layers.splice(sourceIndex + 1, 0, duplicate);
  return { ...document, layers };
}

export function mergeLayers(document: MapDocument, targetLayerId: string, sourceLayerId: string): MapDocument {
  if (targetLayerId === sourceLayerId) return document;
  const targetIndex = document.layers.findIndex(layer => layer.id === targetLayerId);
  const sourceIndex = document.layers.findIndex(layer => layer.id === sourceLayerId);
  if (targetIndex < 0 || sourceIndex < 0) return document;
  const target = document.layers[targetIndex];
  const source = document.layers[sourceIndex];
  if (target.kind !== source.kind) return document;

  const cells = target.cells.map((cell, index) => source.cells[index]?.tileId
    ? { tileId: source.cells[index].tileId }
    : { ...cell });
  const existingObjectIds = new Set(target.objects.map(object => object.id));
  const objects = [...target.objects];
  for (const object of source.objects) {
    let id = object.id;
    let suffix = 1;
    while (existingObjectIds.has(id)) {
      suffix += 1;
      id = `${object.id}-merged-${suffix}`;
    }
    existingObjectIds.add(id);
    objects.push({ ...object, id });
  }

  const mergedTarget: MapLayer = {
    ...target,
    visible: target.visible || source.visible,
    locked: target.locked && source.locked,
    opacity: Math.max(target.opacity, source.opacity),
    cells,
    objects,
  };
  const layers = document.layers.filter(layer => layer.id !== sourceLayerId).map(layer => layer.id === targetLayerId ? mergedTarget : layer);
  return { ...document, layers };
}
