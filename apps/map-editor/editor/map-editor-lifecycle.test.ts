import { describe, expect, it, vi } from 'vitest';
import type { MapDocument } from './map-document';
import { createMapEditorLifecycle } from './map-editor-lifecycle';
import type { MapSaveController } from './map-save-controller';
import type { MapDocumentAutosaver } from './map-persistence';

const document: MapDocument = {
  version: 1,
  id: 'lifecycle-map',
  name: 'Lifecycle Map',
  mapType: 'playable',
  width: 2,
  height: 2,
  tileSize: 32,
  layers: [{ id: 'ground', name: 'Ground', kind: 'ground', active: true, visible: true, locked: false, cells: [], objects: [] }],
};

describe('createMapEditorLifecycle', () => {
  it('opens, records changes, and saves before close', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const controller = {
      setDocument: vi.fn(), markDirty: vi.fn(), save, load: vi.fn(), recover: vi.fn(),
      getState: vi.fn().mockReturnValue('dirty'), getDocument: vi.fn().mockReturnValue(document), clearRecovery: vi.fn(),
    } as unknown as MapSaveController;
    const lifecycle = createMapEditorLifecycle(controller);

    await lifecycle.open(document);
    lifecycle.change(document);
    expect(controller.setDocument).toHaveBeenCalledWith(document);
    expect(controller.markDirty).toHaveBeenCalled();
    expect(await lifecycle.beforeClose()).toBe(true);
    expect(save).toHaveBeenCalled();
  });

  it('schedules autosave for changes and flushes it on save', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const controller = {
      setDocument: vi.fn(), markDirty: vi.fn(), save, load: vi.fn(), recover: vi.fn(),
      getState: vi.fn().mockReturnValue('dirty'), getDocument: vi.fn().mockReturnValue(document), clearRecovery: vi.fn(),
    } as unknown as MapSaveController;
    const autosaver = {
      schedule: vi.fn(), flush: vi.fn().mockResolvedValue({ ok: true }), cancel: vi.fn(),
    } as unknown as MapDocumentAutosaver;
    const lifecycle = createMapEditorLifecycle(controller, autosaver);

    lifecycle.change(document, 'version-1');
    expect(autosaver.schedule).toHaveBeenCalledWith(document, 'version-1');
    expect(await lifecycle.save()).toBe(true);
    expect(autosaver.flush).toHaveBeenCalled();
  });

  it('exposes the save status snapshot for the UI', () => {
    const controller = {
      setDocument: vi.fn(), markDirty: vi.fn(), save: vi.fn(), load: vi.fn(), recover: vi.fn(),
      getState: vi.fn().mockReturnValue('dirty'), getDocument: vi.fn().mockReturnValue(document), clearRecovery: vi.fn(),
    } as unknown as MapSaveController;
    const lifecycle = createMapEditorLifecycle(controller);
    const status = lifecycle.getSaveStatus();
    expect(status.status).toBe('dirty');
    expect(status.hasUnsavedChanges).toBe(true);
    expect(status.canSave).toBe(true);
  });

  it('cancels pending autosave on dispose', () => {
    const controller = {
      setDocument: vi.fn(), markDirty: vi.fn(), save: vi.fn(), load: vi.fn(), recover: vi.fn(),
      getState: vi.fn().mockReturnValue('clean'), getDocument: vi.fn(), clearRecovery: vi.fn(),
    } as unknown as MapSaveController;
    const autosaver = { schedule: vi.fn(), flush: vi.fn(), cancel: vi.fn() } as unknown as MapDocumentAutosaver;
    const lifecycle = createMapEditorLifecycle(controller, autosaver);
    lifecycle.dispose();
    expect(autosaver.cancel).toHaveBeenCalled();
  });
});
