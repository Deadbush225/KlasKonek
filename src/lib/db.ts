import { neon } from '@neondatabase/serverless';

type DbQuery = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;

let client: DbQuery | null = null;

// Lazy-initialized database client to prevent build-time crashes
export const db = async (strings: TemplateStringsArray, ...values: unknown[]) => {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured. Please add it to your environment variables.');
    }
    client = neon(connectionString) as DbQuery;
  }

  return client(strings, ...values);
};
