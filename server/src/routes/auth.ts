import passport from "passport";
import { Router, type Request, type Response } from "express";
import authController from "../controller/authController.js";

const auth = Router();

auth.post("/register", authController.handleRegister);

auth.post("/login", authController.handleLogin);

auth.get(
  "/session",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response) => {
    res.json({ message: "Login successfully" });
  }
);

export default auth;
