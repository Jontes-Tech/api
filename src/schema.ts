import { InferModel } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { v4 } from "uuid";

export const users = pgTable("users", {
  id: text("id").notNull().default(v4()).primaryKey(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  password: text("password"),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;
