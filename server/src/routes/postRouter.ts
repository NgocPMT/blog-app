import { Router } from "express";
import postController from "../controller/postController.js";

const postRouter = Router();

postRouter.get("/", postController.handleGetAllPosts);

postRouter.post("/", postController.handleCreatePost);

postRouter.get("/:id", postController.handleGetPostById);

postRouter.put("/:id", postController.handleUpdatePost);

postRouter.delete("/:id", postController.handleDeletePost);

export default postRouter;
