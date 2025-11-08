import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import {
  postValidation,
  postParamValidation,
  postQueryValidation,
  reactionValidation,
} from "../validation/validation.js";
import { validatePostAuthorization } from "../middlewares/validateAuthorization.js";
import validate from "../middlewares/validate.js";
import slugify from "slug";
import { error } from "console";

const handleGetPostBySlug: RequestHandler[] = [
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const post = await db.getPostBySlug(slug);
    res.json(post);
  },
];

const handleGetPostsPagination: RequestHandler[] = [
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page: string;
      limit: string;
      search: string;
    };
    const isEmptySearch = search ? search.trim() === "" : true;
    const posts = await db.getPublishedPosts(
      parseInt(page),
      parseInt(limit),
      isEmptySearch ? null : search
    );
    res.json(posts);
  },
];

const handleUpdatePost: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  ...validate(postValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);
    const { title, content } = req.body;
    await db.updatePost({ id, title, content });
    return res.json({ message: "Update post successfully" });
  },
];

const handleDeletePost: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  validatePostAuthorization,
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);

    await db.deletePost(id);
    res.json({ message: "Delete post successfully" });
  },
];

const handleCreatePost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(403).json({ error: "You must login to create a post" });

    const { title, content, coverImageUrl } = req.body;

    const parsedContent = JSON.parse(content);

    let slug = slugify(title, { lower: true });

    const isSlugUnique = !db.doesSlugExist(slug);

    if (!isSlugUnique) {
      slug = `${slug}-${Date.now()}`;
    }

    const userId = (req.user as { id: number }).id;
    await db.createPost({
      title,
      content: parsedContent,
      slug,
      status: "PUBLISHED",
      userId,
      coverImageUrl,
    });
    res.status(201).json({ message: "Create post successfully" });
  },
];

const handleReactPost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  ...validate(reactionValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(403).json({ error: "You must login to create a post" });

    const { postId } = req.params;
    const { reactionTypeId } = req.body;

    const userId = (req.user as { id: number }).id;
    const isReacted = await db.isReacted(parseInt(postId), userId);
    if (isReacted)
      return res
        .status(400)
        .json({ error: "This user have reacted on this post." });
    await db.reactPost(reactionTypeId, parseInt(postId), userId);
    res.status(201).json({ message: "Reacted successfully" });
  },
];

const handleUnreactPost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(403).json({ error: "You must login to create a post" });

    const { postId } = req.params;

    const userId = (req.user as { id: number }).id;
    await db.unreactPost(parseInt(postId), userId);
    res.json({ message: "Unreacted successfully" });
  },
];

export default {
  handleGetPostBySlug,
  handleUpdatePost,
  handleDeletePost,
  handleCreatePost,
  handleGetPostsPagination,
  handleReactPost,
  handleUnreactPost,
};
