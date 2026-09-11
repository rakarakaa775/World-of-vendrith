import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

export type RecoveryEntry = {
  mapId: string;
  savedAt: string;
  document: MapDocument;
};

export interface MapRecoveryStore {
  write(document: MapDocument): void;
  read(mapId: string): RecoveryEntry | null;
  clear(mapId: string): void;
}

const keyFor = (mapId: string) => `vandrith.map-editor.recovery.${mapId}`;

export function createLocalMapRecoveryStore(storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null): MapRecoveryStore {
  return {
    write(document) {
      if (!storage) return;
      storage.setItem(keyFor(document.id), JSON.stringify({
        mapId: document.id,
        savedAt: new Date().toISOString(),
        document: JSON.parse(serializeMapDocument(document)),
      }));
    },
    read(mapId) {
      if (!storage) return null;
      const raw = storage.getItem(keyFor(mapId));
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as RecoveryEntry;
        return {
          mapId: parsed.mapId,
          savedAt: parsed.savedAt,
          document: parseMapDocument(JSON.stringify(parsed.document)),
        };
      } catch {
        storage.removeItem(keyFor(mapId));
        return null;
      }
    },
    clear(mapId) {
      storage?.removeItem(keyFor(mapId));
    },
  };
}

export type RecoveryController = {
  capture(document: MapDocument): void;
  recover(mapId: string): RecoveryEntry | null;
  discard(mapId: string): void;
};

export function createRecoveryController(store: MapRecoveryStore = createLocalMapRecoveryStore()): RecoveryController {
  return {
    capture: (document) => store.write(document),
    recover: (mapId) => store.read(mapId),
    discard: (mapId) => store.clear(mapId),
  };
}
