import passport from "passport";
import type { Request, Response } from "express";
import db from "../db/queries.js";
import slugify from "slug";
import validate from "../middlewares/validate.js";
import { postValidation } from "../validation/validation.js";

const handleGetPublicationPosts = [
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const publicationId = parseInt(req.params.publicationId);

    const isEmptySearch = search ? search.trim() === "" : true;
    const posts = await db.getPublicationPosts(
      publicationId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(posts);
  },
];

const handleGetPublicationPendingPosts = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

    const isEmptySearch = search ? search.trim() === "" : true;
    const pendingPosts = await db.getPublicationPendingPosts(
      publicationId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(pendingPosts);
  },
];

const handleCreatePublicationPost = [
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

    const publicationId = parseInt(req.params.publicationId);
    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    const userId = (req.user as { id: number }).id;

    const member = await db.getMember({ publicationId, userId });
    if (!member)
      return res
        .status(403)
        .json({ error: "You're not a member of this publication" });

    const parsedContent = JSON.parse(content);

    let slug = slugify(title, { lower: true });

    const isSlugUnique = !db.doesSlugExist(slug);

    if (!isSlugUnique) {
      slug = `${slug}-${Date.now()}`;
    }

    const createdPost = await db.createPost({
      title,
      content: parsedContent,
      slug,
      status: "PENDING",
      userId,
      coverImageUrl,
      topicIds: topics,
      publicationId,
    });
    res.status(201).json({ message: "Submit post successfully", createdPost });
  },
];

const handlePublishPublicationPost = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

    const publishedPost = await db.publishPost(slug);

    const userId = publishedPost.userId;

    const userFollowers = await db.getUserFollowers(publishedPost.userId);

    userFollowers.forEach(async (userFollower) => {
      await db.createNotification({
        actorId: userId,
        type: "NEW_POST",
        postId: publishedPost.id,
        userId: userFollower.followedBy.id,
      });
    });
    return res.json({ message: "Published post successfully", publishedPost });
  },
];

const handleDeletePublicationPost = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });
    const id = parseInt(req.params.postId);

    await db.deletePost(id);
    res.json({ message: "Delete post successfully" });
  },
];

export default {
  handleGetPublicationPosts,
  handleGetPublicationPendingPosts,
  handleCreatePublicationPost,
  handlePublishPublicationPost,
  handleDeletePublicationPost,
};
