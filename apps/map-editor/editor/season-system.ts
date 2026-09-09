export type SeasonKey='spring'|'summer'|'autumn'|'winter';
export type SeasonDefinition={key:SeasonKey;displayName:string;ordinal:number};
export type SeasonalVariant={assetId:string;season:SeasonKey;verified:boolean;metadata:Record<string,unknown>};
export const SEASONS:SeasonDefinition[]=[{key:'spring',displayName:'Spring',ordinal:1},{key:'summer',displayName:'Summer',ordinal:2},{key:'autumn',displayName:'Autumn',ordinal:3},{key:'winter',displayName:'Winter',ordinal:4}];
export type WorldSeasonState={currentSeason:SeasonKey;enabled:boolean};
export function createSeasonState(currentSeason:SeasonKey='spring'):WorldSeasonState{return{currentSeason,enabled:true}}
export function getSeasonalAsset(baseAssetId:string,season:SeasonKey,variants:SeasonalVariant[]):string{return variants.find(v=>v.season===season&&v.verified)?.assetId??baseAssetId}
export function nextSeason(season:SeasonKey):SeasonKey{const i=SEASONS.findIndex(s=>s.key===season);return SEASONS[(i+1)%SEASONS.length].key}
