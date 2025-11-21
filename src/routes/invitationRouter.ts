import { Router } from "express";
import invitationController from "../controller/invitationController.js";

const invitationRouter = Router();

invitationRouter.get(
  "/:invitationId",
  invitationController.handleGetInvitation
);

invitationRouter.post("/", invitationController.handleCreateInvitation);

invitationRouter.put(
  "/:invitationId/accept",
  invitationController.handleAcceptInvitation
);

invitationRouter.put(
  "/:invitationId/declined",
  invitationController.handleDeclineInvitation
);

invitationRouter.delete(
  "/:invitationId",
  invitationController.handleDeleteInvitation
);

export default invitationRouter;
