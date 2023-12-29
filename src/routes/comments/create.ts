import { Request, Response } from "express";
import { db } from "../../db.js";
import { comments, users } from "../../schema.js";
import { z } from "zod";
import "dotenv/config.js"
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { rateLimiter } from "../../middlewares/ratelimiter.js";
import { JWTPUBLIC } from "../constants.js";
import { eq, sql } from "drizzle-orm";
const JWTPublicKey = JWTPUBLIC;

export const createComment = async (req: Request, res: Response) => {
  try {
    // This is the endpoint where users can post comments
    const token = req.headers.authorization + "" as string;
    const text = req.body.text + "" as string;
    const post = req.body.post + "" as string;

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
      console.log(JSON.stringify(decoded))
      if (err) {
        res.status(401).send(err.message);
        rateLimiter.penalty(req.headers["cf-connecting-ip"] as string || "0.0.0.0", 4);
        return;
      }
      if (decoded.aud !== "https://jontes.page") {
        res.status(401).send("Unauthorized because aud is not https://jontes.page");
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
      res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
      res.send(await db.insert(comments).values(insert).returning())
    });
  } catch {
    res.status(500).send("Internal Server Error");
  }
};
