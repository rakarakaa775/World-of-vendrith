import type { MapDocument } from './map-document';
import type { MapSaveController } from './map-save-controller';

export type MapEditorLifecycle = {
  open(document?: MapDocument): Promise<MapDocument | null>;
  change(document: MapDocument): void;
  save(): Promise<boolean>;
  recover(): MapDocument | null;
  beforeClose(): Promise<boolean>;
  dispose(): void;
};

export function createMapEditorLifecycle(controller: MapSaveController): MapEditorLifecycle {
  return {
    async open(document) {
      if (document) {
        controller.setDocument(document);
        return document;
      }
      return controller.load();
    },
    change(document) {
      controller.setDocument(document);
      controller.markDirty();
    },
    save() {
      return controller.save();
    },
    recover() {
      return controller.recover();
    },
    async beforeClose() {
      const state = controller.getState();
      if (state !== 'dirty' && state !== 'error') return true;
      return controller.save();
    },
    dispose() {
      // Lifecycle ownership is intentionally limited to save/recovery orchestration.
      // The caller owns DOM listeners and rendering resources.
    },
  };
}
