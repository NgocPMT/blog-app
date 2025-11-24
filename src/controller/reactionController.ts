import type { Request, Response } from "express";
import db from "../db/queries.js";
import passport from "passport";
import { validateAdminAuthorization } from "../middlewares/validateAuthorization.js";
import {
  reactionIdParamValidation,
  reactionValidation,
} from "../validation/validation.js";
import validate from "../middlewares/validate.js";

const handleGetReactions = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const reactions = await db.getReactionTypes();

    return res.json(reactions);
  },
];

const handleCreateReaction = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(reactionValidation),
  async (req: Request, res: Response) => {
    const { name, reactionImageUrl } = req.body;

    const duplicatedNameReaction = await db.getReactionTypeByName(name);

    if (duplicatedNameReaction)
      return res
        .status(400)
        .json({ error: "Reaction with this name already exists" });

    const createdReaction = await db.createReactionType({
      name,
      reactionImageUrl,
    });
    return res
      .status(201)
      .json({ message: "Created reaction successfully", createdReaction });
  },
];

const handleUpdateReaction = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(reactionIdParamValidation),
  ...validate(reactionValidation),
  async (req: Request, res: Response) => {
    const { name, reactionImageUrl } = req.body;
    const id = parseInt(req.params.reactionId);

    const duplicatedNameReaction = await db.getReactionTypeByName(name);

    if (duplicatedNameReaction && duplicatedNameReaction.id !== id)
      return res
        .status(400)
        .json({ error: "Reaction with this name already exists" });

    const updatedReaction = await db.updateReactionType({
      id,
      name,
      reactionImageUrl,
    });
    return res.json({
      message: "Updated reaction successfully",
      updatedReaction,
    });
  },
];

const handleDeleteReaction = [
  passport.authenticate("jwt", { session: false }),
  validateAdminAuthorization,
  ...validate(reactionIdParamValidation),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.reactionId);
    const deletedReaction = await db.deleteReactionType(id);
    return res.json({
      message: "Deleted reaction successfully",
      deletedReaction,
    });
  },
];

export default {
  handleGetReactions,
  handleCreateReaction,
  handleUpdateReaction,
  handleDeleteReaction,
};
