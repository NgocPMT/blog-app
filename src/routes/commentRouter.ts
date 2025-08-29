import { Router } from "express";
import commentController from "../controller/commentController.js";

const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", commentController.handleGetCommentsByPostId);

commentRouter.post("/", commentController.handleCreateComment);

commentRouter.put("/:commentId", commentController.handleUpdateComment);

commentRouter.delete("/:commentId", commentController.handleDeleteComment);

export default commentRouter;
