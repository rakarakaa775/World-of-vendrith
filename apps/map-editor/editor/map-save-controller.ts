import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';
import { createCrashRecoveryJournal, type CrashRecoveryJournal } from './map-crash-recovery';
import { createPersistenceQueue, type PersistenceQueue } from './map-network-recovery';

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
  pendingPersistenceCount(): number;
  retryPending(): Promise<number>;
};

export function createMapSaveController(
  store: MapDocumentStore,
  recovery: CrashRecoveryJournal = createCrashRecoveryJournal(),
  pending: PersistenceQueue<string> = createPersistenceQueue<string>(),
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
      const serialized = serializeMapDocument(document);
      try {
        await store.save(serialized);
        recovery.clear(document.id);
        state = 'saved';
        return true;
      } catch (error) {
        pending.enqueue(serialized);
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
      state = 'clean';
    },
    pendingPersistenceCount() {
      return pending.list().length;
    },
    async retryPending() {
      let flushed = 0;
      for (;;) {
        const entry = pending.peek();
        if (!entry) break;
        try {
          await store.save(entry.payload);
          pending.remove(entry.id);
          flushed += 1;
        } catch {
          state = 'error';
          break;
        }
      }
      if (flushed > 0 && !pending.peek()) state = 'saved';
      return flushed;
    },
  };
}
