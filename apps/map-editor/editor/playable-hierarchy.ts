import type { MapDocument } from './map-document';
import type { PlayableMapDocument } from './playable-space';
import { isExterior, isInterior } from './playable-space';

export type PlayableHierarchyNode={map:PlayableMapDocument;interiors:PlayableMapDocument[]};
export function buildPlayableHierarchy(maps:MapDocument[],playableId:string):PlayableHierarchyNode|null{const exterior=maps.find(m=>m.id===playableId&&isExterior(m));if(!exterior)return null;const interiors=maps.filter(m=>isInterior(m)&&m.parentPlayableMapId===exterior.id) as PlayableMapDocument[];return{map:exterior as PlayableMapDocument,interiors};}
export function canCreateInterior(parent:MapDocument){return isExterior(parent);}
export function createInteriorFromExterior(exterior:MapDocument,interior:MapDocument):PlayableMapDocument{if(!canCreateInterior(exterior))throw new Error('Only a playable exterior can own interior maps');return{...interior,mapType:'playable',playableSpace:'interior',parentMapId:exterior.parentMapId,parentPlayableMapId:exterior.id};}
