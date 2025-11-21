import { Router } from "express";
import publicationMemberController from "../controller/publicationMemberController.js";

const publicationMemberRouter = Router({ mergeParams: true });

publicationMemberRouter.get(
  "/",
  publicationMemberController.handleGetPublicationMembers
);

publicationMemberRouter.delete(
  "/:userId",
  publicationMemberController.handleDeletePublicationMember
);

export default publicationMemberRouter;
