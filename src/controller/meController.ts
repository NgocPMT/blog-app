import passport from "passport";
import db from "../db/queries.js";
import type { Request, Response } from "express";
import { profileValidation } from "../validation/validation.js";
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
  async (req: Request, res: Response) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "User must logged in to do this action" });

    const userId = (req.user as { id: number }).id;
    const statistics = await db.getUserStatistics(userId);
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
};
