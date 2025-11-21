import { Router } from "express";
import userController from "../controller/userController.js";

const userRouter = Router();

userRouter.get("/", userController.handleGetUsers);

userRouter.get("/user/:userId", userController.handleGetUserInformation);

userRouter.get(
  "/user/:username/profile",
  userController.handleGetUserProfileByUsername
);

userRouter.get(
  "/user/:username/posts",
  userController.handleGetUserPostsByUsername
);

userRouter.get(
  "/user/:username/followings",
  userController.handleGetUserFollowingsByUsername
);

userRouter.get(
  "/user/:username/followers",
  userController.handleGetUserFollowersByUsername
);

export default userRouter;
