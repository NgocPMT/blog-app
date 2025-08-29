import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import {
  postValidation,
  postParamValidation,
} from "../validation/validation.js";
import { validatePostAuthorization } from "../middlewares/validateAuthorization.js";
import validate from "../middlewares/validate.js";

const handleGetAllPosts = async (req: Request, res: Response) => {
  const posts = await db.getAllPosts();
  res.json(posts);
};

const handleGetPostById: RequestHandler[] = [
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);
    const post = await db.getPostById(id);
    res.json(post);
  },
];

const handleUpdatePost: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  validatePostAuthorization,
  ...validate(postParamValidation),
  ...validate(postValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);
    const { title, content } = req.body;
    await db.updatePost({ id, title, content });
    return res.json({ message: "Update successfully" });
  },
];

const handleDeletePost: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  validatePostAuthorization,
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);

    await db.deletePost(id);
    res.json({ message: "Delete successfully" });
  },
];

const handleCreatePost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postValidation),
  async (req: Request, res: Response) => {
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
