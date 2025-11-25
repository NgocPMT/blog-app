import type { Request, Response } from "express";
import db from "../db/queries.js";
import passport from "passport";
import validate from "../middlewares/validate.js";
import { publicationIdParamValidation } from "../validation/validation.js";

const handleGetPublications = [
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const isEmptySearch = search ? search.trim() === "" : true;
    const publications = await db.getPublications(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      isEmptySearch ? undefined : search
    );

    return res.json(publications);
  },
];

const handleGetInvitations = [
  passport.authenticate("jwt", { session: false }),
  ...validate(publicationIdParamValidation),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };
    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

    const invitations = await db.getPublicationInvitations(
      publicationId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    return res.json(invitations);
  },
];

const handleGetPublicationProfile = [
  ...validate(publicationIdParamValidation),
  async (req: Request, res: Response) => {
    const publicationId = parseInt(req.params.publicationId);

    const publicationProfile = await db.getPublicationProfile(publicationId);

    return res.json(publicationProfile);
  },
];

const handleCreatePublication = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;

    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Name must not be empty" });

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
  ...validate(publicationIdParamValidation),
  async (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;

    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Name must not be empty" });

    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

    const updatedPublication = await db.updatePublication({
      id: publicationId,
      name,
      bio,
      avatarUrl,
    });

    return res.json({
      message: "Updated publication successfully",
      updatedPublication,
    });
  },
];

const handleDeletePublication = [
  passport.authenticate("jwt", { session: false }),
  ...validate(publicationIdParamValidation),
  async (req: Request, res: Response) => {
    const publicationId = parseInt(req.params.publicationId);
    const currentUserId = (req.user as { id: number }).id;

    const publication = await db.getPublicationOwner(publicationId);

    if (!publication)
      return res.status(404).json({ error: "Publication not found" });
    if (publication.user.id !== currentUserId)
      return res.status(403).json({
        error: "You're not the owner of this publication to do this action",
      });

    const deletedPublication = await db.deletePublication(publicationId);

    return res.json({
      message: "Deleted publication successfully",
      deletedPublication,
    });
  },
];

export default {
  handleCreatePublication,
  handleUpdatePublication,
  handleGetInvitations,
  handleGetPublications,
  handleGetPublicationProfile,
  handleDeletePublication,
};
