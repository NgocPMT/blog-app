import { Router } from "express";
import publicationController from "../controller/publicationController.js";

const publicationRouter = Router();

publicationRouter.get("/", publicationController.handleGetPublications);

publicationRouter.post("/", publicationController.handleCreatePublication);

publicationRouter.put(
  "/:publicationId",
  publicationController.handleUpdatePublication
);

publicationRouter.delete(
  "/:publicationId",
  publicationController.handleDeletePublication
);

export default publicationRouter;
