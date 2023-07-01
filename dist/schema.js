import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    email: text("email"),
    password: text("password"),
});
