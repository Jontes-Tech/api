import {passage} from "../passage.js"
import {Request, Response, NextFunction} from "express";
import { rateLimiter } from "./ratelimiter.js";
declare global {
    namespace Express {
        interface Response {
            userID: string;
            email: string;
        }
    }
}
export let passageAuthMiddleware = (() => {
    return async (req:Request, res:Response, next:NextFunction) => {
        await passage
            .authenticateRequestWithHeader(req)
            .then((userID) => {
                if (userID) {
                    res.userID = userID;
                    return next();
                } else {
                    rateLimiter.penalty(req.headers["cf-connecting-ip"] as string || "0.0.0.0", 4)
                    return res.status(401).send('We were unable to authenticate your request.');
                }
            })
            .catch(() => {
                rateLimiter.penalty(req.headers["cf-connecting-ip"] as string || "0.0.0.0", 4)
                return res.status(401).send('We were unable to authenticate your request.');
            });
    };
})();