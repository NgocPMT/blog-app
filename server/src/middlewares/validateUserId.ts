import type { NextFunction, Request, Response } from "express";
import db from "../db/queries.js";

const validateUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id);
  const post = await db.getPostById(id);

  if (!post) return res.status(404).json({ error: "Post not found" });
  const userId = (req.user as { id: number }).id;
  if (post.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};

export default validateUserId;
