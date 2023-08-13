import express, { Request, Response } from "express";
// deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express();
import { Resend } from "resend";

import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { createLogger } from "@lvksh/logger";
import chalk from "chalk";
const port = process.env.PORT;
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { NewUser, comments, users, Comment, magicLinks } from "./schema.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
const saltRounds = 12;
import crypto from "crypto";
const client = postgres(
  process.env.POSTGRES || "postgres://postgres:postgres@localhost:5432/postgres"
);
const db = drizzle(client);
(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  log.ok("Migrations ran successfully");
})();
const log = createLogger(
  {
    ok: {
      label: chalk.greenBright`[OK]`,
      newLine: "| ",
      newLineEnd: "\\-",
    },
    debug: chalk.magentaBright`[DEBUG]`,
    info: {
      label: chalk.cyan`[INFO]`,
      newLine: chalk.cyan`⮡`,
      newLineEnd: chalk.cyan`⮡`,
    },
    error: chalk.bgRed.white.bold`[ERROR]`,
  },
  { padding: "PREPEND" },
  console.log
);

import { eq, and } from "drizzle-orm";
import { RateLimiterMemory } from "rate-limiter-flexible";
const rateLimiter = new RateLimiterMemory({
  points: 8,
  duration: 10,
});

const rateLimit = (req: Request, res: Response, next: any) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      // deepcode ignore TooPermissiveCorsHeader: It's just an error message
      res.set("Access-Control-Allow-Origin", "*");
      res.status(429).send("Too Many Requests");
    });
};
app.use(rateLimit);

import morgan from "morgan";
app.set("trust proxy", 1);
app.use(express.json());
app.use(helmet());
app.use(morgan());
log.info(`Salt rounds: ${saltRounds}`);

app.use(cors());
const resend = new Resend(process.env.RESEND);

app.get("/", (req: any, res: any) => {
  res.send("Welcome to Jonte's epic API.");
});

app.post("/new-support-ticket", (req: any, res: any) => {
  // Consume the rate limiter
  rateLimiter.consume(req.ip, 4);
  fetch(process.env.SUPPORT_WEBHOOK, {
    method: "POST",
  });

  res.send("OK");
});

app.post("/users", async (req: Request, res: Response) => {
  // log the request
  log.info("POST /users");
  try {
    // create new user from request body
    let insert: NewUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      displayName: req.body.displayName,
      admin: false,
      id: uuidv4(),
    };

    // Verify with Zod
    const userSchema = z.object({
      firstName: z.string().min(1).max(255),
      lastName: z.string().min(1).max(255),
      email: z.string().email().nonempty().min(1).max(255),
      displayName: z.string().min(1).max(255),
      admin: z.boolean(),
      id: z.string().uuid(),
    });

    // Use Zod SafeParse to verify the request body
    try {
      userSchema.parse(insert);
    } catch (err) {
      res.status(400).send("Bad Request");
      return;
    }

    // We now need to update the password to be hashed and salted
    // We also need to check if the email is already in use
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, insert.email));
    // if the user already exists, send a 409 response
    if (user.length !== 0) {
      res.status(409).send("Email already in use");
      return;
    }
    // insert the user into the database
    await db.insert(users).values(insert);
    // send a 200 response
    // Generate a JWT
    const token = jwt.sign(
      {
        email: insert.email,
        firstName: insert.firstName,
        lastName: insert.lastName,
        aud: "https://nt3.me",
        id: insert.id,
        displayName: insert.displayName,
        admin: insert.admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );
    rateLimiter.penalty(req.ip, 4);
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(token);
  } catch (err) {
    // if there was an error, log it and send a 500 response
    log.error(err);
    res.status(500).send("Internal Server Error");
  }
  log.info("POSTED /users");
});

app.post("/signup", async (req: Request, res: Response) => {
  log.info("POST /signup");
  try {
    // create new user from request body
    let insert: NewUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      displayName: req.body.displayName,
      admin: false,
      id: uuidv4(),
    };
    // Make sure email doesn't already exist
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, insert.email));
    if (user.length !== 0) {
      res.status(409).send("Email already in use");
      return;
    }
    await db.insert(users).values(insert);
    res.send("OK");
  } catch (err) {
    res.send("Internal Server Error");
  }
});

app.options("/singup", cors());

