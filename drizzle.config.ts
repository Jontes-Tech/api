import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config(); 

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES || "postgres://postgres:postgres@localhost:5432/postgres",
  }
} satisfies Config;