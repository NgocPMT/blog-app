import { Router } from "express";
import postController from "../controller/postController.js";

const postRouter = Router();

postRouter.get("/", postController.getAllPosts);

postRouter.post("/", postController.createPost);

export default postRouter;
