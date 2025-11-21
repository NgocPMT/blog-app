import type { Request, Response } from "express";
import db from "../db/queries.js";
import passport from "passport";

const handleGetInvitation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const invitationId = parseInt(req.params.invitationId);
    const invitation = await db.getInvitation(invitationId);

    return res.json(invitation);
  },
];

const handleCreateInvitation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { publicationId, inviteeId } = req.body;
    const inviterId = (req.user as { id: number }).id;
    const createdInvitation = await db.createInvitation({
      publicationId,
      inviterId,
      inviteeId,
    });

    return res
      .status(201)
      .json({ message: "Invited successfully", createdInvitation });
  },
];

const handleAcceptInvitation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const invitationId = parseInt(req.params.invitationId);
    const acceptedInvitation = await db.acceptInvitation(invitationId);

    return res.json({
      message: "Invitation accepted, you are now a member of the publication",
      acceptedInvitation,
    });
  },
];

const handleDeclineInvitation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const invitationId = parseInt(req.params.invitationId);
    const declinedInvitation = await db.declineInvitation(invitationId);

    return res.json({ message: "Invitation declined", declinedInvitation });
  },
];

const handleDeleteInvitation = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const invitationId = parseInt(req.params.invitationId);
    const deletedInvitation = await db.deleteInvitation(invitationId);

    return res.json({
      message: "Deleted invitation successfully",
      deletedInvitation,
    });
  },
];

export default {
  handleGetInvitation,
  handleCreateInvitation,
  handleAcceptInvitation,
  handleDeclineInvitation,
  handleDeleteInvitation,
};
