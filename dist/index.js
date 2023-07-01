import express from "express";
// deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { createLogger } from "@lvksh/logger";
import chalk from "chalk";
const port = process.env.PORT;
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
const saltRounds = process.env.NODE_ENV === "production" ? 12 : 1;
const client = postgres(process.env.POSTGRES || "postgres://postgres:postgres@localhost:5432/postgres");
const db = drizzle(client);
(async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
    log.ok("Migrations ran successfully");
})();
const log = createLogger({
    ok: {
        label: chalk.greenBright `[OK]`,
        newLine: "| ",
        newLineEnd: "\\-",
    },
    debug: chalk.magentaBright `[DEBUG]`,
    info: {
        label: chalk.cyan `[INFO]`,
        newLine: chalk.cyan `⮡`,
        newLineEnd: chalk.cyan `⮡`,
    },
    error: chalk.bgRed.white.bold `[ERROR]`,
}, { padding: "PREPEND" }, console.log);
import rateLimit from "express-rate-limit";
import { eq } from "drizzle-orm";
const limiter = rateLimit({ windowMs: 6 * 1000, max: 2 });
const strictlimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 4 });
export default limiter;
app.set("trust proxy", 1);
app.use(rateLimit());
app.use(cors());
app.use(express.json());
app.use(helmet());
log.info(`Salt rounds: ${saltRounds}`);
app.get("/", (req, res) => {
    res.send("Welcome to Jonte's epic API.");
});
app.post("/new-support-ticket", strictlimiter, (req, res) => {
    fetch(process.env.SUPPORT_WEBHOOK, {
        method: "POST",
    });
    res.send("OK");
});
app.post("/users", async (req, res) => {
    // log the request
    log.info("POST /users");
    try {
        // create new user from request body
        let insert = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: "",
        };
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
            res.send("OK");
        });
    }
    catch (err) {
        // if there was an error, log it and send a 500 response
        log.error(err);
        res.status(500).send("Internal Server Error");
    }
    log.info("POSTED /users");
});
app.get("/identityToken", async (req, res) => {
    log.info("GET /identityToken");
    // This is the endpoint where users exchange their email and password for a JWT called an identity token
    const usersAuth = {
        email: req.query.email,
        password: req.query.password,
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
    bcrypt.compare(usersAuth.password, user[0].password, function (err, result) {
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
        res.send(jwt.sign({
            email: user[0].email,
            aud: "https://nt3.me",
            firstName: user[0].firstName,
            lastName: user[0].lastName,
        }, process.env.JWT_SECRET, { expiresIn: "14d" }));
    });
    log.info("GOT /identityToken");
});
app.get("/token", async (req, res) => {
    log.info("GET /token");
    const token = req.headers.authorization;
    const newaudience = req.query.audience;
    // This is the endpoint where users exchange their identity token for a JWT called an application token.
    if (!token) {
        // if there is no token, send a 401 response
        res.status(401).send("Unauthorized");
        return;
    }
    // otherwise, verify the token
    // if the token is invalid, send a 401 response
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
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
        res.send(jwt.sign({
            email: decoded.email,
            aud: newaudience,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
        }, process.env.JWT_SECRET, { expiresIn: "7d" }));
    });
    log.info("GOT /token");
});
app.listen(port, () => {
    log.info("Welcome to Jonte's API");
    log.ok(`App listening on port ${port}`);
});
