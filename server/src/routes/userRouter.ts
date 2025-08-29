import { Router } from "express";
import userController from "../controller/userController.js";

const userRouter = Router();

userRouter.get("/:userId", userController.handleGetUserById);

userRouter.get("/:userId/posts", userController.handleGetUserPosts);

export default userRouter;
