export type MapSaveStatus =
  | 'clean'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'recovery-available'
  | 'error';

export type MapSaveStatusSnapshot = {
  status: MapSaveStatus;
  message: string;
  canSave: boolean;
  hasUnsavedChanges: boolean;
  hasRecovery: boolean;
};

const messages: Record<MapSaveStatus, string> = {
  clean: 'All changes saved.',
  dirty: 'Unsaved changes.',
  saving: 'Saving changes…',
  saved: 'Changes saved.',
  'recovery-available': 'A recovery snapshot is available.',
  error: 'Save failed. Your local recovery snapshot is preserved.',
};

export function createMapSaveStatusSnapshot(
  status: MapSaveStatus,
  hasRecovery = false,
): MapSaveStatusSnapshot {
  const effectiveStatus = hasRecovery && status === 'clean' ? 'recovery-available' : status;
  return {
    status: effectiveStatus,
    message: messages[effectiveStatus],
    canSave: effectiveStatus === 'dirty' || effectiveStatus === 'error' || effectiveStatus === 'recovery-available',
    hasUnsavedChanges: effectiveStatus === 'dirty' || effectiveStatus === 'error',
    hasRecovery,
  };
}

export function isBlockingSaveStatus(status: MapSaveStatus): boolean {
  return status === 'saving';
}
