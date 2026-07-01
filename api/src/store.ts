import { CosmosClient, type Container } from '@azure/cosmos';
import type { Recipe } from '@brewhaus/core';

export interface RecipeStore {
  list(): Promise<Recipe[]>;
  get(id: string): Promise<Recipe | undefined>;
  upsert(recipe: Recipe): Promise<Recipe>;
  delete(id: string): Promise<boolean>;
}

/**
 * Cosmos DB (serverless) backed store. The database and container are
 * created on first use so a fresh deployment needs no manual setup.
 * Partition key is /id — recipe documents are small and point-read heavy,
 * which keeps RU consumption (and cost) minimal.
 */
class CosmosRecipeStore implements RecipeStore {
  private containerPromise: Promise<Container> | undefined;

  constructor(private readonly connectionString: string) {}

  private container(): Promise<Container> {
    this.containerPromise ??= (async () => {
      const client = new CosmosClient(this.connectionString);
      const { database } = await client.databases.createIfNotExists({ id: 'brewhaus' });
      const { container } = await database.containers.createIfNotExists({
        id: 'recipes',
        partitionKey: { paths: ['/id'] },
      });
      return container;
    })();
    return this.containerPromise;
  }

  async list(): Promise<Recipe[]> {
    const container = await this.container();
    const { resources } = await container.items
      .query<Recipe>('SELECT * FROM c ORDER BY c.updatedAt DESC')
      .fetchAll();
    return resources;
  }

  async get(id: string): Promise<Recipe | undefined> {
    const container = await this.container();
    const { resource } = await container.item(id, id).read<Recipe>();
    return resource ?? undefined;
  }

  async upsert(recipe: Recipe): Promise<Recipe> {
    const container = await this.container();
    const { resource } = await container.items.upsert<Recipe>(recipe);
    return (resource as Recipe | undefined) ?? recipe;
  }

  async delete(id: string): Promise<boolean> {
    const container = await this.container();
    try {
      await container.item(id, id).delete();
      return true;
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 404) return false;
      throw err;
    }
  }
}

/** In-memory store used for local development when Cosmos is not configured. */
class MemoryRecipeStore implements RecipeStore {
  private readonly recipes = new Map<string, Recipe>();

  async list(): Promise<Recipe[]> {
    return [...this.recipes.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async upsert(recipe: Recipe): Promise<Recipe> {
    this.recipes.set(recipe.id, recipe);
    return recipe;
  }

  async delete(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }
}

let store: RecipeStore | undefined;

export function getStore(): RecipeStore {
  if (!store) {
    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    store = connectionString ? new CosmosRecipeStore(connectionString) : new MemoryRecipeStore();
  }
  return store;
}
