import passport from "passport";
import type { Request, RequestHandler, Response } from "express";
import db from "../db/queries.js";
import {
  postValidation,
  postParamValidation,
  postQueryValidation,
  slugParamValidation,
  postUpdateValidation,
  postSavingValidation,
  reactionIdValidation,
} from "../validation/validation.js";
import {
  validatePostAuthorization,
  validateViewAuthorization,
} from "../middlewares/validateAuthorization.js";
import validate from "../middlewares/validate.js";
import slugify from "slug";
import optionalAuth from "../middlewares/optionalAuth.js";

const handleGetPostBySlug: RequestHandler[] = [
  optionalAuth,
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const post = await db.getPostBySlug(slug);

    if (post?.status === "DRAFT") {
      if (!req.user) {
        res.status(400).json({ error: "You can not view other user's draft" });
      }
      const userId = (req.user as { id: number }).id;
      if (userId !== post.user.id) {
        res.status(400).json({ error: "You can not view other user's draft" });
      }
    }
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
  ...validate(postUpdateValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.postId);
    const { title, content, coverImageUrl, topics } = req.body as {
      title: string;
      content: string;
      coverImageUrl: string;
      topics: number[];
    };
    const parsedContent = JSON.parse(content);

    let slug = slugify(title, { lower: true });

    const isSlugUnique = !db.doesSlugExist(slug);

    if (!isSlugUnique) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = (await db.getPostById(id))!; // cannot be null because the postId is validated

    const oldTopics = post.postTopics.map((topic) => topic.topicId);

    const topicsToAdd = topics
      ? topics.filter((topic) => !oldTopics?.includes(topic))
      : undefined;

    const topicsToRemove = topics
      ? oldTopics.filter((topic) => !topics.includes(topic))
      : undefined;

    await db.updatePost({
      id,
      title,
      content: parsedContent,
      slug,
      coverImageUrl,
      topicsToAdd,
      topicsToRemove,
    });

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
      return res.status(401).json({ error: "You must login to create a post" });

    const { title, content, coverImageUrl, topics } = req.body as {
      title: string;
      content: string;
      coverImageUrl: string;
      topics: number[];
    };

    const parsedContent = JSON.parse(content);

    let slug = slugify(title, { lower: true });

    const isSlugUnique = !db.doesSlugExist(slug);

    if (!isSlugUnique) {
      slug = `${slug}-${Date.now()}`;
    }

    const userId = (req.user as { id: number }).id;
    const createdPost = await db.createPost({
      title,
      content: parsedContent,
      slug,
      status: "PUBLISHED",
      userId,
      coverImageUrl,
      topicIds: topics,
    });
    const followers = await db.getUserFollowers(userId);

    followers.forEach(async (follower) => {
      await db.createNotification({
        actorId: userId,
        type: "NEW_POST",
        postId: createdPost.id,
        userId: follower.followedBy.id,
      });
    });
    res.status(201).json({ message: "Create post successfully" });
  },
];

const handleSavePostToDrafts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postSavingValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(401).json({ error: "You must login to save a post" });

    const { id, content, coverImageUrl } = req.body;

    let { title } = req.body;

    const parsedContent = JSON.parse(content);

    if (!title) {
      title = "Untitled Draft";
    }

    let slug = slugify(title, { lower: true });

    const isSlugUnique = !db.doesSlugExist(slug);

    if (!isSlugUnique) {
      slug = `${slug}-${Date.now()}`;
    }

    const userId = (req.user as { id: number }).id;

    const post = await db.getPostByTitleAndUserId(title, userId);

    if (id) {
      const updatedPost = await db.updatePost({
        id,
        title,
        content: parsedContent,
        slug,
        coverImageUrl,
      });
      return res
        .status(200)
        .json({ message: "Saved post to drafts successfully", updatedPost });
    }

    if (post)
      return res
        .status(400)
        .json({ error: "Post with this title already existed on this user" });

    const createdPost = await db.createPost({
      title,
      content: parsedContent,
      slug,
      status: "DRAFT",
      userId,
      coverImageUrl,
    });
    res
      .status(201)
      .json({ message: "Saved post to drafts successfully", createdPost });
  },
];

const handleReactPost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  ...validate(reactionIdValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "You must login to react on a post" });

    const { postId } = req.params;
    const { reactionTypeId } = req.body;

    const userId = (req.user as { id: number }).id;
    const isReacted = await db.isReacted(parseInt(postId), userId);
    if (isReacted)
      return res
        .status(400)
        .json({ error: "This user have reacted on this post." });

    const reacted = await db.reactPost(
      reactionTypeId,
      parseInt(postId),
      userId
    );

    const author = await db.getUserByPostId(parseInt(postId));

    if (!author) return res.status(500).json({ error: "Something went wrong" });

    await db.createNotification({
      userId: author.user.id,
      postId: parseInt(postId),
      type: "POST_REACTION",
      actorId: userId,
    });
    res.status(201).json({ message: "Reacted successfully", reacted });
  },
];

const handleUnreactPost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "You must login to unreact a post" });

    const { postId } = req.params;

    const userId = (req.user as { id: number }).id;
    const unreacted = await db.unreactPost(parseInt(postId), userId);
    res.json({ message: "Unreacted successfully", unreacted });
  },
];

const handleViewPost = [
  passport.authenticate("jwt", { session: false }),
  validateViewAuthorization,
  ...validate(slugParamValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(401).json({ error: "You must login to create a post" });

    const { slug } = req.params;

    const userId = (req.user as { id: number }).id;
    const post = await db.getPostBySlug(slug);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const isViewed = await db.isViewed({ id: post.id, userId });

    if (isViewed)
      return res
        .status(200)
        .json({ message: "This user have viewed this post already" });

    const postView = await db.createPostView({
      slug,
      userId,
    });
    if (!postView)
      return res.status(500).json({ error: "Something went wrong" });
    res.json({ message: "added view successfully", postView });
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
  handleViewPost,
  handleSavePostToDrafts,
};
