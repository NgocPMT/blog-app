import type { Request, Response } from "express";
import db from "../db/queries.js";
import { validateAdminAuthorization } from "../middlewares/validateAuthorization.js";
import { postQueryValidation } from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import passport from "passport";

const getUsers = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };
    const users = await db.getUsers(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    res.json({ users });
  },
];

const getReportedPosts = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(postQueryValidation),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };
    const reportedPosts = await db.getReportedPosts(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    res.json({ reportedPosts });
  },
];

export default {
  getReportedPosts,
  getUsers,
};
