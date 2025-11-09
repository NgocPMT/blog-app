import passport from "passport";
import db from "../db/queries.js";
import type { Request, Response } from "express";
import {
  postParamValidation,
  postQueryValidation,
  postIdValidation,
  profileValidation,
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
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const followers = await db.getUserFollowers(userId);
    return res.json(followers);
  },
];

const handleGetSelfFollowings = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const followings = await db.getUserFollowings(userId);
    return res.json(followings);
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
};
