import { Request, Response } from "express";
import { db } from "../db.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
export const me = async (req: Request, res: Response) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.passageId, res.userID))
    .catch((e) => {
      console.log(e);
      return [];
    }
  );
  res.setHeader("Cache-Control", "no-store");
  if (user.length === 0) {
    await db.insert(users).values({
      id: v4(),
      passageId: res.userID,
      admin: false,
      updated: Date.now(),
      email: res.email,
    });
    return res.json({
      id: v4(),
      passageId: res.userID,
      admin: false,
      updated: Date.now(),
      email: res.email,
    });
  } else {
    return res.json(user[0]);
  }
};
