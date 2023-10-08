import { Request, Response } from "express";
import { db } from "../db.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
export const me = async (req: Request, res: Response) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.passageId, res.userID));
  res.setHeader("Cache-Control", "no-store");
  if (user.length === 0) {
    return res.status(404).json({});
  } else {
    return res.json(user[0]);
  }
};
