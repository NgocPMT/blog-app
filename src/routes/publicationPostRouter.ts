import { Router } from "express";
import publicationPostController from "../controller/publicationPostController.js";

const publicationPostRouter = Router({ mergeParams: true });

publicationPostRouter.get(
  "/",
  publicationPostController.handleGetPublicationPosts
);

publicationPostRouter.post(
  "/",
  publicationPostController.handleCreatePublicationPost
);

publicationPostRouter.put(
  "/:slug/approved",
  publicationPostController.handlePublishPublicationPost
);

publicationPostRouter.delete(
  "/:postId",
  publicationPostController.handleDeletePublicationPost
);

export default publicationPostRouter;
