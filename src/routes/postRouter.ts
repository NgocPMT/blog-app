import { Router } from "express";
import postController from "../controller/postController.js";
import commentRouter from "./commentRouter.js";
import validate from "../middlewares/validate.js";
import { postParamValidation } from "../validation/validation.js";

const postRouter = Router();

postRouter.get("/", postController.handleGetPostsPagination);

postRouter.post("/", postController.handleCreatePost);

postRouter.get("/:postId", postController.handleGetPostById);

postRouter.put("/:postId", postController.handleUpdatePost);

// postRouter.put("/:postId/publish", postController.handlePublishPost);

// postRouter.put("/:postId/unpublish", postController.handleUnpublishPost);

postRouter.delete("/:postId", postController.handleDeletePost);

postRouter.use(
  "/:postId/comments",
  validate(postParamValidation),
  commentRouter
);

export default postRouter;
