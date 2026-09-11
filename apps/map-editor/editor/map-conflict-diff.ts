import type { MapDocument, MapLayer } from './map-document';

export type MapDiffKind = 'added' | 'removed' | 'changed';
export type MapDiffArea = 'metadata' | 'layer' | 'terrain' | 'object';

export type MapDiffEntry = {
  kind: MapDiffKind;
  area: MapDiffArea;
  id: string;
  label: string;
  local: unknown;
  remote: unknown;
};

function layerSignature(layer: MapLayer): string {
  return JSON.stringify({
    id: layer.id,
    name: layer.name,
    kind: layer.kind,
    visible: layer.visible,
    locked: layer.locked,
    active: layer.active,
  });
}

export function diffMapDocuments(local: MapDocument, remote: MapDocument): MapDiffEntry[] {
  if (local.id !== remote.id) throw new Error('Cannot compare different maps');

  const entries: MapDiffEntry[] = [];

  for (const key of ['name', 'mapType', 'parentMapId', 'width', 'height', 'tileSize', 'playableSpace', 'parentPlayableMapId'] as const) {
    if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
      entries.push({ kind: 'changed', area: 'metadata', id: key, label: key, local: local[key], remote: remote[key] });
    }
  }

  const localLayers = new Map(local.layers.map((layer) => [layer.id, layer]));
  const remoteLayers = new Map(remote.layers.map((layer) => [layer.id, layer]));
  const ids = new Set([...localLayers.keys(), ...remoteLayers.keys()]);

  for (const id of ids) {
    const l = localLayers.get(id);
    const r = remoteLayers.get(id);
    if (!l) {
      entries.push({ kind: 'added', area: 'layer', id, label: r!.name, local: null, remote: r });
      continue;
    }
    if (!r) {
      entries.push({ kind: 'removed', area: 'layer', id, label: l.name, local: l, remote: null });
      continue;
    }
    if (layerSignature(l) !== layerSignature(r)) {
      entries.push({ kind: 'changed', area: 'layer', id, label: l.name, local: l, remote: r });
    }

    const maxCells = Math.max(l.cells.length, r.cells.length);
    for (let i = 0; i < maxCells; i++) {
      const lc = l.cells[i]?.tileId ?? null;
      const rc = r.cells[i]?.tileId ?? null;
      if (lc !== rc) entries.push({ kind: 'changed', area: 'terrain', id: `${id}:cell:${i}`, label: `${l.name} cell ${i}`, local: lc, remote: rc });
    }

    const lo = new Map(l.objects.map((object) => [object.id, object]));
    const ro = new Map(r.objects.map((object) => [object.id, object]));
    const objectIds = new Set([...lo.keys(), ...ro.keys()]);
    for (const objectId of objectIds) {
      const localObject = lo.get(objectId);
      const remoteObject = ro.get(objectId);
      if (!localObject) entries.push({ kind: 'added', area: 'object', id: objectId, label: objectId, local: null, remote: remoteObject });
      else if (!remoteObject) entries.push({ kind: 'removed', area: 'object', id: objectId, label: objectId, local: localObject, remote: null });
      else if (JSON.stringify(localObject) !== JSON.stringify(remoteObject)) entries.push({ kind: 'changed', area: 'object', id: objectId, label: objectId, local: localObject, remote: remoteObject });
    }
  }

  return entries;
}
