import { Router } from "express";
import writingAssistantController from "../controller/writingAssistantController.js";

const writingAssistantRouter = Router();

writingAssistantRouter.post(
  "/",
  writingAssistantController.generateAssistantResponse
);

export default writingAssistantRouter;
