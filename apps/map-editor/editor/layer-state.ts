import type { MapDocument, MapLayer, MapLayerGroup, MapLayerTemplate } from './map-document';

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

function nextGroupIdentity(document: MapDocument): { id: string; name: string } {
  let n = document.layerGroups.length + 1;
  let id = `group-${n}`;
  while (document.layerGroups.some(group => group.id === id)) { n += 1; id = `group-${n}`; }
  return { id, name: `Layer Group ${n}` };
}

export function createLayerGroup(document: MapDocument, name?: string): MapDocument {
  const identity = nextGroupIdentity(document);
  const group: MapLayerGroup = { id: identity.id, name: name?.trim() || identity.name, visible: true, locked: false, expanded: true };
  return { ...document, layerGroups: [...document.layerGroups, group] };
}

export function updateLayerGroup(document: MapDocument, groupId: string, patch: Partial<Pick<MapLayerGroup, 'name' | 'visible' | 'locked' | 'expanded'>>): MapDocument {
  return { ...document, layerGroups: document.layerGroups.map(group => group.id === groupId ? { ...group, ...patch } : group) };
}

export function assignLayerToGroup(document: MapDocument, layerId: string, groupId: string | null): MapDocument {
  if (groupId !== null && !document.layerGroups.some(group => group.id === groupId)) return document;
  return { ...document, layers: document.layers.map(layer => layer.id === layerId ? { ...layer, groupId } : layer) };
}

export function deleteLayerGroup(document: MapDocument, groupId: string): MapDocument {
  if (!document.layerGroups.some(group => group.id === groupId)) return document;
  return {
    ...document,
    layerGroups: document.layerGroups.filter(group => group.id !== groupId),
    layers: document.layers.map(layer => layer.groupId === groupId ? { ...layer, groupId: null } : layer),
  };
}

export function isLayerEffectivelyVisible(document: MapDocument, layer: MapLayer): boolean {
  const group = layer.groupId ? document.layerGroups.find(candidate => candidate.id === layer.groupId) : undefined;
  return layer.visible && (group?.visible ?? true);
}

export function isLayerEffectivelyLocked(document: MapDocument, layer: MapLayer): boolean {
  const group = layer.groupId ? document.layerGroups.find(candidate => candidate.id === layer.groupId) : undefined;
  return layer.locked || (group?.locked ?? false);
}

function nextTemplateIdentity(document: MapDocument, source: MapLayer): { id: string; name: string } {
  const baseId = `template-${source.id}`;
  const baseName = `${source.name} Template`;
  let suffix = 1;
  let id = baseId;
  let name = baseName;
  while (document.layerTemplates.some(template => template.id === id)) {
    suffix += 1;
    id = `${baseId}-${suffix}`;
    name = `${baseName} ${suffix}`;
  }
  return { id, name };
}

export function createLayerTemplate(document: MapDocument, layerId: string, name?: string): MapDocument {
  const source = document.layers.find(layer => layer.id === layerId);
  if (!source) return document;
  const identity = nextTemplateIdentity(document, source);
  const template: MapLayerTemplate = {
    id: identity.id,
    name: name?.trim() || identity.name,
    kind: source.kind,
    visible: source.visible,
    locked: source.locked,
    opacity: source.opacity,
    groupId: source.groupId ?? null,
  };
  return { ...document, layerTemplates: [...document.layerTemplates, template] };
}

function nextTemplateLayerIdentity(document: MapDocument, template: MapLayerTemplate): { id: string; name: string } {
  const baseId = template.id;
  const baseName = template.name.replace(/ Template(?: d+)?$/, '') || template.name;
  let suffix = 1;
  let id = `${baseId}-layer`;
  let name = baseName;
  while (document.layers.some(layer => layer.id === id)) {
    suffix += 1;
    id = `${baseId}-layer-${suffix}`;
    name = `${baseName} ${suffix}`;
  }
  return { id, name };
}

export function applyLayerTemplate(document: MapDocument, templateId: string): MapDocument {
  const template = document.layerTemplates.find(item => item.id === templateId);
  if (!template) return document;
  const identity = nextTemplateLayerIdentity(document, template);
  const groupExists = template.groupId ? document.layerGroups.some(group => group.id === template.groupId) : true;
  const layer: MapLayer = {
    id: identity.id,
    name: identity.name,
    kind: template.kind,
    visible: template.visible,
    locked: template.locked,
    active: false,
    opacity: template.opacity,
    groupId: groupExists ? (template.groupId ?? null) : null,
    cells: document.layers[0]?.cells.map(() => ({ tileId: null })) ?? [],
    objects: [],
  };
  return { ...document, layers: [...document.layers, layer] };
}

export function deleteLayerTemplate(document: MapDocument, templateId: string): MapDocument {
  if (!document.layerTemplates.some(template => template.id === templateId)) return document;
  return { ...document, layerTemplates: document.layerTemplates.filter(template => template.id !== templateId) };
}
