import { Request, Response } from "express";
import { db } from "../../db.js";
import { comments } from "../../schema.js";
import { eq, and, sql } from "drizzle-orm";
import "dotenv/config.js"
import jwt from "jsonwebtoken";
import { rateLimiter } from "../../middlewares/ratelimiter.js";
import { JWTPUBLIC } from "../constants.js";
const JWTPublicKey = JWTPUBLIC;

export const deleteComment = async (req: Request, res: Response) => {
  try {
    // This is the endpoint where users can post comments
    const token = req.headers.authorization || "";
    const id = req.params.id || "";

    if (!token) {
      // if there is no token, send a 401 response
      res.status(401).send("Unauthorized");
      return;
    }

    jwt.verify(token, JWTPublicKey, async function (err: any, decoded: any) {
      if (err) {
        res.status(401).send(err.message);
        rateLimiter.penalty(req.headers["cf-connecting-ip"] as string || "0.0.0.0", 4);
        return;
      }
      if (decoded.aud !== "https://jontes.page") {
        res.status(401).send("Unauthorized");
        rateLimiter.penalty(req.headers["cf-connecting-ip"] as string || "0.0.0.0", 4);
        return;
      }
      if (!id) {
        res.status(400).send("Bad Request");
        return;
      }
      await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.authorId, decoded.id)));
        res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
      res.status(200).send("OK");
    });
  } catch {
    res.status(500).send("Internal Server Error");
  }
};
