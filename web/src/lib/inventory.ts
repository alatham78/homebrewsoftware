import { useSyncExternalStore } from 'react';
import type { Recipe } from '@brewhaus/core';
import { createStore } from './customIngredients';

/**
 * Ingredient inventory, persisted in localStorage on this device.
 * Amounts are kept in the recipe's native units: lb for fermentables,
 * oz for hops, packs for yeast, and free units for miscs.
 */

export type InventoryKind = 'fermentable' | 'hop' | 'yeast' | 'misc';

export interface InventoryItem {
  id: string;
  kind: InventoryKind;
  name: string;
  amount: number;
  unit: string;
  costPerUnit?: number;
  note?: string;
}

export const INVENTORY_UNITS: Record<InventoryKind, string> = {
  fermentable: 'lb',
  hop: 'oz',
  yeast: 'pkg',
  misc: 'each',
};

export const inventory = createStore<InventoryItem>('brewhaus.inventory', (e) => e as InventoryItem);

export const useInventory = (): InventoryItem[] =>
  useSyncExternalStore(inventory.subscribe, inventory.getSnapshot);

const nameKey = (s: string) => s.trim().toLowerCase();

/** What a recipe needs, merged by ingredient name. */
export function recipeNeeds(recipe: Recipe): Array<{ kind: InventoryKind; name: string; needed: number; unit: string }> {
  const merged = new Map<string, { kind: InventoryKind; name: string; needed: number; unit: string }>();
  const bump = (kind: InventoryKind, name: string, amount: number, unit: string) => {
    const key = `${kind}:${nameKey(name)}`;
    const cur = merged.get(key);
    if (cur) cur.needed += amount;
    else merged.set(key, { kind, name, needed: amount, unit });
  };
  for (const f of recipe.fermentables) bump('fermentable', f.name, f.amountLb, 'lb');
  for (const h of recipe.hops) bump('hop', h.name, h.amountOz, 'oz');
  if (recipe.yeast) bump('yeast', recipe.yeast.name, 1, 'pkg');
  for (const m of recipe.miscs ?? []) bump('misc', m.name, m.amount, m.unit);
  return [...merged.values()];
}

/** On-hand amount for an ingredient by kind + name. */
export function onHand(kind: InventoryKind, name: string): number {
  return inventory
    .getSnapshot()
    .filter((i) => i.kind === kind && nameKey(i.name) === nameKey(name))
    .reduce((s, i) => s + i.amount, 0);
}

/**
 * Deduct a recipe's ingredients from inventory (floor at zero).
 * Returns the number of matched inventory line items.
 */
export function deductRecipe(recipe: Recipe): number {
  let matched = 0;
  const items = [...inventory.getSnapshot()];
  for (const need of recipeNeeds(recipe)) {
    let remaining = need.needed;
    for (const item of items) {
      if (remaining <= 0) break;
      if (item.kind !== need.kind || nameKey(item.name) !== nameKey(need.name)) continue;
      const take = Math.min(item.amount, remaining);
      if (take > 0) {
        item.amount = Math.round((item.amount - take) * 100) / 100;
        remaining -= take;
        matched++;
        // persist via remove+add to reuse the store API
        inventory.remove(item.id);
        inventory.add({ ...item });
      }
    }
  }
  return matched;
}
