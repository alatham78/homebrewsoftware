import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { newRecipe, recipeStats, toBeerXml, type Recipe } from '@brewhaus/core';
import { getStore } from './store.js';

const json = (status: number, body: unknown): HttpResponseInit => ({
  status,
  jsonBody: body,
});

/**
 * Validate and normalize an incoming recipe payload. We rebuild the object
 * through newRecipe() so missing fields get defaults and unknown fields
 * are carried through Cosmos untouched.
 */
function normalizeRecipe(payload: unknown): Recipe | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const p = payload as Partial<Recipe>;
  if (typeof p.name !== 'string' || p.name.trim() === '') return undefined;
  const recipe = newRecipe(p);
  recipe.updatedAt = new Date().toISOString();
  return recipe;
}

app.http('recipes-list', {
  methods: ['GET'],
  route: 'recipes',
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> => {
    const recipes = await getStore().list();
    return json(200, recipes);
  },
});

app.http('recipes-create', {
  methods: ['POST'],
  route: 'recipes',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    const recipe = normalizeRecipe(await req.json().catch(() => undefined));
    if (!recipe) return json(400, { error: 'A recipe with a non-empty name is required' });
    const saved = await getStore().upsert(recipe);
    ctx.log(`Created recipe ${saved.id}`);
    return json(201, saved);
  },
});

app.http('recipes-get', {
  methods: ['GET'],
  route: 'recipes/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const recipe = await getStore().get(req.params.id ?? '');
    return recipe ? json(200, recipe) : json(404, { error: 'Recipe not found' });
  },
});

app.http('recipes-update', {
  methods: ['PUT'],
  route: 'recipes/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const id = req.params.id ?? '';
    const recipe = normalizeRecipe(await req.json().catch(() => undefined));
    if (!recipe) return json(400, { error: 'A recipe with a non-empty name is required' });
    recipe.id = id;
    const saved = await getStore().upsert(recipe);
    return json(200, saved);
  },
});

app.http('recipes-delete', {
  methods: ['DELETE'],
  route: 'recipes/{id}',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const deleted = await getStore().delete(req.params.id ?? '');
    return deleted ? json(204, undefined) : json(404, { error: 'Recipe not found' });
  },
});

app.http('recipes-stats', {
  methods: ['GET'],
  route: 'recipes/{id}/stats',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const recipe = await getStore().get(req.params.id ?? '');
    if (!recipe) return json(404, { error: 'Recipe not found' });
    return json(200, recipeStats(recipe));
  },
});

app.http('recipes-beerxml', {
  methods: ['GET'],
  route: 'recipes/{id}/beerxml',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const recipe = await getStore().get(req.params.id ?? '');
    if (!recipe) return json(404, { error: 'Recipe not found' });
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${recipe.name.replace(/[^\w.-]+/g, '_')}.xml"`,
      },
      body: toBeerXml(recipe),
    };
  },
});

app.http('health', {
  methods: ['GET'],
  route: 'health',
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> =>
    json(200, { status: 'ok', storage: process.env.COSMOS_CONNECTION_STRING ? 'cosmos' : 'memory' }),
});
