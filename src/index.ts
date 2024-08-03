import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import helmet from "helmet";
// deepcode ignore DisablePoweredBy: I literally couldn't care less. Code's already open source., deepcode ignore UseCsurfForExpress: CSRF is not a concern for this project.
const app = express();
app.use(morgan("combined"));
app.use(helmet());

app.use(express.json());

const getAge = () => {
  return (Date.now() / 1000 - 1233516000) / 86400 / 365.2425;
}


app.get("/age", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(getAge().toFixed(9));
})


app.get("/age.svg", (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-cache");
  res.send(`
<svg width="250" height="100" xmlns="http://www.w3.org/2000/svg">
    <style>
        .heavy {
            font: bold 24px sans-serif;
        }
    </style>
    <rect width="100%" height="100%" fill="#dadada"/>
    <text x="50%" y="50%" class="heavy" dominant-baseline="middle" text-anchor="middle">
        ${(getAge()).toFixed(9)}
    </text>
</svg>
  `);
})

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
