import { Router } from "express";
import reactionController from "../controller/reactionController.js";

const reactionRouter = Router();

reactionRouter.get("/", reactionController.handleGetReactions);

reactionRouter.post("/", reactionController.handleCreateReaction);

reactionRouter.put("/:reactionId", reactionController.handleUpdateReaction);

reactionRouter.delete("/:reactionId", reactionController.handleDeleteReaction);

export default reactionRouter;
