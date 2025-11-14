import type { Request, Response } from "express";
import db from "../db/queries.js";
import { validateAdminAuthorization } from "../middlewares/validateAuthorization.js";
import {
  postQueryValidation,
  reportedPostValidation,
  userIdParamValidation,
} from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import passport from "passport";

const getUsers = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const users = await db.getUsers(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      search
    );

    res.json({ users });
  },
];

const getReportedPosts = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    const { page, limit, titleSearch, userSearch } = req.query as {
      page?: string;
      limit?: string;
      titleSearch?: string;
      userSearch?: string;
    };
    const reportedPosts = await db.getReportedPosts(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      titleSearch,
      userSearch
    );

    res.json({ reportedPosts });
  },
];

const handleClearReportedPosts = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(reportedPostValidation),
  async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    const deletedReportedPosts = await db.deleteReportedPost({
      postId,
      userId,
    });

    res.json({ message: "Clear report successfully", deletedReportedPosts });
  },
];

const handleActivateUser = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(userIdParamValidation),
  async (req: Request, res: Response) => {
    const { userId } = req.params as {
      userId: string;
    };

    await db.activateUser(parseInt(userId));

    return res.json({ message: "Activate user successfully" });
  },
];

const handleDeactivateUser = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(userIdParamValidation),
  async (req: Request, res: Response) => {
    const { userId } = req.params as {
      userId: string;
    };

    await db.deactivateUser(parseInt(userId));

    return res.json({ message: "Deactivate user successfully" });
  },
];

export default {
  getReportedPosts,
  getUsers,
  handleActivateUser,
  handleDeactivateUser,
  handleClearReportedPosts,
};
