import { Router } from "express";
import meController from "../controller/meController.js";
import readingListRouter from "./readingListRouter.js";

const meRouter = Router();

meRouter.delete("/", meController.handleDeleteAccount);

meRouter.get("/profile", meController.handleGetSelfProfile);

meRouter.put("/profile", meController.handleUpdateSelfProfile);

meRouter.get("/notifications", meController.handleGetSelfNotifications);

meRouter.get("/publications", meController.handleGetSelfPublications);

meRouter.get("/invitations", meController.handleGetSelfInvitations);

meRouter.put("/notifications/read", meController.handleMarkSelfNotification);

meRouter.get("/statistics", meController.handleGetSelfStatistics);

meRouter.get("/saved-posts", meController.handleGetSelfSavedPosts);

meRouter.get("/followers", meController.handleGetSelfFollowers);

meRouter.get("/followings", meController.handleGetSelfFollowings);

meRouter.post("/followings", meController.handleFollowUser);

meRouter.delete("/followings/:followingId", meController.handleUnfollowUser);

meRouter.get("/posts", meController.handleGetSelfPosts);

meRouter.get("/published-posts", meController.handleGetSelfPublishedPosts);

meRouter.get("/draft-posts", meController.handleGetSelfDraftPosts);

meRouter.get("/pending-posts", meController.handleGetSelfPendingPosts);

meRouter.put("/draft-posts/:slug/publish", meController.handlePublishPost);

meRouter.use("/reading-lists", readingListRouter);

export default meRouter;
