import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, varchar, bigint, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  admin: boolean("admin").default(false),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  displayName: varchar("display_name"),
  hue: bigint("hue", {
    mode: "number",
  }),
  updated: bigint("updated", {
    mode: "number",
  }),
  passageId: text("passage_id"),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  authorId: text("author_id"),
  text: text("text").notNull(),
  created: bigint("created", {
    mode: "number",
  }).notNull(),
  post: text("post").notNull(),
});

export const commentsRelation = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

