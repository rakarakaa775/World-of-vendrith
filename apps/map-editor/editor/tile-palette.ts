export type TileOption = { id: string; label: string; terrain: 'grass' | 'sand' | 'dirt' | 'pavement' | 'water'; assetName: string; previewUrl?: string };

const ASSET_LIBRARY_RAW = 'https://raw.githubusercontent.com/rakarakaa775/Asset-library-LPC/main/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup';

export const STARTER_TILES: TileOption[] = [
  { id: 'starter-tile', label: 'Grass', terrain: 'grass', assetName: 'tile_grass.png', previewUrl: `${ASSET_LIBRARY_RAW}/tile_grass.png` },
  { id: 'sand', label: 'Sand', terrain: 'sand', assetName: 'tile_sand.png' },
  { id: 'dirt', label: 'Dirt', terrain: 'dirt', assetName: 'tile_dirt.png', previewUrl: `${ASSET_LIBRARY_RAW}/tile_dirt.png` },
  { id: 'stone-tile', label: 'Pavement', terrain: 'pavement', assetName: 'tile_pavement.png', previewUrl: `${ASSET_LIBRARY_RAW}/tile_pavement.png` },
  { id: 'water-tile', label: 'Water', terrain: 'water', assetName: 'tile_water.png' },
];
