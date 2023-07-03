import express, { Request, Response } from "express";
// deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { createLogger } from "@lvksh/logger";
import chalk from "chalk";
const port = process.env.PORT;
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { NewUser, comments, users, Comment } from "./schema.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
const saltRounds = 12;
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

import rateLimit from "express-rate-limit";
import { eq } from "drizzle-orm";
const limiter = rateLimit({ windowMs: 6 * 1000, max: 2 });
const strictlimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 4 });
export default limiter;
import morgan from "morgan";
app.set("trust proxy", 1);
app.use(rateLimit());
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan());
log.info(`Salt rounds: ${saltRounds}`);

app.get("/", (req: any, res: any) => {
  res.send("Welcome to Jonte's epic API.");
});

app.post("/new-support-ticket", strictlimiter, (req: any, res: any) => {
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
      password: req.body.password,
      displayName: req.body.displayName,
      id: uuidv4(),
    };

    // Verify with Zod
    const userSchema = z.object({
      firstName: z.string().min(1).max(255),
      lastName: z.string().min(1).max(255),
      email: z.string().email().nonempty().min(1).max(255),
      password: z.string().min(12).max(255),
      displayName: z.string().min(1).max(255),
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
    // hash the password
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      if (err) {
        // if there was an error, log it and send a 500 response
        log.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // otherwise, set the password to the hashed password
      insert.password = hash;
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
          displayName: insert.displayName
        },
        process.env.JWT_SECRET,
        { expiresIn: "14d" }
      );
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(token);
    });
  } catch (err) {
    // if there was an error, log it and send a 500 response
    log.error(err);
    res.status(500).send("Internal Server Error");
  }
  log.info("POSTED /users");
});

app.post("/identityToken", async (req: Request, res: Response) => {
  log.info("POST /identityToken");
  // This is the endpoint where users exchange their email and password for a JWT called an identity token
  const usersAuth = {
    email: req.body.email || "",
    password: req.body.password || "",
  };
  // get the user from the database
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, usersAuth.email));

  // if the user doesn't exist, send a 401 response
  if (user.length === 0) {
    res.status(401).send("Unauthorized");
    return;
  }

  // otherwise, check if the password is correct
  // Safely, with Bcrypt, compare the password to the hashed password
  bcrypt.compare(
    usersAuth.password,
    user[0].password,
    function (err: any, result: any) {
      if (err) {
        // if there was an error, log it and send a 500 response
        log.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // if the password is incorrect, send a 401 response
      if (!result) {
        res.status(401).send("Unauthorized");
        return;
      }
      // otherwise, send a 200 response with the identity token
      res.setHeader("Content-Type", "text/plain");
      res.send(
        jwt.sign(
          {
            email: user[0].email,
            aud: "https://nt3.me",
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            id: user[0].id,
            displayName: user[0].displayName,
          },
          process.env.JWT_SECRET,
          { expiresIn: "14d" }
        )
      );
    }
  );

  log.info("POSTED /identityToken");
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
      res.status(401).send(err.message);
      return;
    }
    if (decoded.aud !== "https://nt3.me") {
      res.status(401).send("Unauthorized");
      return;
    }

    // otherwise, send a 200 response with the application token
    res.set("Content-Type", "text/plain");
    res.send(
      jwt.sign(
        {
          email: decoded.email,
          aud: newaudience,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          id: decoded.id,
          displayName: decoded.displayName,
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
          return;
        }
        if (decoded.aud !== "https://jontes.page") {
          res.status(401).send("Unauthorized");
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

app.listen(port, () => {
  log.info("Welcome to Jonte's API");
  log.ok(`App listening on port ${port}`);
});
