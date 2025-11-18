import type { Request, Response } from "express";
import passport from "passport";
import db from "../db/queries.js";

const handleGetUserReadingList = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const userId = (req.user as { id: number }).id;

    const readingLists = await db.getUsersReadingList(userId);

    return res.json(readingLists);
  },
];

const handleCreateReadingList = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = (req.user as { id: number }).id;

    const createdReadingList = await db.createReadingList({ name, userId });

    return res.status(201).json({
      message: "Created reading list successfully",
      createdReadingList,
    });
  },
];

const handleUpdateReadingList = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const { ReadingListId } = req.params;

    const updatedReadingList = await db.updateReadingList({
      id: parseInt(ReadingListId),
      name,
    });

    return res.json({
      message: "Updated reading list successfully",
      updatedReadingList,
    });
  },
];

const handleDeleteReadingList = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { readingListId } = req.params;

    const deletedReadingList = await db.deleteReadingList(
      parseInt(readingListId)
    );

    return res.json({
      message: "Deleted reading list successfully",
      deletedReadingList,
    });
  },
];

export default {
  handleCreateReadingList,
  handleGetUserReadingList,
  handleUpdateReadingList,
  handleDeleteReadingList,
};
