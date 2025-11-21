import type { Request, Response, RequestHandler } from "express";
import db from "../db/queries.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import validation from "../validation/validation.js";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
}

const handleRegister: RequestHandler[] = [
  ...validation.registerValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0] });

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.createUser({ username, email, password: hashedPassword });

    res.status(201).json({ message: "Register successfully." });
  },
];

const handleLogin: RequestHandler[] = [
  ...validation.loginValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    passport.authenticate(
      "local",
      { session: false },
      async (err: Error | null, user: User, info: { message: string }) => {
        if (err || !user)
          return res
            .status(400)
            .json({ error: info?.message ?? "Something is not right", user });

        req.login(user, { session: false }, (loginErr: Error) => {
          if (loginErr)
            return res.status(500).json({ error: loginErr.message });

          const token = jwt.sign(
            {
              username: user.username,
              id: user.id,
              role: user.role,
            },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "8h" }
          );
          return res.json({ message: "Logged in successfully", user, token });
        });
      }
    )(req, res);
  },
];

const validateToken: RequestHandler[] = [
  (req, res, next) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error | null, user: User) => {
        if (err || !user) {
          return res.json({ valid: false, message: "Unauthorized" });
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    return res.json({ valid: true });
  },
];

const validateAdmin: RequestHandler[] = [
  (req, res, next) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error | null, user: User) => {
        if (err || !user) {
          return res.json({ valid: false, message: "Unauthorized" });
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    const role = (req.user as { role: string }).role;
    if (role && role === "ADMIN") {
      return res.json({ valid: true });
    }
    return res.json({ valid: false });
  },
];

const validateOwner: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication) return res.status(404).json({ isOwner: false });

    return res.json({ isOwner: publication.user.id === currentUserId });
  },
];

export default {
  handleRegister,
  handleLogin,
  validateToken,
  validateAdmin,
  validateOwner,
};
