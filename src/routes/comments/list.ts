import { Request, Response } from "express";
import { db } from "../../db.js";
import "dotenv/config.js";
import { desc } from "drizzle-orm";
import { comments } from "../../schema.js";
import { eq } from 'drizzle-orm';
export const listComment = async (req: Request, res: Response) => {
  try {
    let post = decodeURIComponent(req.params.post) || "";

    let gotComments = await db.query.comments.findMany({
      with: {
        author: {
          columns: {
            displayName: true,
            admin: true,
          }
        }
      },
      columns: {
        id: true,
        text: true,
        created: true,
      },
      limit: 100,
      orderBy: [desc(comments.created)],
      where: eq(comments.post, post)
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
    res.send(gotComments);
  } catch {
    res.status(500).send("Internal Server Error");
  }
};
