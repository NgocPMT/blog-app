import { Router } from "express";
import meController from "../controller/meController.js";

const meRouter = Router();

meRouter.get("/profile", meController.handleGetSelfProfile);

meRouter.put("/profile", meController.handleUpdateSelfProfile);

meRouter.get("/notifications", meController.handleGetSelfNotifications);

meRouter.get("/statistics", meController.handleGetSelfStatistics);

meRouter.get("/followers", meController.handleGetSelfFollowers);

meRouter.get("/followings", meController.handleGetSelfFollowings);

meRouter.post("/followings", () => {});

meRouter.delete("/followings", () => {});

meRouter.get("/saved-posts", meController.handleGetSelfSavedPosts);

meRouter.post("/saved-post", meController.handleAddToSavedPosts);

meRouter.delete("/saved-post", meController.handleDeleteSavedPosts);

meRouter.get("/posts", meController.handleGetSelfPosts);

export default meRouter;
