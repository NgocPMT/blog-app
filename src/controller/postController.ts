import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import {
  postValidation,
  postParamValidation,
  postQueryValidation,
} from "../validation/validation.js";
import { validatePostAuthorization } from "../middlewares/validateAuthorization.js";
import validate from "../middlewares/validate.js";
import slugify from "slug";

const handleGetPostById: RequestHandler[] = [
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);
    const post = await db.getPostById(id);
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

export default {
  handleGetPostById,
  handleUpdatePost,
  handleDeletePost,
  handleCreatePost,
  handleGetPostsPagination,
};
