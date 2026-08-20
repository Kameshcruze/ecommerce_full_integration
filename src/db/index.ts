import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    // Check if a direct connection string is provided (e.g., from Vercel Postgres, Neon, or Supabase)
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_URL || process.env.NEON_POSTGRES_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: true,
        max: 10,
        idleTimeoutMillis: 30000,
      });
    } else {
      // Fallback to individual components
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        idleTimeoutMillis: 30000,
      });
    }
  }
  return global._postgresPool;
};

export const db = drizzle(createPool(), { schema });
