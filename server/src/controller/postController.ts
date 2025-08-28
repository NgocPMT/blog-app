import { validationResult } from "express-validator";
import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import validation from "../validation/validation.js";

const getAllPosts = async (req: Request, res: Response) => {
  const posts = await db.getAllPosts();
  res.json(posts);
};

const createPost: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validation.postValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });
    }
    const { title, content } = req.body;
    const userId = (req.user as { id: number }).id;
    await db.createPost({ title, content, userId });
    res.status(201).json({ message: "Create post successfully" });
  },
];

export default { getAllPosts, createPost };
