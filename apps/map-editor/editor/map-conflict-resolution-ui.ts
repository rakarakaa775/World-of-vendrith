import type { MapConflict, ConflictResolution } from './map-conflict-detection';

export type ConflictResolutionOption = {
  id: ConflictResolution;
  label: string;
  description: string;
  destructive: boolean;
};

export type ConflictResolutionViewModel = {
  title: string;
  message: string;
  conflict: MapConflict;
  options: ConflictResolutionOption[];
};

export function createConflictResolutionViewModel(
  conflict: MapConflict,
): ConflictResolutionViewModel {
  return {
    title: 'Map changes conflict',
    message: 'The map changed both locally and remotely. Choose how to continue.',
    conflict,
    options: [
      {
        id: 'keep-local',
        label: 'Keep Local',
        description: 'Use the changes currently in this editor.',
        destructive: true,
      },
      {
        id: 'keep-remote',
        label: 'Keep Remote',
        description: 'Discard local changes and use the latest remote snapshot.',
        destructive: true,
      },
      {
        id: 'manual',
        label: 'Merge Manually',
        description: 'Open a comparison view and resolve differences before saving.',
        destructive: false,
      },
    ],
  };
}
