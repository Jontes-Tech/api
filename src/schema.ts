import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, varchar, bigint } from "drizzle-orm/pg-core";
import { v4 } from "uuid";

export const users = pgTable("users", {
  id: text("id").notNull().default(v4()).primaryKey(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  password: text("password"),
});

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  created: number;
  post: string;
}

export const comments = pgTable("comments", {
  id: text("id").notNull().default(v4()).primaryKey(),
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
