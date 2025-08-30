import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JWTStrategy, } from "passport-jwt";
import db from "../db/queries.js";
import bcrypt from "bcryptjs";
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY,
};
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await db.getUserByUsername(username);
        if (!user)
            return done(null, false, { message: "Username not found." });
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return done(null, false, { message: "Password is incorrect." });
        return done(null, { id: user.id });
    }
    catch (error) {
        done(error);
    }
}));
passport.use(new JWTStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await db.getUserById(payload.id);
        if (!user)
            return done(null, false);
        return done(null, { id: user.id });
    }
    catch (error) {
        done(error);
    }
}));
