import { describe, expect, it } from 'vitest';
import type { MapDocument } from './map-document';
import { createMapSaveController, type MapDocumentStore } from './map-save-controller';
import { createCrashRecoveryJournal } from './map-crash-recovery';

const document: MapDocument = {
  version: 1,
  id: 'test-map',
  name: 'Test Map',
  mapType: 'playable',
  width: 2,
  height: 2,
  tileSize: 32,
  layers: [
    { id: 'ground', name: 'Ground', kind: 'ground', active: true, visible: true, locked: false, cells: [], objects: [] },
  ],
};

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

describe('createMapSaveController', () => {
  it('saves through the document store and clears recovery', async () => {
    let saved: string | null = null;
    const store: MapDocumentStore = {
      save: async (value) => { saved = value; },
      load: async () => saved,
    };
    const recovery = createCrashRecoveryJournal(memoryStorage());
    const controller = createMapSaveController(store, recovery);

    controller.setDocument(document);
    controller.markDirty();
    expect(controller.getState()).toBe('dirty');
    expect(recovery.has(document.id)).toBe(true);

    expect(await controller.save()).toBe(true);
    expect(controller.getState()).toBe('saved');
    expect(recovery.has(document.id)).toBe(false);
  });

  it('loads a persisted document', async () => {
    const store: MapDocumentStore = {
      save: async () => undefined,
      load: async () => JSON.stringify(document),
    };
    const controller = createMapSaveController(store, createCrashRecoveryJournal(memoryStorage()));
    const loaded = await controller.load();
    expect(loaded?.id).toBe(document.id);
    expect(controller.getState()).toBe('clean');
  });
});
