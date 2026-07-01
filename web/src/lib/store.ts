import { newRecipe, type Recipe } from '@brewhaus/core';

/**
 * Recipe persistence: talks to the serverless API when it's reachable and
 * transparently falls back to localStorage so the app is fully usable
 * offline and in local `vite dev` without the Functions host running.
 */

const LS_KEY = 'brewhaus.recipes';
let apiAvailable: boolean | undefined;

async function probeApi(): Promise<boolean> {
  if (apiAvailable !== undefined) return apiAvailable;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2500) });
    apiAvailable = res.ok;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

function readLocal(): Recipe[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : seedRecipes();
  } catch {
    return seedRecipes();
  }
}

function writeLocal(recipes: Recipe[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(recipes));
}

export async function listRecipes(): Promise<{ recipes: Recipe[]; source: 'cloud' | 'local' }> {
  if (await probeApi()) {
    const res = await fetch('/api/recipes');
    if (res.ok) return { recipes: (await res.json()) as Recipe[], source: 'cloud' };
  }
  return { recipes: readLocal(), source: 'local' };
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  const updated = { ...recipe, updatedAt: new Date().toISOString() };
  if (await probeApi()) {
    const res = await fetch(`/api/recipes/${encodeURIComponent(updated.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) return (await res.json()) as Recipe;
  }
  const all = readLocal().filter((r) => r.id !== updated.id);
  writeLocal([updated, ...all]);
  return updated;
}

export async function deleteRecipe(id: string): Promise<void> {
  if (await probeApi()) {
    const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) return;
  }
  writeLocal(readLocal().filter((r) => r.id !== id));
}

/** Two starter recipes so the first run isn't an empty screen. */
export function seedRecipes(): Recipe[] {
  const ipa = newRecipe({
    id: 'seed-hazy-daydream',
    name: 'Hazy Daydream IPA',
    author: 'BrewHaus',
    styleId: 'hazy-ipa',
    batchSizeGal: 5,
    boilSizeGal: 6.5,
    efficiencyPct: 72,
    fermentables: [
      { fermentableId: 'pale-2row', name: '2-Row Pale Malt (US)', type: 'grain', potential: 1.037, lovibond: 1.8, mustMash: true, amountLb: 11 },
      { fermentableId: 'flaked-oats', name: 'Flaked Oats', type: 'adjunct', potential: 1.033, lovibond: 1.0, mustMash: true, amountLb: 1.5 },
      { fermentableId: 'white-wheat', name: 'White Wheat Malt (US)', type: 'grain', potential: 1.04, lovibond: 2.4, mustMash: true, amountLb: 1.5 },
    ],
    hops: [
      { hopId: 'magnum', name: 'Magnum', alpha: 12, amountOz: 0.5, use: 'boil', timeMin: 60, form: 'pellet' },
      { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 2, use: 'whirlpool', timeMin: 20, form: 'pellet' },
      { hopId: 'galaxy', name: 'Galaxy', alpha: 14, amountOz: 2, use: 'whirlpool', timeMin: 20, form: 'pellet' },
      { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 3, use: 'dry hop', timeMin: 3, form: 'pellet' },
      { hopId: 'galaxy', name: 'Galaxy', alpha: 14, amountOz: 3, use: 'dry hop', timeMin: 3, form: 'pellet' },
    ],
    yeast: { yeastId: 'wy1318', name: 'London Ale III', lab: 'Wyeast', productId: '1318', form: 'liquid', attenuation: 73 },
    mash: { mashTempF: 152, mashTimeMin: 60, ratioQtPerLb: 1.5 },
    notes: 'Soft water profile (2:1 chloride:sulfate). Dry hop at high krausen for biotransformation.',
  });

  const stout = newRecipe({
    id: 'seed-midnight-velvet',
    name: 'Midnight Velvet Stout',
    author: 'BrewHaus',
    styleId: 'irish-stout',
    batchSizeGal: 5,
    boilSizeGal: 6.5,
    efficiencyPct: 72,
    fermentables: [
      { fermentableId: 'pale-maris-otter', name: 'Maris Otter (UK)', type: 'grain', potential: 1.038, lovibond: 3.0, mustMash: true, amountLb: 7 },
      { fermentableId: 'flaked-wheat', name: 'Flaked Wheat', type: 'adjunct', potential: 1.034, lovibond: 1.6, mustMash: true, amountLb: 1 },
      { fermentableId: 'roasted-barley', name: 'Roasted Barley', type: 'grain', potential: 1.025, lovibond: 300, mustMash: true, amountLb: 1 },
    ],
    hops: [
      { hopId: 'ekg', name: 'East Kent Goldings', alpha: 5, amountOz: 2.25, use: 'boil', timeMin: 60, form: 'pellet' },
    ],
    yeast: { yeastId: 's-04', name: 'SafAle S-04', lab: 'Fermentis', productId: 'S-04', form: 'dry', attenuation: 75 },
    mash: { mashTempF: 150, mashTimeMin: 60, ratioQtPerLb: 1.5 },
    carbonationVols: 1.9,
    notes: 'Serve on nitro if you can. Low carbonation is period-correct.',
  });

  return [ipa, stout];
}
