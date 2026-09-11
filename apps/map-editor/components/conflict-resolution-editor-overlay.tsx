"use client";

import type { MapDocument } from "../editor/map-document";
import type { MapMergeResult } from "../editor/map-entity-merge";
import type { ConflictResolutionSession } from "../editor/map-conflict-resolution-ui-model";
import { ConflictResolutionPanel } from "./conflict-resolution-panel";

export type ConflictResolutionEditorOverlayProps = {
  result: MapMergeResult;
  session: ConflictResolutionSession;
  onCancel: () => void;
  onResolved: (document: MapDocument) => void | Promise<void>;
};

export function ConflictResolutionEditorOverlay({ result, session, onCancel, onResolved }: ConflictResolutionEditorOverlayProps) {
  return (
    <ConflictResolutionPanel
      result={result}
      session={session}
      onCancel={onCancel}
      onApply={onResolved}
    />
  );
}
