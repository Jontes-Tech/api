import { Request, Response } from "express";
export const index = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.send("Hello. I am Jonte's API. Nice to meet you.");
};
