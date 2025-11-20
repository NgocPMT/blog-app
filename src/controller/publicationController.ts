import type { Request, Response } from "express";
import db from "../db/queries.js";
import passport from "passport";

const handleGetPublications = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page?: string; limit?: string };

    const publications = await db.getPublications(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    return res.json(publications);
  },
];

const handleCreatePublication = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;

    const userId = (req.user as { id: number }).id;

    const publication = await db.createPublication({
      name,
      bio,
      avatarUrl,
      userId,
    });

    return res
      .status(201)
      .json({ message: "Created publication successfully", publication });
  },
];

const handleUpdatePublication = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;
    const { publicationId } = req.params;

    const publication = await db.updatePublication({
      id: parseInt(publicationId),
      name,
      bio,
      avatarUrl,
    });

    return res.json({
      message: "Updated publication successfully",
      publication,
    });
  },
];

const handleDeletePublication = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { publicationId } = req.params;

    const publication = await db.deletePublication(parseInt(publicationId));

    return res.json({
      message: "Deleted publication successfully",
      publication,
    });
  },
];

export default {
  handleCreatePublication,
  handleUpdatePublication,
  handleGetPublications,
  handleDeletePublication,
};
