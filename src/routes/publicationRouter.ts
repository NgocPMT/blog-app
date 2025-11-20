import { Router } from "express";
import publicationController from "../controller/publicationController.js";
import publicationPostRouter from "./publicationPostRouter.js";

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

publicationRouter.use("/:publicationId/posts", publicationPostRouter);

export default publicationRouter;
