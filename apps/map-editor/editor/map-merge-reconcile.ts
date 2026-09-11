import type { MapDocument, MapLayer, MapObject } from './map-document';
import type { MapMergeResult, MergeConflict } from './map-entity-merge';

export type MergeResolution = 'local' | 'remote' | 'base';
export type DerivedReconciliation = { navigationRequired: boolean; geometryRequired: boolean; occupancyRequired: boolean };
export type ReconciledMerge = MapMergeResult & { derived: DerivedReconciliation };

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function deletedVsEdited<T>(base: T | null, local: T | null, remote: T | null, id: string, kind: MergeConflict['kind'], conflicts: MergeConflict[]) {
  if (base && !local && remote && !same(remote, base)) {
    conflicts.push({ kind, id, base, local: null, remote });
    return remote;
  }
  if (base && local && !remote && !same(local, base)) {
    conflicts.push({ kind, id, base, local, remote: null });
    return local;
  }
  return local ?? remote;
}

function reconcileLayerObjects(base: MapObject[], local: MapObject[], remote: MapObject[], layerId: string, conflicts: MergeConflict[]): MapObject[] {
  const bm = new Map(base.map(o => [o.id, o]));
  const lm = new Map(local.map(o => [o.id, o]));
  const rm = new Map(remote.map(o => [o.id, o]));
  const ids = new Set([...bm.keys(), ...lm.keys(), ...rm.keys()]);
  const result: MapObject[] = [];
  for (const id of ids) {
    const value = deletedVsEdited(bm.get(id) ?? null, lm.get(id) ?? null, rm.get(id) ?? null, `${layerId}:object:${id}`, 'object', conflicts);
    if (value) result.push(value as MapObject);
  }
  return result;
}

export function reconcileMapMerge(base: MapDocument, local: MapDocument, remote: MapDocument, merged: MapMergeResult): ReconciledMerge {
  const conflicts = [...merged.conflicts];
  const layers = new Map<string, MapLayer>();
  for (const layer of merged.document.layers) layers.set(layer.id, layer);

  const bm = new Map(base.layers.map(l => [l.id, l]));
  const lm = new Map(local.layers.map(l => [l.id, l]));
  const rm = new Map(remote.layers.map(l => [l.id, l]));
  const allLayerIds = new Set([...bm.keys(), ...lm.keys(), ...rm.keys()]);

  for (const id of allLayerIds) {
    const b = bm.get(id) ?? null;
    const l = lm.get(id) ?? null;
    const r = rm.get(id) ?? null;
    if (b && (!l || !r)) {
      const value = deletedVsEdited(b, l, r, id, 'layer-metadata', conflicts);
      if (value) {
        const target = layers.get(id) ?? ({ ...value } as MapLayer);
        target.objects = reconcileLayerObjects(b.objects, l?.objects ?? [], r?.objects ?? [], id, conflicts);
        layers.set(id, target);
      } else layers.delete(id);
    } else if (l && r) {
      const target = layers.get(id);
      if (target) target.objects = reconcileLayerObjects(b?.objects ?? [], l.objects, r.objects, id, conflicts);
    }
  }

  const document = { ...merged.document, layers: [...layers.values()] };
  const changed = !same(base, document);
  return {
    document,
    conflicts,
    derived: {
      navigationRequired: changed,
      geometryRequired: changed,
      occupancyRequired: changed,
    },
  };
}
