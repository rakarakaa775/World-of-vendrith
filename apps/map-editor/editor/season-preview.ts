import type { MapDocument, MapObject } from './map-document';
import type { SeasonKey } from './season-system';

export type SeasonalPreview={season:SeasonKey;document:MapDocument;assetOverrides:Record<string,string>};
export function buildSeasonalPreview(document:MapDocument,season:SeasonKey,assetOverrides:Record<string,string>={}):SeasonalPreview{const mapObject=(object:MapObject):MapObject=>({...object,assetId:assetOverrides[object.assetId]??object.assetId});return{season,document:{...document,layers:document.layers.map(layer=>({...layer,objects:layer.objects.map(mapObject)}))},assetOverrides}}
export function getSeasonLabel(season:SeasonKey){return season[0].toUpperCase()+season.slice(1)}
