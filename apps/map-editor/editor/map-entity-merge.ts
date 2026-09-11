import type { MapDocument, MapLayer, MapObject, TileCell } from './map-document';

export type MergeConflictKind = 'terrain-cell' | 'object' | 'layer-metadata' | 'map-metadata';
export type MergeConflict = { kind: MergeConflictKind; id: string; base: unknown; local: unknown; remote: unknown };
export type MapMergeResult = { document: MapDocument; conflicts: MergeConflict[] };

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function threeWay<T>(base: T, local: T, remote: T): { value: T; conflict: boolean } {
  if (same(local, remote)) return { value: local, conflict: false };
  if (same(local, base)) return { value: remote, conflict: false };
  if (same(remote, base)) return { value: local, conflict: false };
  return { value: local, conflict: true };
}

function mergeCells(base: TileCell[], local: TileCell[], remote: TileCell[], layerId: string, conflicts: MergeConflict[]) {
  const length = Math.max(base.length, local.length, remote.length);
  return Array.from({ length }, (_, i) => {
    const b = base[i] ?? { tileId: null };
    const l = local[i] ?? { tileId: null };
    const r = remote[i] ?? { tileId: null };
    const result = threeWay(b, l, r);
    if (result.conflict) conflicts.push({ kind: 'terrain-cell', id: `${layerId}:cell:${i}`, base: b, local: l, remote: r });
    return result.value;
  });
}

function mergeObjects(base: MapObject[], local: MapObject[], remote: MapObject[], layerId: string, conflicts: MergeConflict[]) {
  const bm = new Map(base.map(o => [o.id, o]));
  const lm = new Map(local.map(o => [o.id, o]));
  const rm = new Map(remote.map(o => [o.id, o]));
  const ids = new Set([...bm.keys(), ...lm.keys(), ...rm.keys()]);
  const result: MapObject[] = [];
  for (const id of ids) {
    const b = bm.get(id) ?? null, l = lm.get(id) ?? null, r = rm.get(id) ?? null;
    const merged = threeWay(b, l, r);
    if (merged.conflict) conflicts.push({ kind: 'object', id: `${layerId}:object:${id}`, base: b, local: l, remote: r });
    if (merged.value) result.push(merged.value as MapObject);
  }
  return result;
}

function mergeLayer(base: MapLayer | null, local: MapLayer | null, remote: MapLayer | null, conflicts: MergeConflict[]): MapLayer | null {
  const b = base ?? null, l = local ?? null, r = remote ?? null;
  if (!l && !r) return null;
  if (!l) {
    if (same(r, b)) return null;
    if (b) conflicts.push({ kind: 'layer-metadata', id: r!.id, base: b, local: null, remote: r });
    return r;
  }
  if (!r) {
    if (same(l, b)) return null;
    if (b) conflicts.push({ kind: 'layer-metadata', id: l.id, base: b, local: l, remote: null });
    return l;
  }

  const metadataKeys: (keyof MapLayer)[] = ['name', 'kind', 'visible', 'locked', 'active'];
  const merged = { ...r } as MapLayer;
  for (const key of metadataKeys) {
    const result = threeWay(b?.[key], l[key], r[key]);
    if (result.conflict) conflicts.push({ kind: 'layer-metadata', id: `${l.id}:${String(key)}`, base: b?.[key], local: l[key], remote: r[key] });
    merged[key] = result.value as never;
  }
  merged.cells = mergeCells(b?.cells ?? [], l.cells, r.cells, l.id, conflicts);
  merged.objects = mergeObjects(b?.objects ?? [], l.objects, r.objects, l.id, conflicts);
  return merged;
}

export function mergeMapDocumentsThreeWay(base: MapDocument, local: MapDocument, remote: MapDocument): MapMergeResult {
  if (base.id !== local.id || base.id !== remote.id) throw new Error('Cannot merge different maps');
  const conflicts: MergeConflict[] = [];
  const merged = { ...remote } as MapDocument;

  const metadataKeys: (keyof MapDocument)[] = ['name', 'mapType', 'parentMapId', 'width', 'height', 'tileSize', 'playableSpace', 'parentPlayableMapId'];
  for (const key of metadataKeys) {
    const result = threeWay(base[key], local[key], remote[key]);
    if (result.conflict) conflicts.push({ kind: 'map-metadata', id: String(key), base: base[key], local: local[key], remote: remote[key] });
    merged[key] = result.value as never;
  }

  const bm = new Map(base.layers.map(l => [l.id, l]));
  const lm = new Map(local.layers.map(l => [l.id, l]));
  const rm = new Map(remote.layers.map(l => [l.id, l]));
  const layerIds = new Set([...bm.keys(), ...lm.keys(), ...rm.keys()]);
  merged.layers = [...layerIds].map(id => mergeLayer(bm.get(id) ?? null, lm.get(id) ?? null, rm.get(id) ?? null, conflicts)).filter((l): l is MapLayer => Boolean(l));

  return { document: merged, conflicts };
}
