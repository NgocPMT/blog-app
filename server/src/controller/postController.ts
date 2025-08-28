import { validationResult } from "express-validator";
import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import validation from "../validation/validation.js";
import validateUserId from "../middlewares/validateUserId.js";

const handleGetAllPosts = async (req: Request, res: Response) => {
  const posts = await db.getAllPosts();
  res.json(posts);
};

const handleGetPostById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.postId);
  const post = await db.getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
};

const handleUpdatePost = [
  passport.authenticate("jwt", { session: false }),
  validateUserId,
  ...validation.postValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });
    }
    const id = parseInt(req.params.postId);
    const { title, content } = req.body;
    await db.updatePost({ id, title, content });
    return res.json({ message: "Update successfully" });
  },
];

const handleDeletePost = [
  passport.authenticate("jwt", { session: false }),
  validateUserId,
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);

    await db.deletePost(id);
    res.json({ message: "Delete successfully" });
  },
];

const handleCreatePost: RequestHandler[] = [
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

export default {
  handleGetAllPosts,
  handleGetPostById,
  handleUpdatePost,
  handleDeletePost,
  handleCreatePost,
};
