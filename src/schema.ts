import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, varchar, bigint, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  admin: boolean("admin").default(false),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  displayName: text("display_name"),
  emailHash: text("email_hash"),
  makeEmailPublic: boolean("make_email_public").default(false),
  hue: bigint("hue", {
    mode: "number",
  }),
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
    mode: "number",
  }).notNull(),
  post: text("post").notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  authorId: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const magicLinks = pgTable("magic_links", {
  token: text("token").notNull().primaryKey(),
  email: text("email").notNull(),
  expires: bigint("expires", {
    mode: "number",
  }).notNull(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;
