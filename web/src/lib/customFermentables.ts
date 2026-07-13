import { useSyncExternalStore } from 'react';
import type { Fermentable } from '@brewhaus/core';

/**
 * User-defined fermentables, persisted in localStorage on this device.
 * Recipes copy the full ingredient data into each addition, so deleting a
 * custom entry never breaks a saved recipe.
 */

const LS_KEY = 'brewhaus.customFermentables';
const listeners = new Set<() => void>();
let cache: Fermentable[] | null = null;

function load(): Fermentable[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY);
    cache = raw ? (JSON.parse(raw) as Fermentable[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(next: Fermentable[]): void {
  cache = next;
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn());
}

export function getCustomFermentables(): Fermentable[] {
  return load();
}

export function addCustomFermentable(entry: Omit<Fermentable, 'id' | 'group'>): Fermentable {
  const created: Fermentable = {
    ...entry,
    id: `custom-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    group: 'Custom',
  };
  persist([...load(), created]);
  return created;
}

export function removeCustomFermentable(id: string): void {
  persist(load().filter((f) => f.id !== id));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** React hook: the current custom fermentable list, live across components. */
export function useCustomFermentables(): Fermentable[] {
  return useSyncExternalStore(subscribe, load);
}
