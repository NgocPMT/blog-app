import passport from "passport";
import db from "../db/queries.js";
import type { Request, Response } from "express";
import {
  postParamValidation,
  postQueryValidation,
  postIdValidation,
  profileValidation,
  followingIdValidation,
  followingIdParamValidation,
} from "../validation/validation.js";
import validate from "../middlewares/validate.js";

const handleGetSelfProfile = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    console.log(userId);
    const profile = await db.getUserProfile(userId);
    return res.json(profile);
  },
];

const handleGetSelfInformation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const information = await db.getUserInformation(userId);
    return res.json(information);
  },
];

const handleGetSelfNotifications = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const notifications = await db.getUserNotifications(userId);
    return res.json(notifications);
  },
];

const handleGetSelfStatistics = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const statistics = await db.getUserStatistics(
      parseInt(page),
      parseInt(limit),
      userId
    );
    return res.json(statistics);
  },
];

const handleGetSelfFollowers = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "User must be logged in to do this action" });
    }

    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };

    const userId = (req.user as { id: number }).id;

    const followers = await db.getUserFollowers(
      userId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    return res.json(followers);
  },
];

const handleGetSelfFollowings = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const followings = await db.getUserFollowings(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    return res.json(followings);
  },
];

const handleFollowUser = [
  passport.authenticate("jwt", { session: false }),
  ...validate(followingIdValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { followingId } = req.body;
    const userId = (req.user as { id: number }).id;

    if (userId === parseInt(followingId))
      return res.status(400).json({ error: "You can't follow yourself" });

    const user = await db.getUserByFollowingIdAndUserId(
      parseInt(followingId),
      userId
    );
    if (user)
      return res.status(400).json({ error: "You have followed this user" });

    await db.followUser(parseInt(followingId), userId);
    return res.status(201).json({ message: "Followed successfully" });
  },
];

const handleUnfollowUser = [
  passport.authenticate("jwt", { session: false }),
  ...validate(followingIdParamValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { followingId } = req.params;

    const userId = (req.user as { id: number }).id;

    const user = await db.getUserByFollowingIdAndUserId(
      parseInt(followingId),
      userId
    );
    if (!user)
      return res.status(400).json({ error: "You haven't followed this user" });

    await db.unfollowUser(parseInt(followingId), userId);
    return res.json({ message: "Unfollowed successfully" });
  },
];

const handleGetSelfSavedPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const savedPosts = await db.getUserSavedPosts(
      parseInt(page),
      parseInt(limit),
      userId
    );
    return res.json(savedPosts);
  },
];

const handleAddToSavedPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postIdValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });
    const { postId } = req.body;

    const userId = (req.user as { id: number }).id;

    const post = await db.getSavedPostByPostIdAndUserId(
      parseInt(postId),
      userId
    );
    if (post)
      return res
        .status(400)
        .json({ error: "This post is already saved to your library" });

    await db.addToSavedPost(parseInt(postId), userId);
    return res
      .status(201)
      .json({ message: "Added to saved post successfully" });
  },
];

const handleDeleteSavedPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postParamValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });
    const { postId } = req.params;

    const userId = (req.user as { id: number }).id;

    const post = await db.getSavedPostByPostIdAndUserId(
      parseInt(postId),
      userId
    );
    if (!post)
      return res
        .status(400)
        .json({ error: "This post is not saved to your library yet" });

    await db.deleteSavedPost(parseInt(postId), userId);
    return res.json({ message: "Deleted saved post successfully" });
  },
];

const handleGetSelfPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const posts = await db.getUserPosts(
      parseInt(page),
      parseInt(limit),
      userId
    );
    return res.json(posts);
  },
];

const handleUpdateSelfProfile = [
  passport.authenticate("jwt", { session: false }),
  ...validate(profileValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const { name, avatarUrl, bio } = req.body as {
      name: string;
      avatarUrl: string;
      bio: string;
    };

    const updatedProfile = await db.updateProfile({
      userId,
      name,
      avatarUrl,
      bio,
    });

    return res.json({
      message: "Update profile successfully",
      profile: updatedProfile,
    });
  },
];

const handleGetSelfPublishedPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const posts = await db.getUserPublishedPosts(
      parseInt(page),
      parseInt(limit),
      userId
    );
    return res.json(posts);
  },
];

const handleGetSelfDraftPosts = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const { page, limit } = req.query as {
      page: string;
      limit: string;
    };
    const userId = (req.user as { id: number }).id;
    const posts = await db.getUserDraftPosts(
      parseInt(page),
      parseInt(limit),
      userId
    );
    return res.json(posts);
  },
];

const handleMarkSelfNotification = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const userId = (req.user as { id: number }).id;
    await db.markFirst15NotificationsAsRead(userId);
    return res.json({ message: "Mark as all read successfully" });
  },
];

export default {
  handleGetSelfInformation,
  handleGetSelfNotifications,
  handleGetSelfProfile,
  handleGetSelfStatistics,
  handleGetSelfFollowers,
  handleGetSelfFollowings,
  handleGetSelfSavedPosts,
  handleGetSelfPosts,
  handleUpdateSelfProfile,
  handleAddToSavedPosts,
  handleDeleteSavedPosts,
  handleFollowUser,
  handleUnfollowUser,
  handleGetSelfDraftPosts,
  handleGetSelfPublishedPosts,
  handleMarkSelfNotification,
};
