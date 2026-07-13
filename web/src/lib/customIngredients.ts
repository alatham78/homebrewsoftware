import { useSyncExternalStore } from 'react';
import type { Fermentable, Hop, Yeast } from '@brewhaus/core';

/**
 * User-defined ingredients (fermentables, hops, yeasts), persisted in
 * localStorage on this device. Recipes copy the full ingredient data into
 * each addition, so deleting a custom entry never breaks a saved recipe.
 */

interface CustomStore<T extends { id: string }> {
  getSnapshot: () => T[];
  subscribe: (fn: () => void) => () => void;
  add: (entry: Omit<T, 'id'>) => T;
  remove: (id: string) => void;
}

function createStore<T extends { id: string }>(
  key: string,
  decorate: (entry: Omit<T, 'id'> & { id: string }) => T,
): CustomStore<T> {
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;

  const load = (): T[] => {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  };

  const persist = (next: T[]): void => {
    cache = next;
    localStorage.setItem(key, JSON.stringify(next));
    listeners.forEach((fn) => fn());
  };

  return {
    getSnapshot: load,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    add(entry) {
      const created = decorate({
        ...entry,
        id: `custom-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      } as Omit<T, 'id'> & { id: string });
      persist([...load(), created]);
      return created;
    },
    remove(id) {
      persist(load().filter((x) => x.id !== id));
    },
  };
}

export const customFermentables = createStore<Fermentable>(
  'brewhaus.customFermentables',
  (e) => ({ ...e, group: 'Custom' }) as Fermentable,
);
export const customHops = createStore<Hop>('brewhaus.customHops', (e) => e as Hop);
export const customYeasts = createStore<Yeast>('brewhaus.customYeasts', (e) => e as Yeast);

export const useCustomFermentables = (): Fermentable[] =>
  useSyncExternalStore(customFermentables.subscribe, customFermentables.getSnapshot);
export const useCustomHops = (): Hop[] =>
  useSyncExternalStore(customHops.subscribe, customHops.getSnapshot);
export const useCustomYeasts = (): Yeast[] =>
  useSyncExternalStore(customYeasts.subscribe, customYeasts.getSnapshot);
