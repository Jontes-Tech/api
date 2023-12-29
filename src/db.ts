import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import * as schema from "./schema.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
dotenv.config();
const client = postgres(
  process.env.POSTGRES || "postgres://postgres:postgres@localhost:5432/postgres"
);
const db = drizzle(client, { schema });
(async () => {
  await migrate(db, {
    migrationsFolder: "drizzle",
  });
})()
export { db };
