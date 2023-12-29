import { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { passage } from "../passage.js";
import { v4 as uuidv4 } from "uuid";
import { users } from "../schema.js";
import { db } from "../db.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js"
const JWTPrivateKey = process.env.JWTPRIVATE || "";
export const getToken = async (req: Request, res: Response) => {
  const scope = req.query.scope || "";
  if (typeof scope !== "string") {
    return res
      .status(400)
      .send("Scope must be a string, because we're in TypeScript land.");
  }
  const audience = req.query.audience;
  if (!audience) {
    return res.status(400).send("Audience is required.");
  }
  try {
    z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      displayName: z.string().optional(),
      hue: z.number().min(0).max(359).optional(),
    }).parse(req.body);
  } catch {
    return res.status(400).send("Invalid");
  }
  const psguser = await passage.user.get(res.userID);
  const newid = uuidv4();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.passageId, res.userID));
  if (user.length === 0) {
    const insert = {
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      displayName: req.body.displayName || "",
      hue: parseInt(req.body.hue) || 0,
      passageId: res.userID,
      id: newid,
      email: psguser.email,
      updated: Date.now(),
    };
    await db.insert(users).values(insert);
  } else {
    await db
      .update(users)
      .set({
        firstName: req.body.firstName || "",
        lastName: req.body.lastName || "",
        displayName: req.body.displayName || "",
        hue: parseInt(req.body.hue) || 0,
        updated: Date.now(),
      })
      .where(eq(users.passageId, res.userID));
  }
  const token = jwt.sign(
    {
      id: user[0].id || newid,
      email: (scope.split(" ").includes("read:email"))
        ? psguser.email
        : undefined,
      scope: scope,
      firstName: (scope.split(" ").includes("read:first_name"))
        ? req.body.firstName || user[0].firstName || undefined
        : undefined,
      lastName: (scope.split(" ").includes("read:last_name"))
        ? req.body.lastName || user[0].lastName || undefined
        : undefined,
      displayName: (scope.split(" ").includes("read:display_name"))
        ? req.body.displayName || user[0].displayName || undefined
        : undefined,
      hue: (scope.split(" ").includes("read:color_preference"))
        ? req.body.hue || user[0].hue || undefined
        : undefined,
      mode: (scope.split(" ").includes("read:mode_preference"))
        ? "dark"
        : undefined,
      admin: (scope.split(" ").includes("read:admin"))
        ? user[0].admin
        : undefined,
      aud: audience || "https://example.com",
    },
    JWTPrivateKey,
    {
      expiresIn: "7d",
      algorithm: "RS512",
      issuer: "https://identity.nt3.me",
    }
  );
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-store");
  return res.send(token);
};
