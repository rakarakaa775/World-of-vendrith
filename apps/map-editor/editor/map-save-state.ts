import type { MapDocument } from './map-document';

export type SaveConnection = {
  mapId: string;
  document: MapDocument;
  version: number;
};

export function resolveSaveDocument(localDocument: MapDocument | undefined, connection: SaveConnection): MapDocument {
  if (!localDocument) throw new Error('No active map document');
  if (localDocument.mapType !== 'world' || localDocument.id !== connection.mapId) {
    throw new Error('Active map is not the connected World Map');
  }
  return localDocument;
}
