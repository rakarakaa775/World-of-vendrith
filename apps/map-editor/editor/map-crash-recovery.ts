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

  function readState(mapId: string): MapDocument | null {
    try {
      const raw = storage.getItem(keyFor(mapId));
      if (!raw) return null;
      const entry = JSON.parse(raw) as Partial<RecoveryJournalEntry>;
      if (entry.mapId !== mapId || typeof entry.snapshot !== 'string') return null;
      // The envelope key alone is not authoritative: the embedded document
      // must also match the requested map ID before recovery can be adopted.
      return parseMapDocument(entry.snapshot, mapId);
    } catch {
      // Storage can throw in restricted/private browsing contexts. Recovery
      // is best-effort and must not prevent the editor from opening.
      return null;
    }
  }

  return {
    write(document) {
      const entry: RecoveryJournalEntry = {
        mapId: document.id,
        savedAt: new Date().toISOString(),
        snapshot: serializeMapDocument(document),
      };
      storage.setItem(keyFor(document.id), JSON.stringify(entry));
    },
    read: readState,
    clear(mapId) {
      storage.removeItem(keyFor(mapId));
    },
    has(mapId) {
      // Report a recovery only when it is parseable and identity-safe.
      return readState(mapId) !== null;
    },
  };
}
