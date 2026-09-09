export type MapLayerKind = 'ground' | 'objects' | 'collision';

export type TileCell = {
  tileId: string | null;
};

export type MapLayer = {
  id: string;
  name: string;
  kind: MapLayerKind;
  visible: boolean;
  cells: TileCell[];
};

export type MapDocument = {
  version: 1;
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  layers: MapLayer[];
};

export const createStarterMap = (): MapDocument => ({
  version: 1,
  id: 'starter-map',
  name: 'Starter Map',
  width: 20,
  height: 12,
  tileSize: 32,
  layers: [
    { id: 'ground', name: 'Ground', kind: 'ground', visible: true, cells: [] },
    { id: 'objects', name: 'Objects', kind: 'objects', visible: true, cells: [] },
    { id: 'collision', name: 'Collision', kind: 'collision', visible: true, cells: [] },
  ],
});
