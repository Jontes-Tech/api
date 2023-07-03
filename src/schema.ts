import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, varchar, bigint, json } from "drizzle-orm/pg-core";
import { v4 } from "uuid";

export const users = pgTable("users", {
  id: text("id").notNull().default(v4()).primaryKey(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  password: text("password"),
});

interface Reply {
  authorId: string;
  text: string;
  created: number;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  created: number;
  replies: Reply[];
  post: string;
}

export const comments = pgTable("comments", {
  id: text("id").notNull().default(v4()).primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  text: text("text"),
  created: bigint("created", {
    mode: "number",
  }).notNull(),
  replies: json("replies")
    .notNull()
    .default([] as Reply[]),
  post: text("post").notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  authorId: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;
