import type { SeasonKey } from './season-system';
export type SeasonRule={season:SeasonKey;environment:{snow:string;vegetation:string;precipitationBias:string}};
export const SUPABASE_SEASON_RULES:SeasonRule[]=[{season:'spring',environment:{snow:'melt',vegetation:'growth',precipitationBias:'rain'}},{season:'summer',environment:{snow:'absent',vegetation:'full',precipitationBias:'variable'}},{season:'autumn',environment:{snow:'absent',vegetation:'foliage_change',precipitationBias:'rain'}},{season:'winter',environment:{snow:'possible',vegetation:'dormant',precipitationBias:'snow_or_rain'}}];
export type SeasonalAssetCandidate={externalKey:string;name:string;assetPath:string|null;supportedSeasons:SeasonKey[];status:string;seasonCapable:boolean};
export const VERIFIED_SEASONAL_VARIANTS:SeasonalAssetCandidate[]=[];
