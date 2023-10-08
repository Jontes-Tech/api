import { Request, Response } from "express";
import { db } from "../../db.js";
import { comments, users } from "../../schema.js";
import { eq, sql } from "drizzle-orm";
import "dotenv/config.js";
import { rateLimiter } from "../../middlewares/ratelimiter.js";
export const listComment = async (req: Request, res: Response) => {
  try {
    let post = decodeURIComponent(req.params.post) || "";

    let gotComments = await db
      .select({
        userName: users.displayName,
        userIsAdmin: users.admin,
        text: comments.text,
        created: comments.created,
        post: comments.post,
        id: comments.id,
      })
      .from(comments)
      .where(eq(comments.post, post))
      .innerJoin(users, eq(users.id, comments.authorId))
      .orderBy(sql`${comments.created} desc`)
      .limit(100);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
    res.send(gotComments);
  } catch {
    res.status(500).send("Internal Server Error");
  }
};
