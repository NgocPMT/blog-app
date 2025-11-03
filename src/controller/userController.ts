import passport from "passport";
import db from "../db/queries.js";
import type { Request, RequestHandler, Response } from "express";
import { userParamValidation } from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";

const handleGetUserInformation: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  validateAuthorization,
  ...validate(userParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserInformation(userId);
    return res.json(user);
  },
];

const handleGetUserProfile: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(userParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserProfile(userId);
    return res.json(user);
  },
];

const handleGetUserPosts: RequestHandler[] = [
  passport.authenticate("jwt", { session: false }),
  ...validate(userParamValidation),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const posts = await db.getUserPosts(userId);
    return res.json(posts);
  },
];

export default {
  handleGetUserInformation,
  handleGetUserProfile,
  handleGetUserPosts,
};
