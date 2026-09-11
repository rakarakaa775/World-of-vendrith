import type { MapDocument } from './map-document';
import type { MapSaveController } from './map-save-controller';
import type { MapDocumentAutosaver } from './map-persistence';
import { createMapSaveStatusSnapshot, type MapSaveStatusSnapshot } from './map-save-status';

export type MapEditorLifecycle = {
  open(document?: MapDocument): Promise<MapDocument | null>;
  change(document: MapDocument, versionId?: string | null): void;
  getSaveStatus(): MapSaveStatusSnapshot;
  save(): Promise<boolean>;
  recover(): MapDocument | null;
  beforeClose(): Promise<boolean>;
  dispose(): void;
};

export function createMapEditorLifecycle(
  controller: MapSaveController,
  autosaver?: MapDocumentAutosaver,
): MapEditorLifecycle {
  return {
    async open(document) {
      if (document) {
        controller.setDocument(document);
        return document;
      }
      return controller.load();
    },
    change(document, versionId = null) {
      controller.setDocument(document);
      controller.markDirty();
      autosaver?.schedule(document, versionId);
    },
    getSaveStatus() {
      const document = controller.getDocument();
      const hasRecovery = document ? controller.getState() === 'recovery-available' : false;
      return createMapSaveStatusSnapshot(controller.getState(), hasRecovery);
    },
    async save() {
      const saved = await controller.save();
      if (saved) await autosaver?.flush();
      return saved;
    },
    recover() {
      const recovered = controller.recover();
      if (recovered) autosaver?.schedule(recovered);
      return recovered;
    },
    async beforeClose() {
      const state = controller.getState();
      if (state !== 'dirty' && state !== 'error') {
        await autosaver?.flush();
        return true;
      }
      return this.save();
    },
    dispose() {
      autosaver?.cancel();
    },
  };
}
