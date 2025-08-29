import passport from "passport";
import { Router, type Request, type Response } from "express";
import authController from "../controller/authController.js";

const auth = Router();

auth.post("/register", authController.handleRegister);

auth.post("/login", authController.handleLogin);

export default auth;
