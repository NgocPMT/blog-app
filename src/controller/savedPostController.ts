import type { Request, Response } from "express";
import passport from "passport";
import db from "../db/queries.js";

const handleGetSavedPosts = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { readingListId } = req.params;

    const savedPosts = await db.getReadingListSavedPosts(
      parseInt(readingListId)
    );

    return res.json(savedPosts);
  },
];

const handleCreateSavedPost = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { readingListId } = req.params;
    const { postId } = req.body;

    const savedPost = await db.createSavedPost(postId, parseInt(readingListId));

    return res.status(201).json({
      message: "Saved post successfully",
      savedPost,
    });
  },
];

const handleDeleteSavedPost = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { savedPostId } = req.params;

    const deletedSavedPost = await db.deleteSavedPost(parseInt(savedPostId));

    return res.json({
      message: "Deleted saved post successfully",
      deletedSavedPost,
    });
  },
];

export default {
  handleGetSavedPosts,
  handleCreateSavedPost,
  handleDeleteSavedPost,
};
