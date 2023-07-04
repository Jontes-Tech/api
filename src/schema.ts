import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, varchar, bigint, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  admin: boolean("admin").default(false),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  password: text("password"),
  displayName: text("display_name"),
});

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  created: number;
  post: string;
}

export const comments = pgTable("comments", {
  id: text("id").notNull().primaryKey(),
  authorId: text("author_id").notNull(),
  text: text("text").notNull(),
  created: bigint("created", {
    "mode": "number"
  }).notNull(),
  post: text("post").notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  authorId: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;
