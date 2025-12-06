import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL is not set. Database operations will fail.");
}

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!client) {
    try {
      client = postgres(process.env.DATABASE_URL);
      dbInstance = drizzle(client, { schema });
    } catch (error) {
      console.error("Failed to connect to database:", error);
      throw error;
    }
  }

  return dbInstance!;
}

// Lazy initialization proxy
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

