import { Router } from "express";
import topicController from "../controller/topicController.js";

const topicRouter = Router();

topicRouter.get("/", topicController.handleGetTopics);

topicRouter.post("/", topicController.handleCreateTopic);

topicRouter.put("/:topicId", topicController.handleUpdateTopic);

topicRouter.delete("/:topicId", topicController.handleDeleteTopic);

export default topicRouter;
