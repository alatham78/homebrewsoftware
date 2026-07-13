import { CosmosClient, type Container, type Database } from '@azure/cosmos';

interface Doc {
  id: string;
  updatedAt: string;
}

export interface DocStore<T extends Doc> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  upsert(doc: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Cosmos DB (serverless/free tier) backed store. Database and containers are
 * created on first use so a fresh deployment needs no manual setup.
 * Partition key is /id — documents are small and point-read heavy, which
 * keeps RU consumption (and cost) minimal.
 */
class CosmosDocStore<T extends Doc> implements DocStore<T> {
  private containerPromise: Promise<Container> | undefined;

  constructor(
    private readonly databasePromise: Promise<Database>,
    private readonly containerId: string,
  ) {}

  private container(): Promise<Container> {
    this.containerPromise ??= (async () => {
      const database = await this.databasePromise;
      const { container } = await database.containers.createIfNotExists({
        id: this.containerId,
        partitionKey: { paths: ['/id'] },
      });
      return container;
    })();
    return this.containerPromise;
  }

  async list(): Promise<T[]> {
    const container = await this.container();
    const { resources } = await container.items
      .query<T>('SELECT * FROM c ORDER BY c.updatedAt DESC')
      .fetchAll();
    return resources;
  }

  async get(id: string): Promise<T | undefined> {
    const container = await this.container();
    const { resource } = await container.item(id, id).read<T>();
    return resource ?? undefined;
  }

  async upsert(doc: T): Promise<T> {
    const container = await this.container();
    const { resource } = await container.items.upsert<T>(doc);
    return (resource as T | undefined) ?? doc;
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
class MemoryDocStore<T extends Doc> implements DocStore<T> {
  private readonly docs = new Map<string, T>();

  async list(): Promise<T[]> {
    return [...this.docs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<T | undefined> {
    return this.docs.get(id);
  }

  async upsert(doc: T): Promise<T> {
    this.docs.set(doc.id, doc);
    return doc;
  }

  async delete(id: string): Promise<boolean> {
    return this.docs.delete(id);
  }
}

let databasePromise: Promise<Database> | undefined;
const stores = new Map<string, DocStore<Doc>>();

export function getStore<T extends Doc>(containerId: string): DocStore<T> {
  let store = stores.get(containerId);
  if (!store) {
    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    if (connectionString) {
      databasePromise ??= (async () => {
        const client = new CosmosClient(connectionString);
        const { database } = await client.databases.createIfNotExists({ id: 'brewhaus' });
        return database;
      })();
      store = new CosmosDocStore(databasePromise, containerId);
    } else {
      store = new MemoryDocStore();
    }
    stores.set(containerId, store);
  }
  return store as DocStore<T>;
}
