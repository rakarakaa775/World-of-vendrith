import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';
import { createCrashRecoveryJournal, type CrashRecoveryJournal } from './map-crash-recovery';

export interface MapDocumentStore {
  save(serialized: string): Promise<void>;
  load(): Promise<string | null>;
}

export type MapSaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'recovery-available' | 'error';

export type MapSaveController = {
  getState(): MapSaveState;
  getDocument(): MapDocument | null;
  setDocument(document: MapDocument): void;
  markDirty(): void;
  save(): Promise<boolean>;
  load(): Promise<MapDocument | null>;
  recover(): MapDocument | null;
  clearRecovery(): void;
};

export function createMapSaveController(
  store: MapDocumentStore,
  recovery: CrashRecoveryJournal = createCrashRecoveryJournal(),
): MapSaveController {
  let document: MapDocument | null = null;
  let state: MapSaveState = 'clean';

  return {
    getState: () => state,
    getDocument: () => document,
    setDocument(next) {
      document = next;
      state = recovery.has(next.id) ? 'recovery-available' : 'clean';
    },
    markDirty() {
      if (document) {
        recovery.write(document);
        state = 'dirty';
      }
    },
    async save() {
      if (!document) return false;
      state = 'saving';
      try {
        await store.save(serializeMapDocument(document));
        recovery.clear(document.id);
        state = 'saved';
        return true;
      } catch {
        state = 'error';
        return false;
      }
    },
    async load() {
      state = 'saving';
      try {
        const serialized = await store.load();
        if (!serialized) {
          state = 'clean';
          return null;
        }
        document = parseMapDocument(serialized);
        state = recovery.has(document.id) ? 'recovery-available' : 'clean';
        return document;
      } catch {
        state = 'error';
        return null;
      }
    },
    recover() {
      if (!document) return null;
      const recovered = recovery.read(document.id);
      if (!recovered) return null;
      document = recovered;
      state = 'dirty';
      return recovered;
    },
    clearRecovery() {
      if (document) recovery.clear(document.id);
      state = document ? 'clean' : 'clean';
    },
  };
}
