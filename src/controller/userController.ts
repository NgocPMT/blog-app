import passport from "passport";
import db from "../db/queries.js";
import type { Request, RequestHandler, Response } from "express";
import {
  userIdParamValidation,
  usernameParamValidation,
} from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";

const handleGetUserInformation: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  validateAuthorization,
  ...validate(userIdParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserInformation(userId);
    return res.json(user);
  },
];

const handleGetUserProfile: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(userIdParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserProfile(userId);
    return res.json(user);
  },
];

const handleGetUserPosts: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(userIdParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const posts = await db.getUserPosts(userId);
    return res.json(posts);
  },
];

const handleGetUserPostsByUsername: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(usernameParamValidation),
  async (req: Request, res: Response) => {
    const username = req.params.username;
    const posts = await db.getUserPostsByUsername(username);
    return res.json(posts);
  },
];

const handleGetUserProfileByUsername: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(usernameParamValidation),
  async (req: Request, res: Response) => {
    const username = req.params.username;
    const profile = await db.getUserProfileByUsername(username);
    return res.json(profile);
  },
];

const handleGetUserFollowersByUsername: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(usernameParamValidation),
  async (req: Request, res: Response) => {
    const username = req.params.username;
    const followers = await db.getUserFollowersByUsername(username);
    return res.json(followers);
  },
];

const handleGetUserFollowingsByUsername: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(usernameParamValidation),
  async (req: Request, res: Response) => {
    const username = req.params.username;
    const followings = await db.getUserFollowingsByUsername(username);
    return res.json(followings);
  },
];

export default {
  handleGetUserInformation,
  handleGetUserProfile,
  handleGetUserPosts,
  handleGetUserPostsByUsername,
  handleGetUserProfileByUsername,
  handleGetUserFollowersByUsername,
  handleGetUserFollowingsByUsername,
};
