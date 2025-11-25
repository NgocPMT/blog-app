import passport from "passport";
import type { Request, Response } from "express";
import db from "../db/queries.js";

const handleGetPublicationMembers = [
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
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

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
