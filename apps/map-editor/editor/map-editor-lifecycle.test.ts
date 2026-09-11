import { describe, expect, it, vi } from 'vitest';
import type { MapDocument } from './map-document';
import { createMapEditorLifecycle } from './map-editor-lifecycle';
import type { MapSaveController } from './map-save-controller';

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
      setDocument: vi.fn(),
      markDirty: vi.fn(),
      save,
      load: vi.fn(),
      recover: vi.fn(),
      getState: vi.fn().mockReturnValue('dirty'),
      getDocument: vi.fn().mockReturnValue(document),
      clearRecovery: vi.fn(),
    } as unknown as MapSaveController;
    const lifecycle = createMapEditorLifecycle(controller);

    await lifecycle.open(document);
    lifecycle.change(document);
    expect(controller.setDocument).toHaveBeenCalledWith(document);
    expect(controller.markDirty).toHaveBeenCalled();
    expect(await lifecycle.beforeClose()).toBe(true);
    expect(save).toHaveBeenCalled();
  });
});
