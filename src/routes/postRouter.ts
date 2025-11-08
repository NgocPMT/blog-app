import { Router } from "express";
import postController from "../controller/postController.js";
import commentRouter from "./commentRouter.js";
import validate from "../middlewares/validate.js";
import { postParamValidation } from "../validation/validation.js";

const postRouter = Router();

postRouter.get("/", postController.handleGetPostsPagination);

postRouter.post("/", postController.handleCreatePost);

postRouter.get("/:slug", postController.handleGetPostBySlug);

postRouter.put("/:postId", postController.handleUpdatePost);

postRouter.delete("/:postId", postController.handleDeletePost);

postRouter.post("/:postId/reactions", postController.handleReactPost);

postRouter.delete("/:postId/reactions", postController.handleUnreactPost);

postRouter.use(
  "/:postId/comments",
  validate(postParamValidation),
  commentRouter
);

export default postRouter;
