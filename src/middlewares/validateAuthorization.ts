import type { NextFunction, Request, Response } from "express";
import db from "../db/queries.js";

const validateAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = parseInt(req.params.userId);
  const currentUserId = (req.user as { id: number }).id;
  const userRole = (req.user as { id: number; role: string }).role;
  if (userRole === "ADMIN") {
    next();
    return;
  }
  if (userId !== currentUserId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};

const validateAdminAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = (req.user as { role: string }).role;
  if (userRole !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

const validateViewAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = parseInt(req.params.userId);
  const currentUserId = (req.user as { id: number }).id;
  if (userId === currentUserId)
    return res.json({ message: "The current user is also the author" });
  next();
};

const validatePostAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.postId);
  const post = await db.getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const userId = (req.user as { id: number }).id;
  const userRole = (req.user as { id: number; role: string }).role;
  if (userRole === "ADMIN") {
    next();
    return;
  }
  if (post.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};

const validatePostAuthorizationBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const slug = req.params.slug;
  const post = await db.getPostBySlug(slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const userId = (req.user as { id: number }).id;
  const userRole = (req.user as { id: number; role: string }).role;
  if (userRole === "ADMIN") {
    next();
    return;
  }
  if (post.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};

const validateCommentAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { postId, commentId } = req.params;
  const comment = await db.getCommentById(parseInt(commentId));
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  const post = await db.getPostById(parseInt(postId));
  if (!post) return res.status(404).json({ error: "Post not found" });

  const userId = (req.user as { id: number; role: string }).id;
  const userRole = (req.user as { id: number; role: string }).role;
  if (userRole === "ADMIN") {
    next();
    return;
  }
  if (comment.userId !== userId && post.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};

export {
  validatePostAuthorization,
  validateCommentAuthorization,
  validateAuthorization,
  validateViewAuthorization,
  validateAdminAuthorization,
  validatePostAuthorizationBySlug,
};
export default {
  validatePostAuthorization,
  validateCommentAuthorization,
  validateAuthorization,
  validateViewAuthorization,
  validateAdminAuthorization,
  validatePostAuthorizationBySlug,
};
