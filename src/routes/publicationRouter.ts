import { Router } from "express";
import publicationController from "../controller/publicationController.js";
import publicationPostRouter from "./publicationPostRouter.js";
import publicationMemberRouter from "./publicationMemberRouter.js";
import validate from "../middlewares/validate.js";
import { publicationIdParamValidation } from "../validation/validation.js";

const publicationRouter = Router();

publicationRouter.get("/", publicationController.handleGetPublications);

publicationRouter.get(
  "/:publicationId",
  publicationController.handleGetPublicationProfile
);

publicationRouter.get(
  "/:publicationId/invitations",
  publicationController.handleGetInvitations
);

publicationRouter.post("/", publicationController.handleCreatePublication);

publicationRouter.put(
  "/:publicationId",
  publicationController.handleUpdatePublication
);

publicationRouter.delete(
  "/:publicationId",
  publicationController.handleDeletePublication
);

publicationRouter.use(
  "/:publicationId/posts",
  ...validate(publicationIdParamValidation),
  publicationPostRouter
);

publicationRouter.use(
  "/:publicationId/members",
  ...validate(publicationIdParamValidation),
  publicationMemberRouter
);

export default publicationRouter;