app.get("/getMagic/:email", async (req: Request, res: Response) => {
  log.info("GET /getMagic");
  // Safely generate random URL-safe string
  const magic = crypto
    .randomBytes(32)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "");

  console.log(magic, req.params.email);
  try {
    const data = await resend.emails.send({
      from: "NT3 Identity <identity@nt3.me>",
      to: [req.params.email],
      subject: "Your NT3 Magic Link",
      html: `
      <html>
      <head>
      <style>
      body {
        font-family: sans-serif;
        background-color: #1c1917;
        color: #fff;
      }
      </style>
      </head>
      <body>
      <h1>NT3 Magic Link</h1>
      <p>Click the link below to log in to your NT3 account.</p>
      <a href="https://api.jontes.page/auth/magic/${magic}">Sign in!</a>
      </body>
      </html>
      `,
    });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }

  // I want to insert the user id of the user with the email into the database, as well as the magic token
  await db.insert(magicLinks).values({
    email: req.params.email as string,
    token: magic,
    expires: Date.now() + 1000 * 60 * 5,
  });

  res.send("OK");
});

app.get("/auth/magic/:token", async (req: Request, res: Response) => {
  log.info("GET /auth/magic");
  // Check if the token is valid
  const token = req.params.token;
  const magic = await db
    .select()
    .from(magicLinks)
    .where(eq(magicLinks.token, token));
  if (magic.length === 0) {
    res.status(401).send("Unauthorized");
    return;
  }
  // Check if the token is expired
  if (magic[0].expires < Date.now()) {
    res.status(401).send("Expired");
    return;
  }
  // If the token is valid, generate a JWT
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, magic[0].email));
  const jwtToken = jwt.sign(
    {
      email: user[0].email,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      aud: "https://nt3.me",
      id: user[0].id,
      displayName: user[0].displayName,
      admin: user[0].admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );
  // Delete the magic link from the database
  await db.delete(magicLinks).where(eq(magicLinks.token, token));
  // deepcode ignore OR: <please specify a reason of ignoring this>
  res.redirect(`https://identity.nt3.me?method=magic&token=${jwtToken}`);
});

app.get("/age", (req: any, res: any) => {
  res.send({
    description: "This API is server-side rendered.",
    years: ~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425,
    wholeYears: Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425),
    "unix-epoch-of-birth": 1233516000,
  });
});

app.get("/token", async (req: Request, res: Response) => {
  log.info("GET /token");
  const token = req.headers.authorization || "";
  const newaudience = req.query.audience;
  // This is the endpoint where users exchange their identity token for a JWT called an application token.
  if (!token) {
    // if there is no token, send a 401 response
    res.status(401).send("Unauthorized");
    return;
  }
  // otherwise, verify the token
  // if the token is invalid, send a 401 response
  jwt.verify(token, process.env.JWT_SECRET, function (err: any, decoded: any) {
    // Send individual error messages for each error
    if (err) {
      rateLimiter.penalty(req.ip, 6);
      res.status(401).send(err.message);
      return;
    }
    if (decoded.aud !== "https://nt3.me") {
      res.status(401).send("Unauthorized");
      return;
    }

    // otherwise, send a 200 response with the application token
    res.setHeader("Content-Type", "text/plain");
    res.send(
      jwt.sign(
        {
          email: decoded.email,
          aud: newaudience,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          id: decoded.id,
          displayName: decoded.displayName,
          admin: decoded.admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      )
    );
  });
  log.info("GOT /token");
});

app.post("/comments", async (req: Request, res: Response) => {
  log.info("POST /comments");
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

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err: any, decoded: any) {
        if (err) {
          res.status(401).send(err.message);
          rateLimiter.penalty(req.ip, 4);
          return;
        }
        if (decoded.aud !== "https://jontes.page") {
          res.status(401).send("Unauthorized");
          rateLimiter.penalty(req.ip, 4);
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
        res.status(200).send("OK");
      }
    );
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/comments/:post", async (req: Request, res: Response) => {
  log.info("GET /comments");
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
    res.send(gotComments);
    log.info("GOT /comments");
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/comment/:id", async (req: Request, res: Response) => {
  log.info("DELETE /comment/:id");
  try {
    // This is the endpoint where users can post comments
    const token = req.headers.authorization || "";
    const id = req.params.id || "";

    if (!token) {
      // if there is no token, send a 401 response
      res.status(401).send("Unauthorized");
      return;
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err: any, decoded: any) {
        if (err) {
          res.status(401).send(err.message);
          rateLimiter.penalty(req.ip, 4);
          return;
        }
        if (decoded.aud !== "https://jontes.page") {
          res.status(401).send("Unauthorized");
          rateLimiter.penalty(req.ip, 4);
          return;
        }
        if (!id) {
          res.status(400).send("Bad Request");
          return;
        }
        await db
          .delete(comments)
          .where(and(eq(comments.id, id), eq(comments.authorId, decoded.id)));
        res.status(200).send("OK");
      }
    );
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  log.info("Welcome to Jonte's API");
  log.ok(`App listening on port ${port}`);
});
