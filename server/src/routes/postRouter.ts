import { Router } from "express";
import postController from "../controller/postController.js";
import commentRouter from "./commentRouter.js";
import validatePostExists from "../middlewares/validatePostExists.js";

const postRouter = Router();

postRouter.get("/", postController.handleGetAllPosts);

postRouter.post("/", postController.handleCreatePost);

postRouter.get(
  "/:postId",
  validatePostExists,
  postController.handleGetPostById
);

postRouter.put("/:postId", validatePostExists, postController.handleUpdatePost);

postRouter.delete(
  "/:postId",
  validatePostExists,
  postController.handleDeletePost
);

postRouter.use("/:postId/comments", validatePostExists, commentRouter);

export default postRouter;
