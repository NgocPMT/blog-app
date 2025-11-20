import { Router } from "express";
import authController from "../controller/authController.js";

const auth = Router();

auth.post("/register", authController.handleRegister);

auth.post("/login", authController.handleLogin);

auth.get("/validate-token", authController.validateToken);

auth.get("/validate-admin", authController.validateAdmin);

auth.get("/validate-owner/:publicationId", authController.validateOwner);

export default auth;
