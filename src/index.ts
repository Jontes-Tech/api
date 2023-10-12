import { index } from "./routes/index.js";
import { getToken } from "./routes/getToken.js";
import express, { Request, Response } from "express";
import { passageAuthMiddleware } from "./middlewares/passage.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { me } from "./routes/me.js";
import { rateLimit } from "./middlewares/ratelimiter.js";
import morgan from "morgan";
import { createComment } from "./routes/comments/create.js";
import { listComment } from "./routes/comments/list.js";
import { deleteComment } from "./routes/comments/delete.js";
import helmet from "helmet";
// deepcode ignore DisablePoweredBy: I literally couldn't care less. Code's already open source., deepcode ignore UseCsurfForExpress: CSRF is not a concern for this project.
const app = express();
app.use(rateLimit);
app.use(morgan("combined"));
app.use(helmet());
app.use(
  cors({
    origin: ["https://jontes.page", "https://identity.nt3.me"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", index);

// Account-related routes
app.post("/token", passageAuthMiddleware, getToken);
app.get("/me", passageAuthMiddleware, me);

app.options("/comments", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.send();
});

app.post(
  "/comments",
  cors({
    origin: "https://jontes.page",
  }),
  createComment
);
app.get("/comments/:post", listComment);
app.delete(
  "/comments/:id",
  cors({
    origin: "https://jontes.page",
  }),
  deleteComment
);

app.get("/age", (req: any, res: any) => {
  res.send({
    description: "This API is server-side rendered.",
    years: ~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425,
    wholeYears: Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425),
    "unix-epoch-of-birth": 1233516000,
  });
});

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
