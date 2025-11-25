import type { Request, Response } from "express";
import passport from "passport";
import db from "../db/queries.js";
import { readingListIdParamValidation } from "../validation/validation.js";
import validate from "../middlewares/validate.js";

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
    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Name must not be empty" });
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
  ...validate(readingListIdParamValidation),
  async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Name must not be empty" });
    const { readingListId } = req.params;
    const readingList = await db.getReadingListById(parseInt(readingListId));
    if (!readingList)
      return res.status(404).json({ error: "Reading List not found" });

    const updatedReadingList = await db.updateReadingList({
      id: parseInt(readingListId),
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
  ...validate(readingListIdParamValidation),
  async (req: Request, res: Response) => {
    const { readingListId } = req.params;
    const readingList = await db.getReadingListById(parseInt(readingListId));
    if (!readingList)
      return res.status(404).json({ error: "Reading List not found" });

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
