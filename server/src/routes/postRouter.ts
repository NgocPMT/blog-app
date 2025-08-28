import { Router } from "express";
import postController from "../controller/postController.js";
import commentRouter from "./commentRouter.js";

const postRouter = Router();

postRouter.get("/", postController.handleGetAllPosts);

postRouter.post("/", postController.handleCreatePost);

postRouter.get("/:postId", postController.handleGetPostById);

postRouter.put("/:postId", postController.handleUpdatePost);

postRouter.delete("/:postId", postController.handleDeletePost);

postRouter.use("/:postId/comments", commentRouter);

export default postRouter;
