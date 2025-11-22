import type { Request, Response } from "express";
import passport from "passport";
import db from "../db/queries.js";

const handleGetTopics = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const isEmptySearch = search ? search.trim() === "" : true;
    const topics = await db.getTopics(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );
    return res.json(topics);
  },
];

const handleCreateTopic = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const topic = await db.createTopic({ name });
    return res
      .status(201)
      .json({ message: "Created topic successfully", topic });
  },
];

const handleUpdateTopic = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const { topicId } = req.params;
    const topic = await db.updateTopic({ id: parseInt(topicId), name });
    return res.json({ message: "Updated topic successfully", topic });
  },
];

const handleDeleteTopic = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { topicId } = req.params;
    const topic = await db.deleteTopic(parseInt(topicId));
    return res.json({ message: "Deleted topic successfully", topic });
  },
];

export default {
  handleGetTopics,
  handleCreateTopic,
  handleUpdateTopic,
  handleDeleteTopic,
};
