import { describe, expect, it } from 'vitest';
import { createMapSaveStatusSnapshot, isBlockingSaveStatus } from './map-save-status';

describe('map save status', () => {
  it('exposes dirty state as unsaved and saveable', () => {
    const snapshot = createMapSaveStatusSnapshot('dirty');
    expect(snapshot.hasUnsavedChanges).toBe(true);
    expect(snapshot.canSave).toBe(true);
    expect(snapshot.message).toContain('Unsaved');
  });

  it('exposes recovery availability without hiding it as clean', () => {
    const snapshot = createMapSaveStatusSnapshot('clean', true);
    expect(snapshot.status).toBe('recovery-available');
    expect(snapshot.hasRecovery).toBe(true);
    expect(snapshot.canSave).toBe(true);
  });

  it('blocks concurrent save actions while saving', () => {
    expect(isBlockingSaveStatus('saving')).toBe(true);
    expect(isBlockingSaveStatus('dirty')).toBe(false);
  });
});
