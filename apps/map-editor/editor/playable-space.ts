import type { MapDocument } from './map-document';

export type PlayableSpaceType='exterior'|'interior';
export type PlayableMapDocument=MapDocument&{playableSpace:PlayableSpaceType;parentPlayableMapId:string|null};

export function asPlayableMap(document:MapDocument,space:PlayableSpaceType,parentPlayableMapId:string|null=null):PlayableMapDocument{return{...document,mapType:'playable',playableSpace:space,parentPlayableMapId}};
export function createInteriorMap(exterior:MapDocument,interior:MapDocument):PlayableMapDocument{return asPlayableMap(interior,'interior',exterior.id)};
export function isExterior(document:MapDocument){return document.mapType==='playable'&&(!('playableSpace'in document)||document.playableSpace==='exterior');}
export function isInterior(document:MapDocument){return document.mapType==='playable'&&'playableSpace'in document&&document.playableSpace==='interior';}
export function canEnterInterior(exterior:MapDocument,interior:MapDocument){return isExterior(exterior)&&isInterior(interior)&&interior.parentPlayableMapId===exterior.id;}
