import { Router } from "express";
import reactionController from "../controller/reactionController.js";

const reactionRouter = Router();

reactionRouter.get("/", reactionController.handleGetReactions);

export default reactionRouter;
