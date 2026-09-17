import type { MapDocument } from './map-document';

export type SaveConnection = {
  mapId: string;
  document: MapDocument;
  version: number;
};

export type MapNavigationPersistenceState = {
  connectedMapId: string | null;
  baseDocument: MapDocument | null;
  version: number;
};

/**
 * Changing the active map is a persistence boundary. Unless the selected map
 * is already the connected map, discard the old persistence context so Save
 * cannot accidentally publish a stale baseline/version for the new map.
 */
export function resolveMapNavigationPersistence(
  nextMapId: string,
  connection: MapNavigationPersistenceState,
): MapNavigationPersistenceState {
  if (connection.connectedMapId === nextMapId && connection.baseDocument?.id === nextMapId) {
    return connection;
  }
  return { connectedMapId: null, baseDocument: null, version: 0 };
}

export function resolveSaveDocument(localDocument: MapDocument | undefined, connection: SaveConnection): MapDocument {
  if (!localDocument) throw new Error('No active map document');
  if (localDocument.mapType !== 'world' || localDocument.id !== connection.mapId) {
    throw new Error('Active map is not the connected World Map');
  }
  return localDocument;
}
