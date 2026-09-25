import type { MapDocument, MapObject } from './map-document';

function updateObjectLink(document:MapDocument, objectId:string, changes:Partial<Pick<MapObject,'childMapId'|'interiorMapId'>>):MapDocument{
  let found=false;
  const layers=document.layers.map(layer=>{
    if(layer.id!=='objects') return layer;
    const objects=layer.objects.map(object=>{
      if(object.id!==objectId) return object;
      found=true;
      return {...object,...changes};
    });
    return objects===layer.objects?layer:{...layer,objects};
  });
  if(!found) throw new Error(`Map object not found: ${objectId}`);
  return {...document,layers};
}

export function getParentMapId(document: MapDocument): string | null {
  if (document.mapType === 'world') return null;
  if (document.mapType === 'region') return document.parentMapId;
  return document.playableSpace === 'interior'
    ? document.parentPlayableMapId ?? null
    : document.parentMapId;
}

export function canOpenChildMap(parent: MapDocument, child: MapDocument): boolean {
  if (parent.mapType === 'world') return child.mapType === 'region' && child.parentMapId === parent.id;
  if (parent.mapType === 'region') return child.mapType === 'playable' && (child.playableSpace ?? 'exterior') === 'exterior' && child.parentMapId === parent.id;
  if (parent.mapType === 'playable' && (parent.playableSpace ?? 'exterior') === 'exterior') {
    return child.mapType === 'playable' && child.playableSpace === 'interior' && child.parentPlayableMapId === parent.id;
  }
  return false;
}

export function canOpenObjectTarget(parent: MapDocument, object: MapObject, target: MapDocument): boolean {
  if (!parent.layers.some(layer => layer.objects.some(candidate => candidate.id === object.id))) return false;
  if (parent.mapType === 'region') return object.childMapId === target.id && canOpenChildMap(parent, target);
  if (parent.mapType === 'playable' && (parent.playableSpace ?? 'exterior') === 'exterior') {
    return object.kind === 'building' && object.interiorMapId === target.id && canOpenChildMap(parent, target);
  }
  return false;
}

export function linkRegionObjectToPlayable(parent: MapDocument, objectId: string, child: MapDocument): MapDocument {
  const object = parent.layers.flatMap(layer => layer.objects).find(candidate => candidate.id === objectId);
  if (!object || object.kind !== 'poi' || parent.mapType !== 'region' || !canOpenChildMap(parent, child)) {
    throw new Error('Invalid playable child target');
  }
  return updateObjectLink(parent, objectId, { childMapId: child.id });
}

export function linkBuildingToInterior(parent: MapDocument, objectId: string, interior: MapDocument): MapDocument {
  const object = parent.layers.flatMap(layer => layer.objects).find(candidate => candidate.id === objectId);
  if (!object || object.kind !== 'building' || parent.mapType !== 'playable' || (parent.playableSpace ?? 'exterior') !== 'exterior' || !canOpenChildMap(parent, interior)) {
    throw new Error('Invalid interior target');
  }
  return updateObjectLink(parent, objectId, { interiorMapId: interior.id });
}

export function unlinkObjectMapTarget(document: MapDocument, objectId: string): MapDocument {
  const object = document.layers.flatMap(layer => layer.objects).find(candidate => candidate.id === objectId);
  if (!object) throw new Error(`Map object not found: ${objectId}`);
  return document.mapType === 'region'
    ? updateObjectLink(document, objectId, { childMapId: null })
    : updateObjectLink(document, objectId, { interiorMapId: null });
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
