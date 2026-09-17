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

/**
 * Resolve the document that Save may publish after the asynchronous connection
 * step. A World document with a stale/seed identity must not be published
 * against the authoritative connection; in that case use the authoritative
 * loaded document returned by the connection. Non-World documents remain
 * rejected because this phase persists only the World Map.
 */
export function resolveSaveDocument(localDocument: MapDocument | undefined, connection: SaveConnection): MapDocument {
  if (!localDocument) throw new Error('No active map document');
  if (localDocument.mapType !== 'world') {
    throw new Error('Active map is not the connected World Map');
  }
  if (localDocument.id !== connection.mapId) {
    if (connection.document.mapType !== 'world' || connection.document.id !== connection.mapId) {
      throw new Error('Connected World Map identity is invalid');
    }
    return connection.document;
  }
  return localDocument;
}
