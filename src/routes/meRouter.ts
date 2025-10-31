import { Router } from "express";
import meController from "../controller/meController.js";

const meRouter = Router();

meRouter.get("/profile", meController.handleGetSelfProfile);

meRouter.get("/notifications", meController.handleGetSelfNotifications);

meRouter.get("/statistics", meController.handleGetSelfStatistics);

meRouter.get("/followers", meController.handleGetSelfFollowers);

meRouter.get("/followings", meController.handleGetSelfFollowings);

meRouter.get("/saved-posts", meController.handleGetSelfSavedPosts);

meRouter.get("/posts", meController.handleGetSelfPosts);

export default meRouter;
