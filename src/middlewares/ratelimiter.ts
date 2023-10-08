import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
export const rateLimiter = new RateLimiterMemory({
  points: 8,
  duration: 60,
});

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.headers["cf-connecting-ip"] as string || "0.0.0.0")
    .then(() => {
      next();
    })
    .catch(() => {
      // deepcode ignore TooPermissiveCorsHeader: It's just an error message
      res.set("Access-Control-Allow-Origin", "*");
      res.status(429).send("Too Many Requests");
    });
};
