import passport from "passport";
import type { Request, Response } from "express";
import db from "../db/queries.js";
import slugify from "slug";

const handleGetPublicationPosts = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const publicationId = parseInt(req.params.publicationId);

    const isEmptySearch = search ? search.trim() === "" : true;
    const publicationPosts = await db.getPublicationPosts(
      publicationId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(publicationPosts);
  },
];

const handleCreatePublicationPost = [
  passport.authenticate("jwt", { session: false }),
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
    const id = parseInt(req.params.postId);

    await db.deletePost(id);
    res.json({ message: "Delete post successfully" });
  },
];

export default {
  handleGetPublicationPosts,
  handleCreatePublicationPost,
  handlePublishPublicationPost,
  handleDeletePublicationPost,
};
