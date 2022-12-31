const SUPPORT_WEBHOOK = "CHANGEME"
import * as express from "express";
const app = express();
import * as dotenv from 'dotenv'
dotenv.config()
import * as cors from "cors";
import { createLogger } from "@lvksh/logger";
import * as chalk from "chalk";
import * as fs from 'fs'
const port = process.env.PORT;

let lastlogin = Math.floor(Date.now() / 1000);


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
const limiter = rateLimit({ windowMs: 6 * 1000, max: 2 });
const strictlimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 4 });
export default limiter;
app.set('trust proxy', 1)
app.use(rateLimit());
app.use(cors());

app.get("/", (req: any, res: any) => {
  res.send("Welcome to Jonte's epic API.");
});

app.get("/age", (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      description: "This API is server-side rendered.",
      years: ~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425,
      wholeYears: Math.floor(
        (Date.now() / 1000 - 1233516000) / 86400 / 365.2425
      ),
      "unix-epoch-of-birth": 1233516000,
    })
  );
});

app.get("/lastlogin", (req: any, res: any) => {
  res.setHeader("Access-Control-Allow-Origin", "https://jontes.page");
  res.send(lastlogin.toString());
  lastlogin = Math.floor(Date.now() / 1000);
});

app.get("/health", (req: any, res: any) => {
  fs.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8', function (err,data) {
    if (err) {
      res.send(err);
    }
    res.json({
      node: "SE-North-Homelab-1-Arm",
      temp: parseInt(data) / 1000
    });
  });
});

app.post("/new-support-ticket", strictlimiter, (req:any, res:any) => {
  fetch(process.env.SUPPORT_WEBHOOK, {
    method: 'POST'
  })
  res.send("OK")
})

app.listen(port, () => {
  log.info("Welcome to Jonte's API");
  log.ok(`App listening on port ${port}`);
});
