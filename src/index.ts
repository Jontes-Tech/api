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
import PDFDocument from "pdfkit";
import PPTX from "nodejs-pptx";
const pptx = new PPTX.Composer();
import helmet from "helmet";
// deepcode ignore DisablePoweredBy: I literally couldn't care less. Code's already open source., deepcode ignore UseCsurfForExpress: CSRF is not a concern for this project.
const app = express();
app.use(rateLimit);
app.use(morgan("combined"));
app.use(helmet());
app.use(
  cors({
    origin: ["https://jontes.page", "https://identity.nt3.me", "http://localhost:5173"],
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

app.get("/age", (req, res) => {
  res.send(`
  <html>
  <head>
  <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
  <a href="/age.json">json</a>
  <a href="/age.xml">xml</a>
  <a href="/age.yml">yml</a>
  <a href="/age.txt">txt</a>
  <a href="/age.png">png</a>
  <a href="/age.jpg">jpg</a>
  <a href="/age.mp4">mp4</a>
  <a href="/age.pdf">pdf</a>
  <a href="/age.pptx">pptx</a>
  <a href="/age.mp3">mp3</a>
  </html>`)
});

app.get("/age.json", (req, res) => {
  res.send({
    description: "This API is server-side rendered.",
    years: ~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425,
    wholeYears: Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425),
    "unix-epoch-of-birth": 1233516000,
  });
})

app.get("/age.xml", (req, res) => {
  res.setHeader("Content-Type", "text/xml");
  res.send(`
  <age>
    <description>This API is server-side rendered.</description>
    <years>${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}</years>
    <wholeYears>${Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425)}</wholeYears>
    <unix-epoch-of-birth>1233516000</unix-epoch-of-birth>
  </age>
  `);
})

app.get("/age.yml", (req, res) => {
  res.redirect("/age.yaml")
})

app.get("/age.yaml", (req, res) => {
  res.setHeader("Content-Type", "text/yaml");
  res.send(`
  description: This API is server-side rendered.
  years: ${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}
  wholeYears: ${Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425)}
  unix-epoch-of-birth: 1233516000
  `);
})

app.get("/age.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send((~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425).toString())
})

app.get("/age.png", (req, res) => {
  res.redirect("https://placehold.co/1000x200.png?text=" + encodeURIComponent(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`))
})

app.get("/age.mp4", (req, res) => {
  res.redirect("https://placehold.co/1000x200.mp4?text=" + encodeURIComponent(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`))
})

app.get("/age.jpg", (req, res) => {
  res.redirect("https://placehold.co/1000x200.mp4?text=" + encodeURIComponent(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`))
})

app.get("/age.pdf", (req, res) => {
  const doc = new PDFDocument();
  doc.fontSize(50).text(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`, 10, 10);
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.end();
})

app.get("/age.pptx", async (req, res) => {
  await pptx.compose(pres => {
    pres.addSlide(slide => {
      slide.addText(text => {
        text.value(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`);
      });
    });
  });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  pptx.save((buffer) => {
    res.send(buffer);
  });
})

app.get("/age.csv", (req, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.send(`description,years,wholeYears,unix-epoch-of-birth` + "\n" + `This API is server-side rendered.,${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425},${Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425)},1233516000`)
})

app.get("/age.toml", (req, res) => {
  res.setHeader("Content-Type", "text/toml");
  res.send(`description = "This API is server-side rendered."\nyears = ${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}\nwholeYears = ${Math.floor((Date.now() / 1000 - 1233516000) / 86400 / 365.2425)}\nunix-epoch-of-birth = 1233516000`)
})

const otherImageFormats = ["tiff", "webp", "gif"]

app.get("/age.mp3", (req, res) => {
  res.redirect("https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=" + encodeURIComponent(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`))
})

app.get("/age.js", (req, res) => {
  res.setHeader("Content-Type", "text/javascript");
  const callback = req.query.callback;
  if (!callback) {
    res.status(400).send("No callback specified");
  }
  else {
    res.send(callback + "(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`)")
  }
})

app.get("/age.:format", (req, res) => {
  if (otherImageFormats.includes(req.params.format)) {
    res.redirect(`https://wsrv.nl?url=https://placehold.co/1000x200.png?text=${encodeURIComponent(`${~~(Date.now() / 1000 - 1233516000) / 86400 / 365.2425}`)}&output=` + req.params.format)
  } else {
    res.redirect("/age")
  }
})


app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
