import { Router } from "express";
import savedPostController from "../controller/savedPostController.js";

const savedPostRouter = Router({ mergeParams: true });

savedPostRouter.get("/", savedPostController.handleGetSavedPosts);

savedPostRouter.post("/", savedPostController.handleCreateSavedPost);

savedPostRouter.delete(
  "/:savedPostId",
  savedPostController.handleDeleteSavedPost
);

export default savedPostRouter;
