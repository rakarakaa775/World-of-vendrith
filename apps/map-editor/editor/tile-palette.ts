export type TileOption = { id: string; label: string; terrain: 'grass' | 'sand' | 'dirt' | 'pavement' | 'water' };

export const STARTER_TILES: TileOption[] = [
  { id: 'starter-tile', label: 'Grass', terrain: 'grass' },
  { id: 'sand', label: 'Sand', terrain: 'sand' },
  { id: 'dirt', label: 'Dirt', terrain: 'dirt' },
  { id: 'stone-tile', label: 'Pavement', terrain: 'pavement' },
  { id: 'water-tile', label: 'Water', terrain: 'water' },
];
