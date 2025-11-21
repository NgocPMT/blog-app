import passport from "passport";
import type { Request, Response } from "express";
import db from "../db/queries.js";

const handleGetPublicationMembers = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const publicationId = parseInt(req.params.publicationId);

    const isEmptySearch = search ? search.trim() === "" : true;
    const members = await db.getPublicationMembers(
      publicationId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(members);
  },
];

const handleDeletePublicationMember = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const publicationId = parseInt(req.params.publicationId);

    const deletedMember = await db.deletePublicationMember({
      userId,
      publicationId,
    });
    res.json({ message: "Delete post successfully", deletedMember });
  },
];

export default {
  handleGetPublicationMembers,
  handleDeletePublicationMember,
};
