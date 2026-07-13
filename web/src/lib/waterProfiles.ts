import { useSyncExternalStore } from 'react';
import type { WaterProfile } from '@brewhaus/core';
import { createStore } from './customIngredients';

/**
 * User-saved source water profiles (typically entered from a Ward Labs
 * report), persisted in localStorage on this device. Recipes copy the ion
 * profile into the recipe itself, so deleting a saved profile never breaks
 * a saved recipe.
 */

export interface SavedWaterProfile {
  id: string;
  name: string;
  profile: WaterProfile;
  /** Free-text provenance, e.g. "Ward Labs W-6, sampled 2026-06-02" */
  note: string;
}

export const savedWaterProfiles = createStore<SavedWaterProfile>(
  'brewhaus.waterProfiles',
  (e) => e as SavedWaterProfile,
);

export const useSavedWaterProfiles = (): SavedWaterProfile[] =>
  useSyncExternalStore(savedWaterProfiles.subscribe, savedWaterProfiles.getSnapshot);
