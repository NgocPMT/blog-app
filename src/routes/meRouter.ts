import { Router } from "express";
import meController from "../controller/meController.js";

const meRouter = Router();

meRouter.get("/profile", meController.handleGetSelfProfile);

meRouter.put("/profile", meController.handleUpdateSelfProfile);

meRouter.get("/notifications", meController.handleGetSelfNotifications);

meRouter.get("/statistics", meController.handleGetSelfStatistics);

meRouter.get("/followers", meController.handleGetSelfFollowers);

meRouter.get("/followings", meController.handleGetSelfFollowings);

meRouter.post("/followings", meController.handleFollowUser);

meRouter.delete("/followings/:followingId", meController.handleUnfollowUser);

meRouter.get("/saved-posts", meController.handleGetSelfSavedPosts);

meRouter.post("/saved-posts", meController.handleAddToSavedPosts);

meRouter.delete("/saved-posts/:postId", meController.handleDeleteSavedPosts);

meRouter.get("/posts", meController.handleGetSelfPosts);

export default meRouter;
