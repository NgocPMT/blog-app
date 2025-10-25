import { Router } from "express";
import userController from "../controller/userController.js";

const userRouter = Router();

userRouter.get("/user/:userId", userController.handleGetUserInformation);

userRouter.get("/user/:userId/profile", userController.handleGetUserProfile);

userRouter.get("/user/:userId/posts", userController.handleGetUserPosts);

export default userRouter;
