import type { MapDocument, MapObject } from './map-document';

export function getParentMapId(document: MapDocument): string | null {
  if (document.mapType === 'world') return null;
  if (document.mapType === 'region') return document.parentMapId;
  return document.playableSpace === 'interior'
    ? document.parentPlayableMapId ?? null
    : document.parentMapId;
}

export function canOpenChildMap(parent: MapDocument, child: MapDocument): boolean {
  if (parent.mapType === 'world') {
    return child.mapType === 'region' && child.parentMapId === parent.id;
  }

  if (parent.mapType === 'region') {
    return child.mapType === 'playable'
      && (child.playableSpace ?? 'exterior') === 'exterior'
      && child.parentMapId === parent.id;
  }

  if (parent.mapType === 'playable' && (parent.playableSpace ?? 'exterior') === 'exterior') {
    return child.mapType === 'playable'
      && child.playableSpace === 'interior'
      && child.parentPlayableMapId === parent.id;
  }

  return false;
}

export function canOpenObjectTarget(parent: MapDocument, object: MapObject, target: MapDocument): boolean {
  if (!parent.layers.some(layer => layer.objects.some(candidate => candidate.id === object.id))) return false;

  if (parent.mapType === 'region') {
    return object.childMapId === target.id && canOpenChildMap(parent, target);
  }

  if (parent.mapType === 'playable' && (parent.playableSpace ?? 'exterior') === 'exterior') {
    return object.kind === 'building'
      && object.interiorMapId === target.id
      && canOpenChildMap(parent, target);
  }

  return false;
}

export function getNavigationPath(current: MapDocument, documentsById: ReadonlyMap<string, MapDocument>): MapDocument[] {
  const path: MapDocument[] = [];
  const seen = new Set<string>();
  let cursor: MapDocument | undefined = current;

  while (cursor) {
    if (seen.has(cursor.id)) throw new Error('Map hierarchy contains a cycle');
    seen.add(cursor.id);
    path.unshift(cursor);

    const parentId = getParentMapId(cursor);
    if (!parentId) break;
    cursor = documentsById.get(parentId);
    if (!cursor) throw new Error(`Missing parent map: ${parentId}`);
  }

  return path;
}
