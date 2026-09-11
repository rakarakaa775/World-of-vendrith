import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

export type RecoveryJournalEntry = {
  mapId: string;
  savedAt: string;
  snapshot: string;
};

export type CrashRecoveryJournal = {
  write(document: MapDocument): void;
  read(mapId: string): MapDocument | null;
  clear(mapId: string): void;
  has(mapId: string): boolean;
};

export function createCrashRecoveryJournal(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = globalThis.localStorage,
  keyPrefix = 'vandrith.map-editor.recovery',
): CrashRecoveryJournal {
  const keyFor = (mapId: string) => `${keyPrefix}.${mapId}`;

  return {
    write(document) {
      const entry: RecoveryJournalEntry = {
        mapId: document.id,
        savedAt: new Date().toISOString(),
        snapshot: serializeMapDocument(document),
      };
      storage.setItem(keyFor(document.id), JSON.stringify(entry));
    },
    read(mapId) {
      const raw = storage.getItem(keyFor(mapId));
      if (!raw) return null;
      try {
        const entry = JSON.parse(raw) as RecoveryJournalEntry;
        if (entry.mapId !== mapId || typeof entry.snapshot !== 'string') return null;
        return parseMapDocument(entry.snapshot);
      } catch {
        return null;
      }
    },
    clear(mapId) {
      storage.removeItem(keyFor(mapId));
    },
    has(mapId) {
      return storage.getItem(keyFor(mapId)) !== null;
    },
  };
}
