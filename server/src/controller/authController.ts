import type { Request, Response, RequestHandler } from "express";
import db from "../db/queries.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import validation from "../validation/auth.js";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

const handleRegister: RequestHandler[] = [
  ...validation.registerValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });

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
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });

    passport.authenticate(
      "local",
      { session: false },
      async (err: Error | null, user: User, info: { message: string }) => {
        if (err || !user)
          return res
            .status(400)
            .json({ message: info?.message ?? "Something is not right", user });

        req.login(user, { session: false }, (loginErr: Error) => {
          if (loginErr)
            return res.status(500).json({ message: loginErr.message });

          const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "1h" }
          );
          return res.json({ user, token });
        });
      }
    )(req, res);
  },
];

export default { handleRegister, handleLogin };
