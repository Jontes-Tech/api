import { Request, Response } from "express";
import { db } from "../../db.js";
import { comments } from "../../schema.js";
import { z } from "zod";
import "dotenv/config.js"
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { rateLimiter } from "../../middlewares/ratelimiter.js";
const JWTPublicKey = process.env.JWTPUBLIC || "";

export const createComment = async (req: Request, res: Response) => {
  try {
    // This is the endpoint where users can post comments
    const token = req.headers.authorization || "";
    const text = req.body.text || "";
    const post = req.body.post || "";

    z.object({
      text: z.string(),
      post: z.string(),
    }).parse({ text, post });

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
      const insert = [
        {
          authorId: decoded.id,
          text: text,
          post: post,
          created: new Date().getTime(),
          id: uuidv4(),
        },
      ];
      await db.insert(comments).values(insert);
      res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
      res.status(200).send("OK");
    });
  } catch {
    res.status(500).send("Internal Server Error");
  }
};
