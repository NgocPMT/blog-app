import type { RequestHandler } from "express";
import passport from "passport";

interface User {
  id: number;
  username: string;
  role: string;
}

const optionalAuth: RequestHandler = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err: Error, user: User) => {
    req.user = user || null;
    next();
  })(req, res, next);
};

export default optionalAuth;
