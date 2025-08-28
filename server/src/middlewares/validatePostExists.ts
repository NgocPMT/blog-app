import db from "../db/queries.js";
import type { Request, Response, NextFunction } from "express";

const validatePostExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId)))
    return res.status(404).json({ error: "Post not found" });

  const post = db.getPostById(parseInt(postId));

  if (!post) return res.status(404).json({ error: "Post not found" });

  next();
};

export default validatePostExists;
