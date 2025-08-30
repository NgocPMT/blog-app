import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  type StrategyOptions,
} from "passport-jwt";
import db from "../db/queries.js";
import bcrypt from "bcryptjs";

interface JWTPayload {
  id: number;
  iat: number;
  exp: number;
}

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY as string,
};

passport.use(
  new LocalStrategy(async (username: string, password: string, done) => {
    try {
      const user = await db.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Username not found." });

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return done(null, false, { message: "Password is incorrect." });

      return done(null, { id: user.id });
    } catch (error) {
      done(error);
    }
  })
);

passport.use(
  new JWTStrategy(jwtOptions, async (payload: JWTPayload, done) => {
    try {
      const user = await db.getUserById(payload.id);
      if (!user) return done(null, false);
      return done(null, { id: user.id });
    } catch (error) {
      done(error);
    }
  })
);
