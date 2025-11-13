import type { Request, Response } from "express";
import db from "../db/queries.js";
import { postIdValidation } from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import passport from "passport";

const handleReportPost = [
  passport.authenticate("jwt", { session: false }),
  ...validate(postIdValidation),
  async (req: Request, res: Response) => {
    const { postId } = req.body;

    const userId = (req.user as { id: number }).id;

    const reportedPost = await db.createReportedPost({ postId, userId });

    return res.json({ message: "Report successfully", reportedPost });
  },
];

export default {
  handleReportPost,
};
