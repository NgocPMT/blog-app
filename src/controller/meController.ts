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
  slugParamValidation,
} from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import { validatePostAuthorizationBySlug } from "../middlewares/validateAuthorization.js";

const handleGetSelfProfile = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const profile = await db.getUserProfile(userId);
    return res.json(profile);
  },
];

const handleDeleteAccount = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const userId = (req.user as { id: number }).id;
    await db.deleteUser(userId);
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

const handleGetSelfPublications = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const userId = (req.user as { id: number }).id;

    const isEmptySearch = search ? search.trim() === "" : true;
    const publications = await db.getUserPublications(
      userId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(publications);
  },
];

const handleGetSelfInvitations = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };
    const userId = (req.user as { id: number }).id;

    const invitations = await db.getUserInvitations(
      userId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    return res.json(invitations);
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

const handleGetSelfPendingPosts = [
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
    const posts = await db.getUserPendingPosts(
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

const handlePublishPost = [
  passport.authenticate("jwt", { session: false }),
  validatePostAuthorizationBySlug,
  ...validate(slugParamValidation),
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const publishedPost = await db.publishPost(slug);

    return res.json({ message: "Publish post successfully", publishedPost });
  },
];

export default {
  handleGetSelfInformation,
  handleGetSelfNotifications,
  handleGetSelfProfile,
  handleGetSelfStatistics,
  handleGetSelfFollowers,
  handleGetSelfFollowings,
  handleGetSelfPosts,
  handleUpdateSelfProfile,
  handleFollowUser,
  handleUnfollowUser,
  handleGetSelfDraftPosts,
  handleGetSelfPublishedPosts,
  handleMarkSelfNotification,
  handlePublishPost,
  handleGetSelfSavedPosts,
  handleGetSelfInvitations,
  handleDeleteAccount,
  handleGetSelfPublications,
  handleGetSelfPendingPosts,
};
